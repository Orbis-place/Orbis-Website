import {prismaAdapter} from "better-auth/adapters/prisma";
import {betterAuth} from "better-auth";
import {prisma} from "@repo/db";
import {sendResetPasswordEmail, sendVerificationEmail} from "./email";
import {admin} from "better-auth/plugins";

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
                ? ["https://dev.orbis.place", "https://orbis.place"]
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
                            secure: true,
                            httpOnly: true,
                            path: '/',
                        }
                    },
                    state: {
                        attributes: {
                            sameSite: "lax", // TODO: To configure based on environment
                            secure: false,
                        }
                    }
                }
            },
            emailAndPassword: {
                enabled: true,
                requireEmailVerification: true,
                sendResetPassword: async ({user, url, token}, request) => {
                    await sendResetPasswordEmail(user.email, url);
                },
            },
            emailVerification: {
                sendVerificationEmail: async ({user, url, token}) => {
                    await sendVerificationEmail(user.email, url);
                },
                sendOnSignUp: true,
                autoSignInAfterVerification: true,
                expiresIn: 3600,
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