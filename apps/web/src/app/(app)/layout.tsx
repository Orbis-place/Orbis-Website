import Navbar from '../../components/Navbar';
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
        <>
            <Navbar session={session} />
            {children}
        </>
    );
}