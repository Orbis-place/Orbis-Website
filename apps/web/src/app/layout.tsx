import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Nunito } from 'next/font/google';
import './globals.css';
import { headers } from "next/headers";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from '@/components/ui/sonner';

const hebden = localFont({
    src: '../fonts/Hebden.woff2',
    variable: '--font-hebden',
    display: 'swap',
});

const nunito = Nunito({
    subsets: ['latin'],
    variable: '--font-nunito',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Orbis - Hytale Community Hub',
        template: '%s | Orbis.place'
    },
    description: 'The ultimate Hytale community hub. Discover servers, browse marketplace for plugins & mods. Open-source platform for players and creators.',
    keywords: ['Hytale', 'mods', 'plugins', 'servers', 'marketplace', 'community', 'modding', 'gaming', 'open-source'],
    authors: [{ name: 'Orbis Team' }],
    creator: 'Orbis',
    publisher: 'Orbis',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://orbis.place'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: 'Orbis',
        title: 'Orbis - Hytale Community Hub',
        description: 'The ultimate Hytale community hub. Discover servers, browse marketplace for plugins & mods. Open-source platform for players and creators.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Orbis - Hytale Community Hub',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Orbis - Hytale Community Hub',
        description: 'The ultimate Hytale community hub. Discover servers, browse marketplace for plugins & mods.',
        creator: '@OrbisPlace',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
};

async function getSessionFromBackend() {
    try {
        const headersList = await headers();
        const cookie = headersList.get('cookie');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-session`, {
            headers: {
                'Cookie': cookie || '',
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        return null;
    }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionFromBackend();

    return (
        <html lang="en">
            <body className={`${hebden.variable} ${nunito.variable}`}>
                <SessionProvider initialSession={session}>
                    {children}
                </SessionProvider>
                <Toaster />
            </body>
        </html>
    );
}
