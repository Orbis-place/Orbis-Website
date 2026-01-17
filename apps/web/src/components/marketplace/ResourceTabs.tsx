'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Tab {
    id: string;
    label: string;
    href: string;
    count?: number;
}

export interface ResourceTabsProps {
    basePath: string;
    tabs?: Tab[];
    commentCount?: number;
    dependencyCount?: number;
    galleryCount?: number;
    modCount?: number;
    isModpack?: boolean;
}

const defaultTabs: Tab[] = [
    { id: 'description', label: 'Description', href: '' },
    { id: 'comments', label: 'Comments', href: '/comments' },
    { id: 'gallery', label: 'Gallery', href: '/gallery' },
    { id: 'versions', label: 'Versions', href: '/versions' },
    { id: 'dependencies', label: 'Dependencies', href: '/dependencies' },
];

export default function ResourceTabs({ basePath, tabs = defaultTabs, commentCount, dependencyCount, galleryCount, modCount, isModpack }: ResourceTabsProps) {
    const pathname = usePathname();

    const isActive = (tab: Tab) => {
        if (tab.href === '') {
            return pathname === basePath;
        }
        return pathname === `${basePath}${tab.href}`;
    };

    // Build tabs list with conditional mods tab for modpacks
    let tabsList = [...tabs];
    if (isModpack) {
        // Insert "Mods" tab after "Description" (index 1)
        const modsTab: Tab = { id: 'mods', label: 'Mods', href: '/mods', count: modCount };
        tabsList.splice(1, 0, modsTab);
    }

    // Filter tabs based on counts and add counts
    const filteredTabs = tabsList
        .filter(tab => {
            // Hide dependencies tab if explicitly 0 dependencies
            if (tab.id === 'dependencies' && dependencyCount === 0) {
                return false;
            }
            // Hide gallery tab if explicitly 0 images
            if (tab.id === 'gallery' && galleryCount === 0) {
                return false;
            }
            return true;
        })
        .map(tab => {
            if (tab.id === 'comments' && commentCount !== undefined) {
                return { ...tab, count: commentCount };
            }
            if (tab.id === 'mods' && modCount !== undefined) {
                return { ...tab, count: modCount };
            }
            return tab;
        });

    return (
        <div className="border-b border-[#084B54] mb-8">
            <nav className="flex gap-8 overflow-x-auto scrollbar-hide">
                {filteredTabs.map((tab) => {
                    const active = isActive(tab);

                    return (
                        <Link
                            key={tab.id}
                            href={`${basePath}${tab.href}`}
                            className={`
                                py-4 whitespace-nowrap font-hebden font-bold text-base transition-all relative flex items-center gap-2
                                ${active
                                    ? 'text-[#109EB1]'
                                    : 'text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                                }
                            `}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-[#109EB1]/20 text-[#109EB1]' : 'bg-[#084B54] text-[#C7F4FA]/60'}`}>
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

