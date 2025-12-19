'use client';

import { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import MarketplaceCard, { MarketplaceItem } from '@/components/marketplace/MarketplaceCard';

interface ThemeOfMonthSectionProps {
    themeOfMonth: {
        collection: any;
        resources: MarketplaceItem[];
    };
}

export default function ThemeOfMonthSection({ themeOfMonth }: ThemeOfMonthSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            checkScroll();
            scrollContainer.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                scrollContainer.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://fr.egw.news/_next/image?url=https%3A%2F%2Fegw.news%2Fuploads%2Fnews%2F1%2F17%2F1763441993862_1763441993862.webp&w=1920&q=75)',
                }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#032125]/95 via-[#032125]/80 to-[#032125]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#032125] via-transparent to-[#032125]/50" />

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header - Responsive Layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-[#109EB1] rounded-full">
                            <span className="text-xs font-hebden text-[#032125] uppercase tracking-wider">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    {/* Navigation Arrows - Below on mobile (right-aligned), same line on desktop */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full border transition-all ${canScrollLeft
                                ? 'bg-[#06363D] border-[#084B54] text-[#C7F4FA] hover:bg-[#109EB1] hover:border-[#109EB1]'
                                : 'bg-[#032125] border-[#032125] text-[#C7F4FA]/20 cursor-not-allowed'
                                }`}
                            aria-label="Scroll left"
                        >
                            <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-full border transition-all ${canScrollRight
                                ? 'bg-[#06363D] border-[#084B54] text-[#C7F4FA] hover:bg-[#109EB1] hover:border-[#109EB1]'
                                : 'bg-[#032125] border-[#032125] text-[#C7F4FA]/20 cursor-not-allowed'
                                }`}
                            aria-label="Scroll right"
                        >
                            <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <Icon icon="mdi:trophy" className="w-6 h-6 text-[#109EB1]" />
                    <h2 className="font-hebden text-3xl sm:text-4xl text-[#C7F4FA]">
                        {themeOfMonth.collection.title || 'Theme of the Month'}
                    </h2>
                </div>
                {themeOfMonth.collection.metadata?.themeName && (
                    <p className="text-lg font-hebden text-[#15C8E0] mb-2">
                        {themeOfMonth.collection.metadata.themeName}
                    </p>
                )}
                {themeOfMonth.collection.description && (
                    <p className="text-sm text-[#C7F4FA]/70 font-nunito max-w-lg mb-8">
                        {themeOfMonth.collection.description}
                    </p>
                )}

                {/* Cards */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {themeOfMonth.resources.map((item: MarketplaceItem) => (
                        <div key={item.id} className="min-w-[360px] sm:min-w-[420px]">
                            <Link href={`/${item.type?.toLowerCase() || 'mods'}/${item.slug}`} className="block">
                                <MarketplaceCard item={item} viewMode="grid" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* View All Link */}
                {themeOfMonth.collection.metadata?.tagSlug && (
                    <div className="flex justify-center mt-6">
                        <Link
                            href={`/mods?tag=${themeOfMonth.collection.metadata.tagSlug}`}
                            className="px-6 py-2.5 bg-[#06363D]/80 hover:bg-[#109EB1] border border-[#109EB1]/50 text-[#C7F4FA] font-hebden text-sm rounded-full transition-all"
                        >
                            View all {themeOfMonth.collection.metadata.themeName || 'themed'} content →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
