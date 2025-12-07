import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your Orbis account to access your profile, manage your resources, and connect with the Hytale community.',
    openGraph: {
        title: 'Sign In to Orbis',
        description: 'Sign in to your Orbis account to access your profile and manage your Hytale resources.',
        type: 'website',
        url: '/login',
    },
    twitter: {
        title: 'Sign In to Orbis',
        description: 'Sign in to your Orbis account to access your profile and manage your Hytale resources.',
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
