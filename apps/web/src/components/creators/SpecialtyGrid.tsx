'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { RESOURCE_CATEGORIES, formatNumber } from './types';
import { fetchTopCreatorsByCategory, type Creator } from '@/lib/api/discovery';

const categoryIcons: Record<string, string> = {
    'mods': 'mdi:puzzle',
    'modpacks': 'mdi:package-variant',
    'worlds': 'mdi:earth',
    'plugins': 'mdi:power-plug',
    'asset-packs': 'mdi:palette',
    'prefabs': 'mdi:cube-outline',
    'data-packs': 'mdi:database',
    'tools-scripts': 'mdi:wrench',
};

// Map category IDs to match API response
const categoryIdMap: Record<string, string> = {
    'mods': 'mod',
    'modpacks': 'modpack',
    'worlds': 'world',
    'plugins': 'plugin',
    'asset-packs': 'asset-pack',
    'prefabs': 'prefab',
    'data-packs': 'data-pack',
    'tools-scripts': 'tools-scripts',
};

interface SpecialtyCardProps {
    categoryId: string;
    categoryLabel: string;
    creator: Creator | null;
}

function SpecialtyCard({ categoryId, categoryLabel, creator }: SpecialtyCardProps) {
    if (!creator) {
        return (
            <div className="relative bg-[#06363D] border border-[#084B54] rounded-[20px] p-5 opacity-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#109EB1]/10 border border-[#109EB1]/30 flex items-center justify-center">
                        <Icon
                            icon={categoryIcons[categoryId] || 'mdi:cube'}
                            className="w-5 h-5 text-[#109EB1]"
                        />
                    </div>
                    <h3 className="font-hebden text-lg text-[#C7F4FA]">
                        {categoryLabel}
                    </h3>
                </div>
                <p className="text-xs text-[#C7F4FA]/40">No creators yet</p>
            </div>
        );
    }

    const initials = (creator.displayName || creator.username)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Link
            href={`/user/${creator.username}`}
            className="group relative bg-[#06363D] border border-[#084B54] rounded-[20px] p-5 hover:border-[#109EB1] transition-all duration-300 hover:-translate-y-1"
        >
            {/* Category Icon & Label */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#109EB1]/10 border border-[#109EB1]/30 flex items-center justify-center group-hover:bg-[#109EB1]/20 transition-colors">
                    <Icon
                        icon={categoryIcons[categoryId] || 'mdi:cube'}
                        className="w-5 h-5 text-[#109EB1]"
                    />
                </div>
                <h3 className="font-hebden text-lg text-[#C7F4FA] group-hover:text-[#109EB1] transition-colors">
                    {categoryLabel}
                </h3>
            </div>

            {/* Top Creator */}
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#109EB1] to-[#06363D] flex items-center justify-center border-2 border-[#084B54] flex-shrink-0">
                    {creator.image ? (
                        <img
                            src={creator.image}
                            alt={creator.displayName || creator.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="font-hebden text-sm text-[#C7F4FA]">
                            {initials}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#109EB1] mb-0.5">Top Creator</p>
                    <p className="font-hebden text-sm text-[#C7F4FA] truncate">@{creator.username}</p>
                </div>

                <div className="text-right">
                    <p className="font-hebden text-sm text-[#C7F4FA]">{formatNumber(creator.stats.downloads)}</p>
                    <p className="text-[10px] text-[#C7F4FA]/50">downloads</p>
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon icon="mdi:arrow-right" className="w-5 h-5 text-[#109EB1]" />
            </div>
        </Link>
    );
}

export default function SpecialtyGrid() {
    const [topByCategory, setTopByCategory] = useState<Record<string, Creator | null>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTopCreators() {
            try {
                const response = await fetchTopCreatorsByCategory();
                console.log('Top creators by category response:', response);
                console.log('Keys in topByCategory:', Object.keys(response.topByCategory));
                setTopByCategory(response.topByCategory);
            } catch (error) {
                console.error('Failed to fetch top creators by category:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadTopCreators();
    }, []);

    return (
        <section className="pt-8">
            <div className="flex items-center gap-3 mb-6">
                <Icon icon="mdi:view-grid" className="w-6 h-6 text-[#109EB1]" />
                <h2 className="font-hebden text-2xl sm:text-3xl text-[#C7F4FA]">
                    Browse by Specialty
                </h2>
            </div>
            <p className="text-[#C7F4FA]/60 mb-8 max-w-2xl">
                Find creators who excel in specific areas. Each category showcases the top creator in that specialty.
            </p>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {RESOURCE_CATEGORIES.map((category) => (
                        <div key={category.id} className="bg-[#06363D] border border-[#084B54] rounded-[20px] p-5 animate-pulse">
                            <div className="h-10 bg-[#084B54] rounded mb-4"></div>
                            <div className="h-10 bg-[#084B54] rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {RESOURCE_CATEGORIES.map((category) => {
                        const apiKey = categoryIdMap[category.id] || category.id;
                        const creator = topByCategory[apiKey] || null;
                        return (
                            <SpecialtyCard
                                key={category.id}
                                categoryId={category.id}
                                categoryLabel={category.label}
                                creator={creator}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
}
