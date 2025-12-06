'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Download, Star, Calendar } from 'lucide-react';
import { ViewMode } from './ViewSwitcher';

export interface MarketplaceItem {
    id: number | string;
    title: string;
    author: string;
    authorDisplay: string;
    description: string;
    image: string;
    rating: number;
    likes: string;
    downloads: string;
    date: string;
    tags: string[];
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
            <div className="w-full bg-[#06363D] border border-[#084B54] rounded-[25px] flex flex-col sm:flex-row overflow-hidden h-auto sm:h-[180px]">
                {/* Image */}
                <div className="w-full sm:w-[160px] h-[180px] sm:h-full relative flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                        <div className="px-2 py-1 bg-[#109EB1] rounded-[36px] w-fit">
                            <span className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]">
                                {itemType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4">
                    <div className="flex-1">
                        <h3 className="font-hebden font-semibold text-base sm:text-xl leading-5 sm:leading-6 text-[#C7F4FA] mb-1 break-words">
                            {item.title}
                        </h3>
                        <Link
                            href={`/users/${item.author}`}
                            className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            by <span className="text-[#109EB1] hover:underline">{item?.author || item.authorDisplay}</span>
                        </Link>
                        <p className="font-nunito text-xs sm:text-sm leading-[18px] sm:leading-[20px] text-[#C7F4FA] line-clamp-2 mt-2">
                            {item.description}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 sm:gap-6">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-[#C7F4FA]/50 text-[#C7F4FA]/50" />
                            <span className="font-hebden font-semibold text-xs text-[#C7F4FA]/50">
                                {item.rating}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Download className="w-4 h-4 text-[#C7F4FA]/50" />
                            <span className="font-hebden font-semibold text-xs text-[#C7F4FA]/50">
                                {item.downloads}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 self-end sm:self-auto">
                        <button className="w-9 h-9 bg-[#C7F4FA] rounded-full flex items-center justify-center">
                            <Heart className="w-[11px] h-[11px] text-[#109EB1]" />
                        </button>
                        <button className="w-9 h-9 bg-[#109EB1] rounded-full flex items-center justify-center">
                            <Download className="w-4 h-4 text-[#C7F4FA]" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Gallery View - Compact grid
    if (viewMode === 'gallery') {
        return (
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden">
                {/* Image */}
                <div className="w-full aspect-video relative">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <div className="relative z-10 p-3 flex justify-between">
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
                        href={`/users/${item.author}`}
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
        <div className="h-auto sm:h-[233px] bg-[#06363D] border border-[#084B54] rounded-[25px] flex flex-col sm:flex-row overflow-hidden">
            <div className="w-full sm:w-[196px] h-[180px] sm:h-full relative flex flex-col justify-between p-[15px]">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <div className="flex justify-between items-center relative z-10">
                    <div className="px-2 py-1 bg-[#109EB1] rounded-[36px]">
                        <span className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]">
                            {itemType}
                        </span>
                    </div>
                    <button className="w-[22px] h-[22px] bg-[#C7F4FA] rounded-full flex items-center justify-center">
                        <Heart className="w-[11px] h-[11px] text-[#109EB1]" />
                    </button>
                </div>
                <button className="w-9 h-9 bg-[#109EB1] border border-[#109EB1] rounded-full flex items-center justify-center self-end relative z-10">
                    <Download className="w-4 h-4 text-[#C7F4FA]" />
                </button>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-3 sm:p-[15px] flex flex-col gap-2 sm:gap-3">
                    <div>
                        <h3 className="font-hebden font-semibold text-base sm:text-xl leading-5 sm:leading-6 text-[#C7F4FA] break-words">
                            {item.title}
                        </h3>
                        <Link
                            href={`/users/${item.author}`}
                            className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            by <span className="text-[#109EB1] hover:underline">{item?.author || item.authorDisplay}</span>
                        </Link>
                    </div>
                    <p className="font-nunito text-sm sm:text-base leading-5 sm:leading-[22px] text-[#C7F4FA] line-clamp-3 flex-1">
                        {item.description}
                    </p>
                    <div className="flex flex-wrap gap-[5px]">
                        {item.tags.map((tag, i) => (
                            <span
                                key={i}
                                className={`px-2 py-0.5 rounded-[5px] font-nunito text-xs leading-4 ${tag.startsWith('+') ? 'bg-transparent text-[#109EB1]' : 'bg-[#C7F4FA]/25 text-[#C7F4FA]'
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center px-2 sm:px-[15px] py-2 sm:py-3 border-t border-[#084B54] gap-1 sm:gap-2">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-[#C7F4FA]/50 text-[#C7F4FA]/50 flex-shrink-0" />
                        <span className="font-hebden font-semibold text-[9px] sm:text-[10px] leading-[14px] text-[#C7F4FA]/50 truncate">
                            {item.rating}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <Heart className="w-3 h-3 sm:w-[13px] sm:h-[13px] fill-[#C7F4FA]/50 text-[#C7F4FA]/50 flex-shrink-0" />
                        <span className="font-hebden font-semibold text-[9px] sm:text-[10px] leading-[14px] text-[#C7F4FA]/50 truncate">
                            {item.likes}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <Download className="w-3 h-3 sm:w-[15px] sm:h-[15px] text-[#C7F4FA]/50 flex-shrink-0" />
                        <span className="font-hebden font-semibold text-[9px] sm:text-[10px] leading-[14px] text-[#C7F4FA]/50 truncate">
                            {item.downloads}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <Calendar className="w-3 h-3 sm:w-[14px] sm:h-[14px] text-[#C7F4FA]/50 flex-shrink-0" />
                        <span className="font-hebden font-semibold text-[9px] sm:text-[10px] leading-[14px] text-[#C7F4FA]/50 truncate">
                            {item.date}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
