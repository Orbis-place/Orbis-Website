'use client';

import { usePathname } from 'next/navigation';
import AuthPage from './AuthPage';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return <AuthPage />;
    }

    return <>{children}</>;
}

