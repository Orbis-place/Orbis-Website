import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: { teamName: string } }): Promise<Metadata> {
    const { teamName } = params;

    try {
        const response = await fetch(`${API_URL}/teams/${teamName}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Team Not Found',
                description: 'The requested team could not be found on Orbis.',
            };
        }

        const team = await response.json();
        const description = team.description || `${team.displayName} is a team on Orbis creating amazing Hytale content. ${team.members?.length || 0} members.`;

        return {
            title: team.displayName,
            description: description,
            openGraph: {
                title: `${team.displayName} - Orbis`,
                description: description,
                type: 'website',
                url: `/teams/${teamName}`,
                images: team.logo ? [
                    {
                        url: team.logo,
                        width: 400,
                        height: 400,
                        alt: `${team.displayName} logo`,
                    }
                ] : [],
            },
            twitter: {
                card: 'summary',
                title: team.displayName,
                description: description,
                images: team.logo ? [team.logo] : [],
            },
        };
    } catch (error) {
        return {
            title: teamName,
            description: `View ${teamName} team on Orbis, the ultimate Hytale community hub.`,
        };
    }
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
