'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { formatNumber } from '@/components/creators/types';
import SpecialtyGrid from '@/components/creators/SpecialtyGrid';
import CreatorLeaderboard from '@/components/creators/CreatorLeaderboard';
import DiscoverShuffle from '@/components/creators/DiscoverShuffle';
import {
    fetchWeeklyLeaderboard,
    fetchShuffleCreators,
    type LeaderboardEntry,
    type Creator,
} from '@/lib/api/discovery';

export default function CreatorsPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [shuffleCreators, setShuffleCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch leaderboard
                const leaderboardResponse = await fetchWeeklyLeaderboard(10);
                if (leaderboardResponse.leaderboard.length > 0) {
                    setLeaderboard(leaderboardResponse.leaderboard as any);
                }

                // Fetch shuffle creators
                const shuffleResponse = await fetchShuffleCreators(20);
                if (shuffleResponse.creators.length > 0) {
                    setShuffleCreators(shuffleResponse.creators as any);
                }
            } catch (error) {
                console.error('Failed to fetch creator data:', error);
                // Keep mock data as fallback
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    // Get top creators by downloads for the hero visual
    const topCreators = shuffleCreators.length > 0
        ? [...shuffleCreators]
            .sort((a, b) => b.stats.downloads - a.stats.downloads)
            .slice(0, 4)
        : [];

    return (
        <>
            {/* Hero Section - Full Width Behind Navbar */}
            <section className="relative -mt-[100px] overflow-hidden min-h-[500px] flex items-center">
                {/* Background */}
                <div className="absolute inset-0 bg-[#032125]">
                    <div className="absolute inset-0 bg-[url('https://cdn.hytale.com/variants/blog_cover_477eaf50273a8db52724a3fda19a9bf2_modding_banner.png')] bg-cover bg-center blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#032125] via-[#032125]/80 to-transparent" />
                    {/* Bottom fade effect */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#032125] to-transparent" />
                </div>

                {/* Content */}
                <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pt-[140px] pb-16">
                    <div className="max-w-2xl space-y-4">
                        <h1 className="font-hebden text-4xl md:text-5xl text-[#C7F4FA] leading-tight">
                            Discover Creators
                        </h1>
                        <p className="text-[#C7F4FA]/70 text-lg font-nunito leading-relaxed max-w-xl">
                            Meet the talented minds behind the best Hytale content. From modders to world builders, find your next favorite creator here.
                        </p>
                    </div>

                    {/* Floating Avatars Visual (Top Creators by Downloads) */}
                    <div className="hidden lg:flex relative w-64 h-64 items-center justify-center">
                        <div className="absolute inset-0 bg-[#109EB1]/20 rounded-full blur-3xl" />

                        {/* Central Avatar (Rank 1) */}
                        {topCreators[0] && (
                            <div className="relative z-10 w-24 h-24 rounded-full border-4 border-[#032125] shadow-xl overflow-hidden group cursor-pointer" title={`${topCreators[0].displayName || topCreators[0].username} (${formatNumber(topCreators[0].stats.downloads)} downloads)`}>
                                {topCreators[0].image ? (
                                    <img src={topCreators[0].image} alt={topCreators[0].displayName || topCreators[0].username} className="w-full h-full object-cover bg-[#06363D]" />
                                ) : (
                                    <div className="w-full h-full bg-[#06363D] flex items-center justify-center font-hebden text-[#C7F4FA] text-2xl">
                                        {(topCreators[0].displayName || topCreators[0].username).slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orbiting Avatars */}
                        {topCreators[1] && (
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-full border-4 border-[#032125] shadow-lg overflow-hidden group cursor-pointer" title={`${topCreators[1].displayName || topCreators[1].username} (${formatNumber(topCreators[1].stats.downloads)} downloads)`}>
                                {topCreators[1].image ? (
                                    <img src={topCreators[1].image} alt={topCreators[1].displayName || topCreators[1].username} className="w-full h-full object-cover bg-[#06363D]" />
                                ) : (
                                    <div className="w-full h-full bg-[#06363D] flex items-center justify-center font-hebden text-[#C7F4FA] text-lg">
                                        {(topCreators[1].displayName || topCreators[1].username).slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                        {topCreators[2] && (
                            <div className="absolute bottom-4 left-4 w-14 h-14 rounded-full border-4 border-[#032125] shadow-lg overflow-hidden group cursor-pointer" title={`${topCreators[2].displayName || topCreators[2].username} (${formatNumber(topCreators[2].stats.downloads)} downloads)`}>
                                {topCreators[2].image ? (
                                    <img src={topCreators[2].image} alt={topCreators[2].displayName || topCreators[2].username} className="w-full h-full object-cover bg-[#06363D]" />
                                ) : (
                                    <div className="w-full h-full bg-[#06363D] flex items-center justify-center font-hebden text-[#C7F4FA] text-base">
                                        {(topCreators[2].displayName || topCreators[2].username).slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                        {topCreators[3] && (
                            <div className="absolute top-8 left-0 w-12 h-12 rounded-full border-4 border-[#032125] shadow-lg overflow-hidden opacity-80 group cursor-pointer" title={`${topCreators[3].displayName || topCreators[3].username} (${formatNumber(topCreators[3].stats.downloads)} downloads)`}>
                                {topCreators[3].image ? (
                                    <img src={topCreators[3].image} alt={topCreators[3].displayName || topCreators[3].username} className="w-full h-full object-cover bg-[#06363D]" />
                                ) : (
                                    <div className="w-full h-full bg-[#06363D] flex items-center justify-center font-hebden text-[#C7F4FA] text-sm">
                                        {(topCreators[3].displayName || topCreators[3].username).slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content Container */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-12">
                {/* Browse by Specialty */}
                <SpecialtyGrid />

                {/* Weekly Leaderboard - Full width section */}
                <CreatorLeaderboard entries={leaderboard as any} />

                {/* Discover New Faces - Shuffle Section */}
                <DiscoverShuffle allCreators={shuffleCreators as any} />
            </div>
        </>
    );
}
