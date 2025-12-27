'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { notFound, useRouter } from 'next/navigation';

interface ManageLayoutProps {
    children: React.ReactNode;
}

export default function TeamManageLayout({ children }: ManageLayoutProps) {
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const teamName = params.teamName as string;

    const [teamDisplayName, setTeamDisplayName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const basePath = `/team/${teamName}/manage`;

    // Fetch team name
    useEffect(() => {
        const fetchTeamName = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/${teamName}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setTeamDisplayName(data.name);
                } else if (response.status === 404) {
                    notFound();
                } else if (response.status === 403) {
                    // User doesn't have permission to manage this team
                    router.push(`/team/${teamName}`);
                }
            } catch (error) {
                console.error('Failed to fetch team name:', error);
            } finally {
                setLoading(false);
            }
        };

        if (teamName) {
            fetchTeamName();
        }
    }, [teamName, router]);

    const sidebarGroups = [
        {
            title: 'Settings',
            items: [
                {
                    id: 'general',
                    label: 'General',
                    icon: 'mdi:cog',
                    href: basePath,
                    exact: true
                }
            ]
        },
        {
            title: 'Content',
            items: [
                {
                    id: 'resources',
                    label: 'Resources',
                    icon: 'mdi:package-variant',
                    href: `${basePath}/resources`,
                    exact: false
                },
                {
                    id: 'servers',
                    label: 'Servers',
                    icon: 'mdi:server',
                    href: `${basePath}/servers`,
                    exact: false
                },
                {
                    id: 'showcase',
                    label: 'Showcase',
                    icon: 'mdi:image-multiple',
                    href: `${basePath}/showcase`,
                    exact: false
                }
            ]
        },
        {
            title: 'Team',
            items: [
                {
                    id: 'members',
                    label: 'Members',
                    icon: 'mdi:account-group',
                    href: `${basePath}/members`,
                    exact: false
                }
            ]
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="bg-secondary/30 rounded-lg p-4 space-y-6">
                            <div className="space-y-3">
                                <Badge variant="secondary" className="w-fit gap-1.5 font-nunito text-xs">
                                    <Icon icon="mdi:account-group" width="14" height="14" />
                                    Team
                                </Badge>
                                <h2 className="font-hebden text-lg font-semibold text-foreground">
                                    {teamDisplayName || 'Loading...'}
                                </h2>
                            </div>

                            {sidebarGroups.map((group) => (
                                <div key={group.title}>
                                    <h3 className="font-hebden text-sm font-semibold text-foreground/60 mb-2 px-3">
                                        {group.title}
                                    </h3>
                                    <ul className="space-y-1">
                                        {group.items.map((item) => {
                                            const isActive = item.exact === true
                                                ? pathname === item.href
                                                : pathname.startsWith(item.href);

                                            return (
                                                <li key={item.id}>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-nunito',
                                                            isActive
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-foreground hover:bg-secondary/50'
                                                        )}
                                                    >
                                                        <Icon icon={item.icon} width="20" height="20" />
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
