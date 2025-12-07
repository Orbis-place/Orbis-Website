import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Servers',
    description: 'Manage your Hytale servers on Orbis.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ServersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
