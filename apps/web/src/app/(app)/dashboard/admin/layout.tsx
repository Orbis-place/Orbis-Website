import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

async function getCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            credentials: 'include',
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch (error) {
        return null;
    }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();

    // Check if user is authenticated and has required role
    const allowedRoles: UserRole[] = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

    if (!user || !allowedRoles.includes(user.role)) {
        redirect('/dashboard');
    }

    return <>{children}</>;
}
