import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Teams',
    description: 'Manage your teams and collaborations on Orbis.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
