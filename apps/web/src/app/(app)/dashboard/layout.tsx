import type { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Manage your Orbis profile, resources, teams, and settings.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
