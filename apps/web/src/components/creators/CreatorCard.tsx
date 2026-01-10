'use client';

import Link from 'next/link';
import { Creator, formatNumber } from './types';

interface CreatorCardProps {
    creator: Creator;
    variant?: 'default' | 'compact';
}

export default function CreatorCard({ creator, variant = 'default' }: CreatorCardProps) {
    const initials = (creator.displayName || creator.username)
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Link href={`/user/${creator.username}`} className="block h-full group">
            <div className="bg-[#06363D] border border-[#084B54] rounded-[20px] p-4 hover:border-[#109EB1] transition-all h-full flex flex-col group-hover:-translate-y-1 duration-300">
                {/* Header: Avatar + Name */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#109EB1] to-[#06363D] flex items-center justify-center border-2 border-[#084B54] group-hover:border-[#109EB1] transition-colors">
                            {creator.image ? (
                                <img
                                    src={creator.image}
                                    alt={creator.displayName || creator.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="font-hebden text-xl text-[#C7F4FA]">
                                    {initials}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Name and username */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-hebden text-base text-[#C7F4FA] truncate group-hover:text-[#109EB1] transition-colors">
                            @{creator.username}
                        </h3>
                        <p className="text-sm text-[#C7F4FA]/70 line-clamp-2 mt-1">
                            {creator.bio}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-4 mb-3 text-xs border-t border-[#084B54] pt-3">
                    <div>
                        <span className="text-[#C7F4FA]/50 block mb-0.5">RESOURCES</span>
                        <p className="font-hebden text-[#C7F4FA]">{creator.stats.resources}</p>
                    </div>
                    <div>
                        <span className="text-[#C7F4FA]/50 block mb-0.5">DOWNLOADS</span>
                        <p className="font-hebden text-[#C7F4FA]">{formatNumber(creator.stats.downloads)}</p>
                    </div>
                    <div>
                        <span className="text-[#C7F4FA]/50 block mb-0.5">FOLLOWERS</span>
                        <p className="font-hebden text-[#C7F4FA]">{formatNumber(creator.stats.followers)}</p>
                    </div>
                </div>

                {/* Specialty Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4 flex-1 content-start">
                    {creator.specialties.map((specialty, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 rounded-[5px] text-[10px] bg-[#C7F4FA]/5 text-[#C7F4FA]/70 border border-[#C7F4FA]/10"
                        >
                            {specialty}
                        </span>
                    ))}
                </div>

                {/* Follow Button */}
                <button
                    className="w-full py-2 bg-[#109EB1]/10 hover:bg-[#109EB1] text-[#109EB1] hover:text-[#C7F4FA] border border-[#109EB1] font-hebden text-sm rounded-xl transition-all mt-auto flex items-center justify-center gap-2 group/btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // TODO: Implement follow action
                    }}
                >
                    <span>FOLLOW</span>
                </button>
            </div>
        </Link>
    );
}
