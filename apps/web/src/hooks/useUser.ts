'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    image: string | null;
    role: UserRole;
    createdAt: string;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setUser(null);
                    return;
                }
                throw new Error('Failed to fetch user');
            }

            const data = await response.json();
            setUser(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const hasRole = (requiredRoles: UserRole[]) => {
        if (!user) return false;
        return requiredRoles.includes(user.role);
    };

    const isModerator = () => hasRole(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
    const isAdmin = () => hasRole(['ADMIN', 'SUPER_ADMIN']);
    const isSuperAdmin = () => hasRole(['SUPER_ADMIN']);

    return {
        user,
        loading,
        error,
        hasRole,
        isModerator,
        isAdmin,
        isSuperAdmin,
        refetch: fetchUser,
    };
}
