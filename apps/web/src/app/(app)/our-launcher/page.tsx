import type { Metadata } from 'next';
import { LauncherHero } from '@/components/launcher/LauncherHero';
import { ServerManagement } from '@/components/launcher/ServerManagement';
import { ContentBrowser } from '@/components/launcher/ContentBrowser';
import { FileManagement } from '@/components/launcher/FileManagement';
import { Monitoring } from '@/components/launcher/Monitoring';
import { LauncherCTA } from '@/components/launcher/LauncherCTA';

export const metadata: Metadata = {
    title: 'Orbis Launcher - Server Management Made Simple',
    description: 'The ultimate companion for Hytale server management. Create, configure, and launch servers with ease. Browse Orbis content, manage mods, and monitor everything in real-time.',
    openGraph: {
        title: 'Orbis Launcher - Server Management Made Simple',
        description: 'The ultimate companion for Hytale server management. Create, configure, and launch servers with ease.',
        type: 'website',
        url: '/our-launcher',
    },
    twitter: {
        title: 'Orbis Launcher - Server Management Made Simple',
        description: 'The ultimate companion for Hytale server management. Create, configure, and launch servers with ease.',
    },
};

export default function OurLauncherPage() {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <LauncherHero />

            {/* Server Management Section */}
            <ServerManagement />

            {/* Content Browser Section */}
            <ContentBrowser />

            {/* File Management Section */}
            <FileManagement />

            {/* Monitoring Section */}
            <Monitoring />

            {/* Final CTA - Download */}
            <LauncherCTA />
        </div>
    );
}
