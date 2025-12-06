import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    const { username } = params;

    try {
        const response = await fetch(`${API_URL}/users/username/${username}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'User Not Found',
                description: 'The requested user profile could not be found on Orbis.',
            };
        }

        const user = await response.json();
        const displayName = user.displayName || user.username;
        const description = user.bio || `View ${displayName}'s profile on Orbis. ${user._count?.ownedResources || 0} resources, ${user._count?.followers || 0} followers.`;

        return {
            title: `${displayName} (@${user.username})`,
            description: description,
            openGraph: {
                title: `${displayName} (@${user.username}) - Orbis`,
                description: description,
                type: 'profile',
                url: `/users/${username}`,
                images: user.image ? [
                    {
                        url: user.image,
                        width: 400,
                        height: 400,
                        alt: `${displayName}'s profile picture`,
                    }
                ] : [],
            },
            twitter: {
                card: 'summary',
                title: `${displayName} (@${user.username})`,
                description: description,
                images: user.image ? [user.image] : [],
            },
        };
    } catch (error) {
        return {
            title: username,
            description: `View ${username}'s profile on Orbis, the ultimate Hytale community hub.`,
        };
    }
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
