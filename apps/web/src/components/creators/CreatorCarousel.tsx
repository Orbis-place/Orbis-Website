'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CreatorCard from './CreatorCard';
import { Creator } from './types';

interface CreatorCarouselProps {
    title: string;
    creators: Creator[];
    tabs?: string[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function CreatorCarousel({
    title,
    creators,
    tabs,
    activeTab,
    onTabChange,
}: CreatorCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320; // Card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="mb-6">
            {/* Header with title and tabs */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="font-hebden text-xl text-[#C7F4FA]">{title}</h2>

                    {tabs && tabs.length > 0 && (
                        <div className="flex gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => onTabChange?.(tab)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                        ? 'bg-[#109EB1] text-[#C7F4FA]'
                                        : 'bg-[#032125] text-[#C7F4FA]/70 hover:text-[#C7F4FA]'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation arrows */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${canScrollLeft
                            ? 'border-[#084B54] text-[#C7F4FA] hover:bg-[#084B54]'
                            : 'border-[#084B54]/50 text-[#C7F4FA]/30 cursor-not-allowed'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${canScrollRight
                            ? 'border-[#084B54] text-[#C7F4FA] hover:bg-[#084B54]'
                            : 'border-[#084B54]/50 text-[#C7F4FA]/30 cursor-not-allowed'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Scrollable cards container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {creators.map((creator) => (
                    <div
                        key={creator.id}
                        className="flex-shrink-0 w-[300px]"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <CreatorCard creator={creator} />
                    </div>
                ))}
            </div>
        </div>
    );
}
