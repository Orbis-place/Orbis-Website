import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Resources',
    description: 'Manage your Hytale mods, prefabs, worlds and other resources.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
