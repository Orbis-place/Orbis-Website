'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

const adminNav = [
    {
        section: 'Overview',
        items: [
            {
                name: 'Dashboard',
                href: '/admin',
                icon: 'mdi:view-dashboard',
            },
        ],
    },
    {
        section: 'Moderation',
        items: [
            {
                name: 'Moderation Queue',
                href: '/admin/moderation',
                icon: 'mdi:shield-check',
            },
        ],
    },
    {
        section: 'Management',
        requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
        items: [
            {
                name: 'Users',
                href: '/admin/users',
                icon: 'mdi:account-supervisor',
                requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
            },
            {
                name: 'Content',
                href: '/admin/content',
                icon: 'mdi:folder-cog',
                requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
            },
        ],
    },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, hasRole } = useUser();

    // Filter sections and items based on user role
    const filteredNav = adminNav.map(section => {
        // Check if section has role requirements
        const sectionRequiredRoles = (section as any).requiredRoles;
        if (sectionRequiredRoles && (!user || !hasRole(sectionRequiredRoles))) {
            return null;
        }

        // Filter items based on role requirements
        const filteredItems = section.items.filter(item => {
            const itemRequiredRoles = (item as any).requiredRoles;
            if (!itemRequiredRoles) return true;
            return user && hasRole(itemRequiredRoles);
        });

        // Only return section if it has visible items
        if (filteredItems.length === 0) return null;

        return {
            ...section,
            items: filteredItems,
        };
    }).filter(Boolean);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="bg-secondary/30 rounded-lg p-4 space-y-6">
                            {/* Header */}
                            <div className="pb-4 border-b border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon icon="mdi:shield-crown" width="24" height="24" className="text-primary" />
                                    <h2 className="font-hebden text-xl font-semibold text-foreground">
                                        Admin Panel
                                    </h2>
                                </div>
                                <p className="font-nunito text-xs text-muted-foreground">
                                    Platform administration
                                </p>
                            </div>

                            {/* Navigation */}
                            {filteredNav.map((section, idx) => (
                                <div key={idx}>
                                    <h3 className="font-hebden text-sm font-semibold text-foreground/60 mb-2 px-3">
                                        {section!.section}
                                    </h3>
                                    <ul className="space-y-1">
                                        {section!.items.map((item) => {
                                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                            return (
                                                <li key={item.href}>
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
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}

                            {/* Back to Dashboard */}
                            <div className="pt-4 border-t border-border/30">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-nunito text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                >
                                    <Icon icon="mdi:arrow-left" width="20" height="20" />
                                    Back to Dashboard
                                </Link>
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
