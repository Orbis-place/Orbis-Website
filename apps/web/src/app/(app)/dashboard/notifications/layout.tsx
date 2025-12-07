import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notifications',
    description: 'View and manage your notifications.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
