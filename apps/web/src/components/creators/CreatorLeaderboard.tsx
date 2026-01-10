'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { LeaderboardEntry, formatNumber } from './types';

interface CreatorLeaderboardProps {
    entries: LeaderboardEntry[];
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Icon icon="mdi:trophy" className="w-5 h-5 text-yellow-900" />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
                <span className="font-hebden text-lg text-gray-900">2</span>
            </div>
        );
    }
    if (rank === 3) {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-600/30">
                <span className="font-hebden text-lg text-amber-100">3</span>
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-full bg-[#06363D] border border-[#084B54] flex items-center justify-center">
            <span className="font-hebden text-lg text-[#C7F4FA]">{rank}</span>
        </div>
    );
}

function MovementIndicator({ current, previous }: { current: number; previous: number }) {
    const diff = previous - current;

    if (diff > 0) {
        return (
            <div className="flex items-center gap-1 text-green-400">
                <Icon icon="mdi:arrow-up" className="w-4 h-4" />
                <span className="text-xs font-hebden">{diff}</span>
            </div>
        );
    }
    if (diff < 0) {
        return (
            <div className="flex items-center gap-1 text-red-400">
                <Icon icon="mdi:arrow-down" className="w-4 h-4" />
                <span className="text-xs font-hebden">{Math.abs(diff)}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1 text-[#C7F4FA]/40">
            <Icon icon="mdi:minus" className="w-4 h-4" />
        </div>
    );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
    const { rank, previousRank, creator, weeklyDownloads, weeklyChange } = entry;
    const initials = (creator.displayName || creator.username)
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const isTopThree = rank <= 3;

    return (
        <Link
            href={`/user/${creator.username}`}
            className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:-translate-x-1 ${isTopThree
                ? 'bg-gradient-to-r from-[#109EB1]/10 to-transparent border border-[#109EB1]/20'
                : 'hover:bg-[#06363D]/50'
                }`}
        >
            {/* Rank */}
            <RankBadge rank={rank} />

            {/* Movement */}
            <div className="w-8">
                <MovementIndicator current={rank} previous={previousRank} />
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#109EB1] to-[#06363D] flex items-center justify-center border-2 border-[#084B54] group-hover:border-[#109EB1] transition-colors flex-shrink-0">
                {creator.image ? (
                    <img
                        src={creator.image}
                        alt={creator.displayName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="font-hebden text-lg text-[#C7F4FA]">
                        {initials}
                    </span>
                )}
            </div>

            {/* Creator Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-hebden text-base text-[#C7F4FA] truncate group-hover:text-[#109EB1] transition-colors">
                    {creator.displayName || creator.username}
                </h4>
                <p className="text-sm text-[#C7F4FA]/50">@{creator.username}</p>
            </div>

            {/* Stats */}
            <div className="text-right hidden sm:block">
                <p className="font-hebden text-lg text-[#C7F4FA]">{formatNumber(weeklyDownloads)}</p>
                <p className="text-xs text-[#C7F4FA]/50">this week</p>
            </div>


            {/* Arrow */}
            <Icon
                icon="mdi:chevron-right"
                className="w-5 h-5 text-[#C7F4FA]/30 group-hover:text-[#109EB1] transition-colors"
            />
        </Link>
    );
}

export default function CreatorLeaderboard({ entries }: CreatorLeaderboardProps) {
    return (
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-[32px]">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#06363D]/80 to-[#032125]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#109EB1]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#15C8E0]/5 rounded-full blur-2xl" />

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Icon icon="mdi:podium" className="w-7 h-7 text-[#109EB1]" />
                            <h2 className="font-hebden text-2xl sm:text-3xl text-[#C7F4FA]">
                                Weekly Leaderboard
                            </h2>
                        </div>
                        <p className="text-[#C7F4FA]/60">
                            Top creators ranked by downloads this week
                        </p>
                    </div>

                    {/* TODO: Re-enable when full rankings page is ready
                    <Link
                        href="/creators?sort=leaderboard"
                        className="px-5 py-2 bg-[#109EB1]/10 hover:bg-[#109EB1] border border-[#109EB1] text-[#109EB1] hover:text-[#C7F4FA] font-hebden text-sm rounded-full transition-all flex items-center gap-2 self-start sm:self-auto"
                    >
                        View Full Rankings
                        <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                    </Link>
                    */}
                </div>

                <div className="space-y-2">
                    {entries.map((entry, index) => (
                        <LeaderboardRow key={`${entry.rank}-${entry.creator.id}`} entry={entry} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

