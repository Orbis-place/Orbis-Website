'use client';

import { useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import CreatorCard from './CreatorCard';
import { Creator } from './types';

interface DiscoverShuffleProps {
    allCreators: Creator[];
    initialCreators?: Creator[];
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
}

export default function DiscoverShuffle({ allCreators, initialCreators }: DiscoverShuffleProps) {
    // Use deterministic initial state (first 3) to avoid hydration mismatch
    const [displayedCreators, setDisplayedCreators] = useState<Creator[]>(
        initialCreators || allCreators.slice(0, 3)
    );
    const [isShuffling, setIsShuffling] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Shuffle only on client after mount to avoid hydration issues
    useEffect(() => {
        setIsClient(true);
        if (!initialCreators && allCreators.length > 0) {
            setDisplayedCreators(shuffleArray(allCreators).slice(0, 3));
        }
    }, [allCreators]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleShuffle = useCallback(() => {
        setIsShuffling(true);

        // Animate out
        setTimeout(() => {
            // Get 3 random creators that are different from current ones
            const currentIds = new Set(displayedCreators.map(c => c.id));
            const availableCreators = allCreators.filter(c => !currentIds.has(c.id));

            // If not enough different creators, just shuffle all
            const pool = availableCreators.length >= 3 ? availableCreators : allCreators;
            const newCreators = shuffleArray(pool).slice(0, 3);

            setDisplayedCreators(newCreators);

            // Animate in
            setTimeout(() => {
                setIsShuffling(false);
            }, 100);
        }, 300);
    }, [allCreators, displayedCreators]);

    return (
        <section className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Icon icon="mdi:shuffle-variant" className="w-6 h-6 text-[#109EB1]" />
                        <h2 className="font-hebden text-2xl sm:text-3xl text-[#C7F4FA]">
                            Discover New Faces
                        </h2>
                    </div>
                    <p className="text-[#C7F4FA]/60">
                        Meet random creators from the community. Click shuffle to explore more!
                    </p>
                </div>

                <button
                    onClick={handleShuffle}
                    disabled={isShuffling}
                    className="group px-6 py-3 bg-[#109EB1] hover:bg-[#0d8a9a] disabled:bg-[#109EB1]/50 text-[#C7F4FA] font-hebden rounded-full transition-all flex items-center gap-3 shadow-lg shadow-[#109EB1]/30 hover:shadow-[#109EB1]/50 hover:scale-105 disabled:scale-100 self-start sm:self-auto"
                >
                    <Icon
                        icon="mdi:shuffle"
                        className={`w-5 h-5 transition-transform ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`}
                    />
                    <span>SHUFFLE</span>
                </button>
            </div>

            {/* Creator Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${isShuffling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                {displayedCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                ))}
            </div>

            {/* Fun subtitle */}
            <p className="text-center text-sm text-[#C7F4FA]/40 mt-6">
                🎲 {allCreators.length} creators to discover
            </p>
        </section>
    );
}
