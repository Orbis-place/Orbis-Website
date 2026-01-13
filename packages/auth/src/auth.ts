import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError, getSessionFromCtx } from "better-auth/api";
import { prisma } from "@repo/db";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import { admin, apiKey } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { redis } from "./redis";

const statement = {
    ...defaultStatements,
    resource: ["create", "read", "update", "delete"]
} as const;

const ac = createAccessControl(statement);

const USER = ac.newRole({
    resource: ["read"],
});
const MODERATOR = ac.newRole({
    resource: ["read", "update"],
});
const ADMIN = ac.newRole({
    ...adminAc.statements,
});
const SUPER_ADMIN = ac.newRole({
    ...adminAc.statements,
});

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = () => {
    if (!authInstance) {
        authInstance = betterAuth({
            user: {
                fields: {
                    name: "username"
                },
            },
            trustedOrigins: process.env.NODE_ENV === 'production'
                ? ["https://dev.orbis.place", "https://orbis.place", "https://www.orbis.place"]
                : ["http://localhost:3001"],
            baseURL: process.env.BETTER_AUTH_URL,
            secret: process.env.BETTER_AUTH_SECRET!,
            basePath: '/auth',
            account: {
                skipStateCookieCheck: process.env.NODE_ENV === 'development'
            },
            hooks: {
                before: createAuthMiddleware(async (ctx) => {
                    if (ctx.path === '/api-key/create') {
                        const session = await getSessionFromCtx(ctx);

                        if (!session?.user?.id) {
                            throw new Error('Unauthorized: No valid session found');
                        }

                        const existingKeys = await prisma.apikey.count({
                            where: {
                                userId: session.user.id,
                            },
                        });

                        if (existingKeys >= 5) {
                            throw new Error('You can only create up to 5 API keys');
                        }
                    }

                    return ctx;
                }),
            },
            advanced: {
                disableCSRFCheck: process.env.NODE_ENV === 'development',
                cookies: {
                    session_token: {
                        name: "orbis_session_token",
                        attributes: {
                            domain: process.env.NODE_ENV === 'production'
                                ? '.orbis.place'
                                : 'localhost',
                            sameSite: "lax",
                            secure: process.env.NODE_ENV === 'production',
                            httpOnly: true,
                            path: '/',
                        }
                    },
                    state: {
                        name: "orbis_state",
                        attributes: {
                            sameSite: "lax",
                            secure: process.env.NODE_ENV === 'production',
                            httpOnly: true,
                            path: '/',
                        }
                    }
                }
            },
            emailAndPassword: {
                enabled: true,
                requireEmailVerification: true,
                sendResetPassword: async ({ user, url, token }, request) => {
                    const frontendUrl = `${process.env.BETTER_AUTH_URL}/auth/verify-email?token=${token}&callbackURL=${process.env.NODE_ENV === 'production' ? 'https://orbis.place/' : 'http://localhost:3001/'}`;
                    sendResetPasswordEmail(user.email, frontendUrl);
                },
            },
            emailVerification: {
                sendVerificationEmail: async ({ user, url, token }) => {
                    const frontendUrl = `${process.env.BETTER_AUTH_URL}/auth/verify-email?token=${token}&callbackURL=${process.env.NODE_ENV === 'production' ? 'https://orbis.place/' : 'http://localhost:3001/'}`;
                    sendVerificationEmail(user.email, frontendUrl);
                },
                sendOnSignUp: true,
                autoSignInAfterVerification: true,
                expiresIn: 3600,
                callbackURL: process.env.NODE_ENV === 'production'
                    ? 'https://orbis.place/'
                    : 'http://localhost:3001/',
            },
            databaseHooks: {
                user: {
                    create: {
                        before: async (user: any) => {
                            // Get the base name for username - try name first, then username, then email prefix
                            const baseName = user.name || user.username || user.email?.split('@')[0] || 'user';
                            let formattedUsername = baseName.replace(/\s+/g, '').trim().toLowerCase();

                            const existingUser = await prisma.user.findFirst({
                                where: {
                                    username: {
                                        equals: formattedUsername,
                                        mode: 'insensitive'
                                    }
                                }
                            });

                            // If username exists, add a suffix
                            if (existingUser) {
                                let suffix = 2;
                                let newUsername = `${formattedUsername}_${suffix}`;

                                // Keep incrementing suffix until we find an available username
                                while (await prisma.user.findFirst({
                                    where: {
                                        username: {
                                            equals: newUsername,
                                            mode: 'insensitive'
                                        }
                                    }
                                })) {
                                    suffix++;
                                    newUsername = `${formattedUsername}_${suffix}`;
                                }

                                return {
                                    data: {
                                        ...user,
                                        name: newUsername,
                                        username: newUsername
                                    }
                                };
                            }

                            console.log('formatted username', formattedUsername);
                            return {
                                data: {
                                    ...user,
                                    name: formattedUsername,
                                    username: formattedUsername
                                }
                            };
                        },
                    },
                },
            },
            database: prismaAdapter(prisma, {
                provider: "postgresql",
            }),
            socialProviders: {
                discord: {
                    clientId: process.env.DISCORD_CLIENT_ID!,
                    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
                },
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                },
            },
            plugins: [
                apiKey({
                    defaultPrefix: "orb_",
                    enableSessionForAPIKeys: true,
                    rateLimit: {
                        enabled: true,
                        timeWindow: 1000 * 60 * 60,
                        maxRequests: 100,
                    },
                    defaultKeyLength: 64,
                    requireName: true,
                }),
                admin({
                    ac,
                    roles: {
                        USER,
                        MODERATOR,
                        ADMIN,
                        SUPER_ADMIN,
                    },
                    defaultRole: "USER",
                })
            ],
            secondaryStorage: {
                get: async (key) => {
                    return await redis.get(key);
                },
                set: async (key, value, ttl) => {
                    if (ttl) await redis.set(key, value, 'EX', ttl)
                    else await redis.set(key, value);
                },
                delete: async (key) => {
                    await redis.del(key);
                }
            },
            rateLimit: {
                enabled: true,
                storage: "secondary-storage",
                window: 10,
                max: 100,
            },
            session: {
                storeSessionInDatabase: true,
            }
        });
    }
    return authInstance;
};

export const auth = getAuth();