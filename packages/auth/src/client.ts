import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    basePath: '/auth',
    plugins: [adminClient()],
});

export const { useSession } = authClient;