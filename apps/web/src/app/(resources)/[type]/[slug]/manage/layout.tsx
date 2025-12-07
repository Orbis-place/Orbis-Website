'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { cn } from '@/lib/utils';
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

    const sidebarItems = [
        {
            id: 'general',
            label: 'General',
            icon: 'mdi:cog',
            href: basePath,
            exact: true
        },
        {
            id: 'description',
            label: 'Description',
            icon: 'mdi:text-box-edit',
            href: `${basePath}/description`
        },
        {
            id: 'license',
            label: 'License',
            icon: 'mdi:license',
            href: `${basePath}/license`
        },
        {
            id: 'links',
            label: 'Links',
            icon: 'mdi:link',
            href: `${basePath}/links`
        },
        {
            id: 'contributors',
            label: 'Contributors',
            icon: 'mdi:account-group',
            href: `${basePath}/contributors`
        },
        {
            id: 'versions',
            label: 'Versions',
            icon: 'mdi:history',
            href: `${basePath}/versions`
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
                                <h2 className="font-hebden text-lg font-semibold text-foreground">
                                    {resourceName || 'Loading...'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/${type}/${slug}`}
                                        className="inline-flex items-center gap-1.5 text-sm font-nunito text-primary hover:underline"
                                    >
                                        <Icon icon="mdi:eye" width="16" height="16" />
                                        View Page
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-hebden text-sm font-semibold text-foreground/60 mb-2 px-3">
                                    Settings
                                </h3>
                                <ul className="space-y-1">
                                    {sidebarItems.map((item) => {
                                        const isActive = item.exact
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
