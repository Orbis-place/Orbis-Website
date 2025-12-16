import { createAuthClient } from "better-auth/react";
import { adminClient, apiKeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    basePath: '/auth',
    plugins: [adminClient(), apiKeyClient()],
});

export const { useSession } = authClient;