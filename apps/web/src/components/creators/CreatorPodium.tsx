'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Creator, formatNumber } from './types';

interface CreatorPodiumProps {
    creators: Creator[];
}

export default function CreatorPodium({ creators }: CreatorPodiumProps) {
    if (!creators || creators.length === 0) {
        return null;
    }

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0: // 1st
                return {
                    border: 'border-yellow-400',
                    bg: 'bg-gradient-to-r from-[#06363D] to-yellow-900/20',
                    text: 'text-yellow-400',
                    shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.1)]',
                    icon: 'ph:crown-fill'
                };
            case 1: // 2nd
                return {
                    border: 'border-gray-300',
                    bg: 'bg-gradient-to-r from-[#06363D] to-gray-800/30',
                    text: 'text-gray-300',
                    shadow: 'shadow-[0_0_15px_rgba(209,213,219,0.1)]',
                    icon: 'ph:medal-fill'
                };
            case 2: // 3rd
                return {
                    border: 'border-amber-600',
                    bg: 'bg-gradient-to-r from-[#06363D] to-amber-900/20',
                    text: 'text-amber-600',
                    shadow: 'shadow-[0_0_15px_rgba(217,119,6,0.1)]',
                    icon: 'ph:medal-fill'
                };
            default:
                return {
                    border: 'border-[#084B54] hover:border-[#109EB1]',
                    bg: 'bg-[#06363D]/50 hover:bg-[#06363D]',
                    text: 'text-[#109EB1]',
                    shadow: '',
                    icon: ''
                };
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {creators.map((creator, index) => {
                const style = getRankStyle(index);
                const isTop3 = index < 3;

                return (
                    <Link
                        key={creator.id}
                        href={`/user/${creator.username}`}
                        className={`
                            relative flex items-center gap-4 p-3 rounded-[16px] border transition-all duration-300 group
                            ${style.border} ${style.bg} ${style.shadow}
                        `}
                    >
                        {/* Rank Badge */}
                        <div className={`
                            w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                            font-hebden font-bold text-sm border-2 bg-[#032125]
                            ${isTop3 ? style.border + ' ' + style.text : 'border-[#084B54] text-[#C7F4FA]/50'}
                        `}>
                            {index + 1}
                        </div>

                        {/* Avatar */}
                        <div className={`
                            relative rounded-full overflow-hidden flex-shrink-0
                            ${isTop3 ? 'w-12 h-12 border-2 ' + style.border : 'w-10 h-10 border border-[#084B54]'}
                        `}>
                            {creator.image ? (
                                <img src={creator.image} alt={creator.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#109EB1] to-[#06363D] flex items-center justify-center">
                                    <span className="font-hebden text-xs text-[#C7F4FA]">
                                        {creator.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </span>
                                </div>
                            )}
                            {isTop3 && (
                                <div className="absolute bottom-0 right-0 bg-[#032125] rounded-full p-0.5">
                                    <Icon ssr={true} icon={style.icon} className={`w-3 h-3 ${style.text}`} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className={`font-hebden text-[#C7F4FA] truncate ${isTop3 ? 'text-base' : 'text-sm'}`}>
                                    {creator.displayName}
                                </h3>
                                <span className="text-[10px] text-[#109EB1] truncate">@{creator.username}</span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-[10px] text-[#C7F4FA]/50">
                                <div className="flex items-center gap-1">
                                    <Icon ssr={true} icon="ph:cube-fill" className="w-3 h-3" />
                                    <span>{creator.stats.resources} Resources</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icon ssr={true} icon="ph:download-simple-fill" className="w-3 h-3" />
                                    <span>{formatNumber(creator.stats.downloads)} Downloads</span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <Icon ssr={true} icon="ph:caret-right-bold" className="text-[#084B54] group-hover:text-[#109EB1] transition-colors" />
                    </Link>
                );
            })}
        </div>
    );
}
