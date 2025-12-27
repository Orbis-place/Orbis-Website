'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Tab {
    id: string;
    label: string;
    href: string;
    count?: number;
}

export interface UserProfileTabsProps {
    username: string;
    resourceCount: number;
    serverCount: number;
    showcaseCount?: number;
}

export default function UserProfileTabs({ username, resourceCount, serverCount, showcaseCount }: UserProfileTabsProps) {
    const pathname = usePathname();

    const tabs: Tab[] = [
        { id: 'resources', label: 'Resources', href: `/users/${username}/resources`, count: resourceCount },
        { id: 'servers', label: 'Servers', href: `/users/${username}/servers`, count: serverCount },
        { id: 'showcase', label: 'Showcase', href: `/users/${username}/showcase`, count: showcaseCount },
        { id: 'activity', label: 'Activity', href: `/users/${username}/activity` },
    ];

    const isActive = (tab: Tab) => {
        const normalizedPathname = pathname?.toLowerCase();
        return normalizedPathname === tab.href.toLowerCase();
    };

    return (
        <div className="border-b border-[#084B54] mb-8">
            <nav className="flex gap-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const active = isActive(tab);

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`
                                py-4 whitespace-nowrap font-hebden font-bold text-base transition-all relative
                                ${active
                                    ? 'text-[#109EB1]'
                                    : 'text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                                }
                            `}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#109EB1]/20 text-[#109EB1]">
                                    {tab.count}
                                </span>
                            )}
                            {active && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#109EB1]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
