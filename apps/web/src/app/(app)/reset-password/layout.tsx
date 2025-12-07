import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Create a new password for your Orbis account.',
    openGraph: {
        title: 'Reset Password - Orbis',
        description: 'Create a new password for your Orbis account.',
        type: 'website',
        url: '/reset-password',
    },
    twitter: {
        title: 'Reset Password - Orbis',
        description: 'Create a new password for your Orbis account.',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
