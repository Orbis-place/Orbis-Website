import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Collections',
    description: 'Manage your resource collections.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
