import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { headers } from "next/headers";

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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionFromBackend();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar session={session} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}