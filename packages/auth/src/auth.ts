import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { prisma } from "@repo/db";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import { admin } from "better-auth/plugins";

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
                skipStateCookieCheck: process.env.NODE_ENV === 'development' // For testing purposes only
            },
            advanced: {
                disableCSRFCheck: process.env.NODE_ENV === 'development', // For testing purposes only
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
                        before: async (user) => {
                            // Check if username already exists (case-insensitive)
                            const existingUser = await prisma.user.findFirst({
                                where: {
                                    username: {
                                        equals: user.username,
                                        mode: 'insensitive'
                                    }
                                }
                            });

                            // If username exists, add a suffix
                            if (existingUser) {
                                let suffix = 2;
                                let newUsername = `${user.username}_${suffix}`;

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
                                    newUsername = `${user.username}_${suffix}`;
                                }

                                return {
                                    data: {
                                        ...user,
                                        username: newUsername
                                    }
                                };
                            }

                            return {
                                data: user
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
                admin({
                    adminRoles: ["ADMIN", "SUPER_ADMIN"],
                    defaultRole: "USER",
                })
            ]
        });
    }
    return authInstance;
};

export const auth = getAuth(); // Export compatible