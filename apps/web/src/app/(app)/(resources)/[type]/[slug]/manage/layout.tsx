'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getResourceTypeBySingular, isValidSingularType } from '@/config/resource-types';
import { notFound } from 'next/navigation';

interface ManageLayoutProps {
    children: React.ReactNode;
}

export default function ManageLayout({ children }: ManageLayoutProps) {
    const pathname = usePathname();
    const params = useParams();
    const type = params.type as string;
    const slug = params.slug as string;

    const [resourceName, setResourceName] = useState<string>('');

    // Validate type
    if (!isValidSingularType(type)) {
        notFound();
    }

    const typeConfig = getResourceTypeBySingular(type);
    const basePath = `/${type}/${slug}/manage`;

    // Fetch resource name
    useEffect(() => {
        const fetchResourceName = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${slug}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setResourceName(data.resource.name);
                }
            } catch (error) {
                console.error('Failed to fetch resource name:', error);
            }
        };

        if (slug) {
            fetchResourceName();
        }
    }, [slug]);

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
                    id: 'description',
                    label: 'Description',
                    icon: 'mdi:text-box-edit',
                    href: `${basePath}/description`,
                    exact: false
                },
                {
                    id: 'gallery',
                    label: 'Gallery',
                    icon: 'mdi:image-multiple',
                    href: `${basePath}/gallery`,
                    exact: false
                },
                {
                    id: 'license',
                    label: 'License',
                    icon: 'mdi:license',
                    href: `${basePath}/license`,
                    exact: false
                },
                {
                    id: 'links',
                    label: 'Links',
                    icon: 'mdi:link',
                    href: `${basePath}/links`,
                    exact: false
                }
            ]
        },
        {
            title: 'Management',
            items: [
                {
                    id: 'contributors',
                    label: 'Contributors',
                    icon: 'mdi:account-group',
                    href: `${basePath}/contributors`,
                    exact: false
                },
                {
                    id: 'versions',
                    label: 'Versions',
                    icon: 'mdi:history',
                    href: `${basePath}/versions`,
                    exact: false,
                    disabled: true,
                    badge: 'At release'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="bg-secondary/30 rounded-lg p-4 space-y-6">
                            <div className="space-y-3">
                                <Badge variant="secondary" className="w-fit gap-1.5 font-nunito text-xs">
                                    <Icon icon="mdi:cube" width="14" height="14" />
                                    Resource
                                </Badge>
                                <h2 className="font-hebden text-lg font-semibold text-foreground">
                                    {resourceName || 'Loading...'}
                                </h2>
                            </div>

                            {sidebarGroups.map((group) => (
                                <div key={group.title}>
                                    <h3 className="font-hebden text-sm font-semibold text-foreground/60 mb-2 px-3">
                                        {group.title}
                                    </h3>
                                    <ul className="space-y-1">
                                        {group.items.map((item: any) => {
                                            const isActive = item.exact === true
                                                ? pathname === item.href
                                                : pathname.startsWith(item.href);

                                            const content = (
                                                <>
                                                    <Icon icon={item.icon} width="20" height="20" />
                                                    <span className="flex-1">{item.label}</span>
                                                    {item.badge && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </>
                                            );

                                            return (
                                                <li key={item.id}>
                                                    {item.disabled ? (
                                                        <div
                                                            className={cn(
                                                                'flex items-center gap-3 px-3 py-2 rounded-lg font-nunito',
                                                                'text-foreground/40 cursor-not-allowed'
                                                            )}
                                                        >
                                                            {content}
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-nunito',
                                                                isActive
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'text-foreground hover:bg-secondary/50'
                                                            )}
                                                        >
                                                            {content}
                                                        </Link>
                                                    )}
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
