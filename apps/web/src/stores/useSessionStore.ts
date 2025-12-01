import { create } from 'zustand';
import type { Session } from "@repo/auth";

interface SessionStore {
    session: Session | null;
    isLoading: boolean;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
    session: null,
    isLoading: true,
    setSession: (session) => set({ session, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
}));