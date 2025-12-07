import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create your Orbis account to share your Hytale creations, discover amazing mods, plugins, and connect with the community.',
    openGraph: {
        title: 'Sign Up for Orbis',
        description: 'Create your Orbis account to share your Hytale creations and connect with the community.',
        type: 'website',
        url: '/signup',
    },
    twitter: {
        title: 'Sign Up for Orbis',
        description: 'Create your Orbis account to share your Hytale creations and connect with the community.',
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
