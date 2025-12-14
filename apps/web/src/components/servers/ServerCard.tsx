'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Copy, CheckCircle2 } from 'lucide-react';
import { ViewMode } from '../marketplace/ViewSwitcher';
import { useState } from 'react';

export interface ServerItem {
    id: string;
    rank: number;
    name: string;
    owner: string;
    ownerDisplay: string;
    isOwnedByTeam?: boolean;
    logoUrl?: string;
    bannerUrl?: string;
    serverIp?: string;
    onlineStatus: boolean;
    currentPlayers: number;
    maxPlayers: number;
    voteCount: number;
    tags: string[];
    categories: string[];
    verified?: boolean;
    featured?: boolean;
    description?: string;
    clicks?: number;
    reviews?: number;
}

interface ServerCardProps {
    item: ServerItem;
    viewMode: ViewMode;
}

export default function ServerCard({ item, viewMode }: ServerCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyIP = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (item.serverIp) {
            navigator.clipboard.writeText(item.serverIp);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleVote = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement vote functionality
        alert('Vote functionality coming soon!');
    };

    // Row View - serveur-prive.net style
    if (viewMode === 'row') {
        return (
            <div className="bg-[#06363D] border border-[#084B54] rounded-xl p-2.5 flex flex-col gap-2.5 shadow-[0_6px_10px_rgba(0,0,0,0.2)] outline outline-1 outline-white/10">
                {/* Main Content - 3 columns */}
                <div className="flex gap-2.5 items-center">
                    {/* Left Section - Image with Rank Badge - 22.5% */}
                    <div className="w-[22.5%] min-w-[140px] max-w-[200px]">
                        <div className="relative w-full aspect-video bg-[#084B54] rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.2)] outline outline-1 outline-white/10">
                            {item.logoUrl || item.bannerUrl ? (
                                <Image
                                    src={item.logoUrl || item.bannerUrl || ''}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#C7F4FA]/50">
                                    <Users className="w-12 h-12" />
                                </div>
                            )}

                            {/* Rank Badge */}
                            <div className="absolute -bottom-1 -left-1.5 bg-[#939393] text-[#C7F4FA] font-hebden font-extrabold text-sm px-2 py-1 rounded">
                                N° {item.rank}
                            </div>
                        </div>
                    </div>

                    {/* Middle Section - Info - 60% */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5 py-2.5">
                        {/* Title */}
                        <div className="px-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-hebden font-extrabold text-lg leading-tight text-[#C7F4FA]">
                                    {item.name}
                                </h3>
                                {item.verified && (
                                    <CheckCircle2 className="w-5 h-5 text-[#109EB1] flex-shrink-0" />
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="px-4">
                            <p className="font-nunito text-sm text-[#C7F4FA]/80 leading-snug line-clamp-3">
                                {item.description || `Server created by ${item.ownerDisplay}. Join now and start playing!`}
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="px-4 flex flex-wrap gap-1 min-h-[25px]">
                            {item.categories.slice(0, 3).map((category, i) => (
                                <span
                                    key={`cat-${i}`}
                                    className="px-2 py-0.5 rounded-md font-nunito text-xs bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]"
                                >
                                    {category}
                                </span>
                            ))}
                            {item.tags.slice(0, 2).map((tag, i) => (
                                <span
                                    key={`tag-${i}`}
                                    className="px-2 py-0.5 rounded-md font-nunito text-xs bg-[#C7F4FA]/20 text-[#C7F4FA]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Stats & Vote Button - 20% */}
                    <div className="w-[20%] min-w-[130px] flex flex-col">
                        <div className="flex flex-col text-sm font-nunito">
                            {/* Votes */}
                            <div className="flex items-center justify-between py-2.5 px-2">
                                <div className="flex items-center gap-1.5 text-[#C7F4FA]/60">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2l2.5 6.5H19l-5.5 4 2 6.5L10 15l-5.5 4 2-6.5-5.5-4h6.5z" />
                                    </svg>
                                    <span className="text-xs">Votes</span>
                                </div>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{item.voteCount}</span>
                            </div>

                            {/* Clicks */}
                            <div className="flex items-center justify-between py-2.5 px-2">
                                <div className="flex items-center gap-1.5 text-[#C7F4FA]/60">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span className="text-xs">Clics</span>
                                </div>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{item.clicks || 0}</span>
                            </div>

                            {/* Reviews */}
                            <div className="flex items-center justify-between py-2.5 px-2">
                                <div className="flex items-center gap-1.5 text-[#C7F4FA]/60">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <span className="text-xs">Avis</span>
                                </div>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{item.reviews || 0}</span>
                            </div>

                            {/* Vote Button */}
                            <div className="mt-0.5 px-2">
                                <button
                                    onClick={handleVote}
                                    className="w-full bg-[#109EB1] hover:bg-[#109EB1]/90 text-white font-hebden text-sm py-3 rounded-md transition-colors"
                                >
                                    Voter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Additional Info */}
                <div className="flex gap-2.5">
                    {/* Server IP/Link */}
                    <div className="flex-1 bg-[#032125] border border-[#084B54] rounded-lg px-3.5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-[#109EB1] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-nunito text-sm text-[#C7F4FA] truncate">
                                {item.serverIp || 'Coming soon'}
                            </span>
                        </div>
                        <button
                            onClick={handleCopyIP}
                            className="text-[#C7F4FA]/60 hover:text-[#C7F4FA] transition-colors flex-shrink-0"
                            disabled={!item.serverIp}
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Access Status */}
                    <div className="bg-[#032125] border border-[#084B54] rounded-lg px-3.5 py-3.5 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#109EB1]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-nunito text-sm text-[#C7F4FA] whitespace-nowrap">
                            Accès : <span className="font-semibold">Public</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Gallery View - Compact grid
    if (viewMode === 'gallery') {
        return (
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden">
                {/* Banner/Logo */}
                <div className="w-full aspect-video relative bg-[#032125]">
                    {item.bannerUrl ? (
                        <Image src={item.bannerUrl} alt={item.name} fill className="object-cover" />
                    ) : item.logoUrl ? (
                        <div className="w-full h-full flex items-center justify-center p-8">
                            <div className="relative w-24 h-24 rounded-[15px] overflow-hidden">
                                <Image src={item.logoUrl} alt={item.name} fill className="object-cover" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C7F4FA]/50">
                            <Users className="w-16 h-16" />
                        </div>
                    )}
                    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
                        <div className="px-2 py-1 bg-[#ecbc62] rounded-full">
                            <span className="font-hebden font-semibold text-xs leading-[14px] text-[#032125]">
                                #{item.rank}
                            </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-hebden ${item.onlineStatus
                            ? 'bg-green-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                            }`}>
                            {item.onlineStatus ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-hebden font-semibold text-sm sm:text-lg leading-5 sm:leading-6 text-[#C7F4FA] break-words">
                            {item.name}
                        </h3>
                        {item.verified && (
                            <CheckCircle2 className="w-4 h-4 text-[#109EB1] flex-shrink-0" />
                        )}
                    </div>
                    <Link
                        href={item.isOwnedByTeam ? `/team/${item.owner}` : `/users/${item.owner}`}
                        className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        by <span className="text-[#109EB1] hover:underline">{item.ownerDisplay}</span>
                    </Link>

                    {/* Stats and IP */}
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#084B54]">
                        <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                            <span className="font-hebden text-xs text-[#C7F4FA]/50">
                                {item.currentPlayers}/{item.maxPlayers}
                            </span>
                        </div>
                        <div className="bg-[#032125] border border-[#084B54] rounded-lg px-2 py-1.5 flex items-center justify-between gap-2">
                            <span className="font-hebden text-xs text-[#C7F4FA] truncate">
                                {item.serverIp || 'pre-launch'}
                            </span>
                            <button
                                onClick={handleCopyIP}
                                className="text-[#ecbc62] hover:text-[#ecbc62]/80 transition-colors font-hebden text-xs flex-shrink-0"
                                disabled={!item.serverIp}
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View - Default (2 columns)
    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden flex flex-col">
            {/* Compact horizontal layout */}
            <div className="flex gap-3 p-3">
                {/* Rank */}
                <div className="flex items-center justify-center">
                    <p className="font-hebden font-semibold text-xl leading-6 text-[#ecbc62] w-8 text-center">
                        {item.rank}
                    </p>
                </div>

                {/* Logo - 64x64 */}
                <div className="relative w-16 h-16 flex-shrink-0 rounded-[15px] overflow-hidden bg-[#032125]">
                    {item.logoUrl ? (
                        <Image src={item.logoUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C7F4FA]/50">
                            <Users className="w-8 h-8" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-hebden font-semibold text-base leading-5 text-[#C7F4FA] truncate">
                                    {item.name}
                                </h3>
                                {item.verified && (
                                    <CheckCircle2 className="w-4 h-4 text-[#109EB1] flex-shrink-0" />
                                )}
                            </div>
                            <Link
                                href={item.isOwnedByTeam ? `/team/${item.owner}` : `/users/${item.owner}`}
                                className="font-hebden font-semibold text-xs leading-4 text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                by <span className="text-[#109EB1] hover:underline">{item.ownerDisplay}</span>
                            </Link>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-hebden flex-shrink-0 ${item.onlineStatus
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {item.onlineStatus ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    {/* Players */}
                    <div className="flex items-center gap-1 mb-2">
                        <Users className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                        <span className="font-hebden text-xs text-[#C7F4FA]/50">
                            {item.currentPlayers}/{item.maxPlayers} players
                        </span>
                    </div>

                    {/* Categories and Tags */}
                    <div className="flex flex-wrap gap-1">
                        {item.categories.slice(0, 2).map((category, i) => (
                            <span
                                key={`cat-${i}`}
                                className="px-1.5 py-0.5 rounded-[5px] font-nunito text-[11px] leading-4 bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]"
                            >
                                {category}
                            </span>
                        ))}
                        {item.tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={`tag-${i}`}
                                className="px-1.5 py-0.5 rounded-[5px] font-nunito text-[11px] leading-4 bg-[#C7F4FA]/25 text-[#C7F4FA]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer - Server IP */}
            <div className="px-3 py-2 border-t border-[#084B54] bg-[#032125]/50">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-hebden text-xs text-[#C7F4FA] truncate">
                        {item.serverIp || 'pre-launch'}
                    </span>
                    <button
                        onClick={handleCopyIP}
                        className="px-2 py-1 bg-[#109EB1] hover:bg-[#109EB1]/90 rounded-full text-[#C7F4FA] font-hebden text-xs transition-colors flex items-center gap-1 flex-shrink-0"
                        disabled={!item.serverIp}
                    >
                        {copied ? (
                            <>Copied!</>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
