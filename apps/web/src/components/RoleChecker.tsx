'use client';

import { useUser, UserRole } from '@/hooks/useUser';

interface RoleCheckerProps {
    children: React.ReactNode;
    requiredRoles: UserRole[];
    fallback?: React.ReactNode;
}

export function RoleChecker({ children, requiredRoles, fallback = null }: RoleCheckerProps) {
    const { user, loading } = useUser();

    if (loading) {
        return <>{fallback}</>;
    }

    if (!user || !requiredRoles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
