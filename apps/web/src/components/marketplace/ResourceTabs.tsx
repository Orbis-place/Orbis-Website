'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Tab {
    id: string;
    label: string;
    href: string;
}

export interface ResourceTabsProps {
    basePath: string;
    tabs?: Tab[];
}

const defaultTabs: Tab[] = [
    { id: 'description', label: 'Description', href: '' },
    { id: 'gallery', label: 'Gallery', href: '/gallery' },
    { id: 'versions', label: 'Versions', href: '/versions' },
];

export default function ResourceTabs({ basePath, tabs = defaultTabs }: ResourceTabsProps) {
    const pathname = usePathname();

    const isActive = (tab: Tab) => {
        if (tab.href === '') {
            return pathname === basePath;
        }
        return pathname === `${basePath}${tab.href}`;
    };

    return (
        <div className="border-b border-[#084B54] mb-8">
            <nav className="flex gap-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const active = isActive(tab);

                    return (
                        <Link
                            key={tab.id}
                            href={`${basePath}${tab.href}`}
                            className={`
                                py-4 whitespace-nowrap font-hebden font-bold text-base transition-all relative
                                ${active
                                    ? 'text-[#109EB1]'
                                    : 'text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                                }
                            `}
                        >
                            {tab.label}
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
