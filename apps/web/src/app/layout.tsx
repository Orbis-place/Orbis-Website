import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Nunito} from 'next/font/google';
import Navbar from '../components/Navbar';
import './globals.css';
import {headers} from "next/headers";
import {SessionProvider} from "@/components/providers/SessionProvider";

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
    title: 'Orbis',
    description: '<meta name="description" content="The ultimate Hytale community hub. Discover servers, browse marketplace for plugins & mods. Open-source platform for players and creators.">',
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
            console.error('Failed to fetch session, status:', res.status);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Failed to fetch session:', error);
        return null;
    }
}

export default async function RootLayout({children}: { children: React.ReactNode }) {
    const session = await getSessionFromBackend();

    return (
        <html lang="en">
        <body className={`${hebden.variable} ${nunito.variable}`}>
        <SessionProvider initialSession={session}>
            <Navbar session={session}/>
            {children}
        </SessionProvider>
        </body>
        </html>
    );
}