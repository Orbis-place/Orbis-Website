'use client'
import { useEffect, ReactNode } from 'react';
import type { Session } from "@repo/auth";
import { useSession } from "@repo/auth/client";
import { useSessionStore } from "@/stores/useSessionStore";

interface SessionProviderProps {
    children: ReactNode;
    initialSession: Session | null;
}

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
    const { data: session, isPending } = useSession();
    const { setSession, setLoading } = useSessionStore();

    useEffect(() => {
        if (initialSession) {
            setSession(initialSession);
        }
    }, [initialSession, setSession]);

    useEffect(() => {
        if (session !== undefined) {
            setSession(session);
        }
        setLoading(isPending);
    }, [session, isPending, setSession, setLoading]);

    return <>{children}</>;
}