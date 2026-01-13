'use client';

import { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

// Map of icon names to Iconify icon strings
const iconMap: Record<string, string> = {
    sparkles: 'mdi:sparkles',
    trophy: 'mdi:trophy',
    package: 'mdi:package-variant',
    download: 'mdi:download',
};

interface ScrollableSectionProps {
    title: string;
    iconName: string;
    link?: string;
    children: React.ReactNode;
}

export default function ScrollableSection({ title, iconName, link, children }: ScrollableSectionProps) {
    const iconString = iconMap[iconName.toLowerCase()] || 'mdi:sparkles';
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
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#109EB1]/10 border border-[#109EB1]/20">
                        <Icon ssr={true} icon={iconString} className="w-5 h-5 text-[#109EB1]" />
                    </div>
                    <h2 className="font-hebden text-2xl text-[#C7F4FA]">{title}</h2>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                    {/* {link && (
                        <Link href={link} className="flex items-center gap-2 text-[#109EB1] hover:text-[#C7F4FA] transition-colors font-hebden text-sm">
                            View All
                        </Link>
                    )} */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full border transition-all ${canScrollLeft
                                ? 'bg-[#06363D] border-[#084B54] text-[#C7F4FA] hover:bg-[#109EB1] hover:border-[#109EB1]'
                                : 'bg-[#032125] border-[#032125] text-[#C7F4FA]/20 cursor-not-allowed'
                                }`}
                            aria-label="Scroll left"
                        >
                            <Icon ssr={true} icon="mdi:arrow-left" className="w-4 h-4" />
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
                            <Icon ssr={true} icon="mdi:arrow-right" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
        </section>
    );
}
