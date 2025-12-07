import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your Orbis account password. Enter your email to receive password reset instructions.',
    openGraph: {
        title: 'Forgot Password - Orbis',
        description: 'Reset your Orbis account password.',
        type: 'website',
        url: '/forgot-password',
    },
    twitter: {
        title: 'Forgot Password - Orbis',
        description: 'Reset your Orbis account password.',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
