import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Top Creators',
    description: 'Discover talented creators in the Hytale community. Find modders, world builders, and more on Orbis.',
};

export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
