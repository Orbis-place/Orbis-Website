'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Download, Star, Calendar } from 'lucide-react';
import { ViewMode } from './ViewSwitcher';
import { EntityAvatar } from '@/components/EntityAvatar';

export interface MarketplaceItem {
    id: number | string;
    slug: string;
    title: string;
    author: string;
    authorDisplay: string;
    isOwnedByTeam?: boolean;
    description: string;
    image: string;
    rating: number;
    likes: string;
    downloads: string;
    date: string;
    updatedAt?: string; // "Updated X weeks ago"
    tags: string[];
    categories: string[];
    remainingCount?: number; // Number of remaining tags/categories not shown
    type?: string; // 'Mod', 'Plugin', 'World', etc.
}

interface MarketplaceCardProps {
    item: MarketplaceItem;
    viewMode: ViewMode;
}

export default function MarketplaceCard({ item, viewMode }: MarketplaceCardProps) {
    const itemType = item.type || 'Item';

    // Row View - Full width list
    if (viewMode === 'row') {
        return (
            <div className="w-full bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden p-4 grid gap-x-4 gap-y-2"
                style={{
                    gridTemplate: '"icon title stats" "icon description stats" "icon tags stats"',
                    gridTemplateColumns: 'min-content 1fr auto',
                    gridTemplateRows: 'min-content 1fr min-content'
                }}>
                {/* Icon/Logo - 96x96 */}
                <div className="w-24 h-24 flex-shrink-0 relative" style={{ gridArea: 'icon' }}>
                    <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-[#032125]">
                        <EntityAvatar
                            src={item.image}
                            name={item.title}
                            variant="resource"
                            className="h-full w-full rounded-[15px]"
                            fallbackClassName="text-3xl rounded-[15px]"
                        />
                    </div>
                </div>

                {/* Title Section */}
                <div style={{ gridArea: 'title' }}>
                    <h2 className="font-hebden font-semibold text-xl leading-6 text-[#C7F4FA] mb-1">
                        {item.title}
                    </h2>
                    <Link
                        href={item.isOwnedByTeam ? `/team/${item.author}` : `/users/${item.author}`}
                        className="font-hebden font-semibold text-sm leading-4 text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        by <span className="text-[#109EB1] hover:underline">{item?.author || item.authorDisplay}</span>
                    </Link>
                </div>

                {/* Description */}
                <p className="font-nunito text-sm leading-5 text-[#C7F4FA]/80 line-clamp-2" style={{ gridArea: 'description' }}>
                    {item.description}
                </p>

                {/* Categories and Tags */}
                <div className="flex flex-wrap gap-2" style={{ gridArea: 'tags' }}>
                    {(item.categories || []).map((category, i) => (
                        <span
                            key={`cat-${i}`}
                            className="px-2.5 py-1 rounded-[6px] font-nunito text-xs leading-4 bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]"
                        >
                            {category}
                        </span>
                    ))}
                    {(item.tags || []).slice(0, 3).map((tag, i) => (
                        <span
                            key={`tag-${i}`}
                            className="px-2.5 py-1 rounded-[6px] font-nunito text-xs leading-4 bg-[#C7F4FA]/25 text-[#C7F4FA]"
                        >
                            {tag}
                        </span>
                    ))}
                    {(item.remainingCount !== undefined && item.remainingCount > 0) && (
                        <span className="px-2.5 py-1 font-nunito text-xs leading-4 text-[#109EB1]">
                            +{item.remainingCount}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-3" style={{ gridArea: 'stats' }}>
                    <div className="flex items-center gap-1.5">
                        <Download className="w-5 h-5 text-[#C7F4FA]/50" />
                        <p className="font-hebden text-sm text-[#C7F4FA]/50 whitespace-nowrap">
                            <strong className="font-semibold text-[#C7F4FA]">{item.downloads}</strong>
                            <span className="ml-1">download{item.downloads !== '1' ? 's' : ''}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Heart className="w-5 h-5 text-[#C7F4FA]/50" />
                        <p className="font-hebden text-sm text-[#C7F4FA]/50 whitespace-nowrap">
                            <strong className="font-semibold text-[#C7F4FA]">{item.likes}</strong>
                            <span className="ml-1">favorite{item.likes !== '1' ? 's' : ''}</span>
                        </p>
                    </div>
                    {item.updatedAt && (
                        <div className="flex items-center gap-1.5 mt-auto">
                            <svg className="w-5 h-5 text-[#C7F4FA]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="font-hebden text-sm text-[#C7F4FA]/50 whitespace-nowrap">{item.updatedAt}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Gallery View - Compact grid
    if (viewMode === 'gallery') {
        return (
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden">
                {/* Image */}
                <div className="w-full aspect-video relative overflow-hidden bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="font-hebden text-6xl text-[#C7F4FA]">
                                {item.title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 p-3 flex justify-between">
                        <div className="px-2 py-1 bg-[#109EB1] rounded-[36px]">
                            <span className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]">
                                {itemType}
                            </span>
                        </div>
                        <button className="w-[22px] h-[22px] bg-[#C7F4FA] rounded-full flex items-center justify-center">
                            <Heart className="w-[11px] h-[11px] text-[#109EB1]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                    <h3 className="font-hebden font-semibold text-sm sm:text-lg leading-5 sm:leading-6 text-[#C7F4FA] mb-1 break-words">
                        {item.title}
                    </h3>
                    <Link
                        href={item.isOwnedByTeam ? `/team/${item.author}` : `/users/${item.author}`}
                        className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        by <span className="text-[#109EB1] hover:underline">{item?.author || item.authorDisplay}</span>
                    </Link>

                    {/* Stats */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#084B54]">
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-[#C7F4FA]/50 text-[#C7F4FA]/50" />
                                <span className="font-hebden text-xs text-[#C7F4FA]/50">{item.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Download className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                                <span className="font-hebden text-xs text-[#C7F4FA]/50">{item.downloads}</span>
                            </div>
                        </div>
                        <button className="w-8 h-8 bg-[#109EB1] rounded-full flex items-center justify-center">
                            <Download className="w-3.5 h-3.5 text-[#C7F4FA]" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View - Default (2 columns)
    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden flex flex-col min-h-48">
            {/* Compact horizontal layout */}
            <div className="flex gap-3 p-3">
                {/* Logo - 96x96 */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-[15px] overflow-hidden bg-[#032125]">
                    <EntityAvatar
                        src={item.image}
                        name={item.title}
                        variant="resource"
                        className="h-full w-full rounded-[15px]"
                        fallbackClassName="text-3xl rounded-[15px]"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-hebden font-semibold text-base leading-5 text-[#C7F4FA] truncate">
                                {item.title}
                            </h3>
                            <Link
                                href={item.isOwnedByTeam ? `/team/${item.author}` : `/users/${item.author}`}
                                className="font-hebden font-semibold text-xs leading-4 text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                by <span className="text-[#109EB1] hover:underline">{item?.author || item.authorDisplay}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="font-nunito text-xs leading-4 text-[#C7F4FA]/70 line-clamp-2 mb-2">
                        {item.description}
                    </p>

                    {/* Categories and Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                        {/* Categories */}
                        {(item.categories || []).map((category, i) => (
                            <span
                                key={`cat-${i}`}
                                className="px-1.5 py-0.5 rounded-[5px] font-nunito text-[11px] leading-4 bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]"
                            >
                                {category}
                            </span>
                        ))}
                        {/* Tags */}
                        {(item.tags || []).slice(0, 3).map((tag, i) => (
                            <span
                                key={`tag-${i}`}
                                className="px-1.5 py-0.5 rounded-[5px] font-nunito text-[11px] leading-4 bg-[#C7F4FA]/25 text-[#C7F4FA]"
                            >
                                {tag}
                            </span>
                        ))}
                        {(item.remainingCount !== undefined && item.remainingCount > 0) && (
                            <span className="px-1.5 py-0.5 font-nunito text-[11px] leading-4 text-[#109EB1]">
                                +{item.remainingCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer stats */}
            <div className="flex justify-between items-center px-3 py-2 border-t border-[#084B54] mt-auto">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-[#C7F4FA]/50 text-[#C7F4FA]/50" />
                        <span className="font-hebden text-xs text-[#C7F4FA]/50">{item.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                        <span className="font-hebden text-xs text-[#C7F4FA]/50">{item.downloads}</span>
                    </div>
                    {item.updatedAt && (
                        <span className="font-hebden text-xs text-[#C7F4FA]/50">{item.updatedAt}</span>
                    )}
                </div>
                <button className="px-3 py-1.5 bg-[#109EB1] hover:bg-[#109EB1]/90 rounded-full flex items-center gap-1.5 transition-colors">
                    <Download className="w-3.5 h-3.5 text-[#C7F4FA]" />
                    <span className="font-hebden font-semibold text-xs text-[#C7F4FA]">Download</span>
                </button>
            </div>
        </div>
    );
}
