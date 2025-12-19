import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Server List',
    description: 'Find and join the best Hytale servers. Browse our server list to discover communities on Orbis.',
};

export default function ServersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
