'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Box, Package, Globe, Plug, Image as ImageIcon, Boxes, Database, Wrench, Download, Users, Star } from 'lucide-react';
import { Creator, formatNumber, RESOURCE_CATEGORIES } from './types';

const CATEGORY_ICONS: Record<string, any> = {
    'mods': Box,
    'modpacks': Package,
    'worlds': Globe,
    'asset-packs': ImageIcon,
    'prefabs': Boxes,
    'data-packs': Database,
};

interface FeaturedCreatorProps {
    creator: Creator;
}

export default function FeaturedCreator({ creator }: FeaturedCreatorProps) {
    const initials = creator.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[24px] p-6 flex flex-col gap-6 h-full">
            {/* Header Section */}
            <div className="flex gap-4 items-center">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gradient-to-br from-[#109EB1] to-[#06363D] flex items-center justify-center border border-[#084B54] shadow-lg">
                        {creator.image ? (
                            <img
                                src={creator.image}
                                alt={creator.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-hebden text-3xl text-[#C7F4FA]">
                                {initials}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-hebden text-2xl text-[#C7F4FA] truncate">
                            {creator.displayName}
                        </h2>
                        <div className="px-2 py-0.5 rounded-full bg-[#109EB1]/20 border border-[#109EB1]/30 text-[10px] text-[#109EB1] font-bold uppercase tracking-wider">
                            Featured
                        </div>
                    </div>
                    <p className="text-sm text-[#C7F4FA]/70 line-clamp-2 mb-3">
                        {creator.bio}
                    </p>

                    {/* Stats inline */}
                    <div className="flex gap-6 text-xs">
                        <div className="flex items-center gap-1.5">
                            <Box className="w-4 h-4 text-[#109EB1]" />
                            <span className="text-[#C7F4FA]/50">Resources:</span>
                            <span className="font-hebden text-[#C7F4FA]">{creator.stats.resources}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Download className="w-4 h-4 text-[#109EB1]" />
                            <span className="text-[#C7F4FA]/50">Downloads:</span>
                            <span className="font-hebden text-[#C7F4FA]">{formatNumber(creator.stats.downloads)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#109EB1]" />
                            <span className="text-[#C7F4FA]/50">Followers:</span>
                            <span className="font-hebden text-[#C7F4FA]">{formatNumber(creator.stats.followers)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Resources Section */}
            {creator.topResources && creator.topResources.length > 0 && (
                <div className="border-t border-[#084B54] pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-hebden text-sm text-[#C7F4FA]/80">Top Resources</h3>
                        <Link href={`/user/${creator.username}`} className="text-[10px] text-[#109EB1] hover:text-[#C7F4FA] transition-colors flex items-center gap-1">
                            VIEW ALL <Icon ssr={true} icon="ph:arrow-right-bold" />
                        </Link>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                        {creator.topResources.map((resource) => {
                            const category = RESOURCE_CATEGORIES.find(c => c.id === resource.category);
                            const CategoryIcon = CATEGORY_ICONS[resource.category] || Box;

                            return (
                                <Link key={resource.id} href={`/resources/${resource.id}`} className="flex-shrink-0 group">
                                    <div className="w-[200px] bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden flex flex-col h-48 hover:border-[#109EB1] transition-all group-hover:-translate-y-1">
                                        {/* Compact horizontal layout */}
                                        <div className="flex gap-3 p-3 flex-1">
                                            {/* Logo - 64x64 */}
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-[15px] overflow-hidden bg-[#032125] border border-[#084B54]/50">
                                                {resource.image ? (
                                                    <img src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <CategoryIcon className="w-8 h-8 text-[#109EB1]/50" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col min-w-0">
                                                {/* Header */}
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-hebden font-semibold text-sm leading-4 text-[#C7F4FA] truncate mb-1">
                                                            {resource.name}
                                                        </h3>
                                                        <span className="px-1.5 py-0.5 rounded-[5px] font-nunito text-[10px] leading-3 bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1] inline-block">
                                                            {category?.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer stats */}
                                        <div className="flex justify-between items-center px-3 py-2 border-t border-[#084B54] mt-auto bg-[#032125]/30">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-[#C7F4FA]/50 text-[#C7F4FA]/50" />
                                                    <span className="font-hebden text-[10px] text-[#C7F4FA]/50">{resource.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Download className="w-3 h-3 text-[#C7F4FA]/50" />
                                                    <span className="font-hebden text-[10px] text-[#C7F4FA]/50">{formatNumber(resource.downloads)}</span>
                                                </div>
                                            </div>
                                            <button className="w-6 h-6 bg-[#109EB1] rounded-full flex items-center justify-center group-hover:bg-[#109EB1]/90 transition-colors">
                                                <Download className="w-3 h-3 text-[#C7F4FA]" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

