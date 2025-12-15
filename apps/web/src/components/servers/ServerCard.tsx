'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Copy, Check, Trophy } from 'lucide-react';
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
    primaryCategory?: string;
    verified?: boolean;
    featured?: boolean;
    description?: string;
}

interface ServerCardProps {
    item: ServerItem;
    viewMode: ViewMode;
}

// Get initials from server name for fallback
function getInitials(name: string): string {
    if (!name) return '??';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
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

    // Display primary category first, then secondary categories
    const primaryCategory = item.primaryCategory || item.categories[0];
    const secondaryCategories = item.categories.filter(c => c !== primaryCategory);

    // Tags: show max 2, with "+X" if more
    const displayedTags = item.tags.slice(0, 2);
    const remainingTagsCount = item.tags.length - 2;

    // Rank color based on position
    const getRankColor = () => {
        if (item.rank === 1) return 'text-[#FFD700]'; // Gold
        if (item.rank === 2) return 'text-[#C0C0C0]'; // Silver
        if (item.rank === 3) return 'text-[#CD7F32]'; // Bronze
        if (item.rank <= 10) return 'text-[#ecbc62]';
        return 'text-[#C7F4FA]/70';
    };

    // Row View - Responsive design with full banner visibility
    if (viewMode === 'row') {
        return (
            <div className="w-full bg-[#06363D] border border-[#084B54] rounded-xl overflow-hidden hover:border-[#109EB1]/50 transition-all duration-300 group">
                {/* Mobile Layout - Vertical Stack (< md breakpoint) */}
                <div className="flex flex-col md:hidden">
                    {/* Banner - Full Width on Mobile */}
                    <div className="relative w-full aspect-[3/1] bg-[#032125]">
                        {item.bannerUrl ? (
                            <Image
                                src={item.bannerUrl}
                                alt={`${item.name} banner`}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <>
                                <Image
                                    src="/background.webp"
                                    alt="Default banner"
                                    fill
                                    className="object-cover opacity-40"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <h4 className="font-hebden font-bold text-xl text-[#C7F4FA] drop-shadow-lg">
                                        {item.name}
                                    </h4>
                                </div>
                            </>
                        )}
                        {/* Rank Badge Overlay */}
                        <div className="absolute top-2 left-2">
                            <span className={`font-hebden font-extrabold text-xl px-2.5 py-1 rounded-lg bg-[#032125]/80 backdrop-blur-sm ${getRankColor()}`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                #{item.rank}
                            </span>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-3 space-y-3">
                        {/* Header - Logo + Name + Status */}
                        <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden ${!item.logoUrl ? 'border-2 border-[#084B54] shadow-lg' : ''}`}>
                                {item.logoUrl ? (
                                    <Image
                                        src={item.logoUrl}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1] flex items-center justify-center">
                                        <span className="font-hebden text-xl font-bold text-[#C7F4FA]">
                                            {getInitials(item.name)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Name + Status */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-hebden font-bold text-base text-[#C7F4FA] truncate">
                                        {item.name}
                                    </h3>
                                    {item.verified && (
                                        <svg className="w-4 h-4 text-[#109EB1] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`w-2 h-2 rounded-full ${item.onlineStatus ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    <span className="font-nunito text-[#C7F4FA]/80">
                                        {item.onlineStatus ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row - Players + Votes */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#109EB1]" />
                                <span className="font-hebden">
                                    <span className="font-bold text-[#109EB1]">{item.currentPlayers}</span>
                                    <span className="text-[#C7F4FA]/60">/{item.maxPlayers}</span>
                                </span>
                            </div>
                        </div>

                        {/* IP Section */}
                        <div className="flex items-center justify-between bg-[#032125] border border-[#084B54] rounded-lg px-3 py-2">
                            <span className="font-hebden text-sm uppercase text-[#15C8E0] font-bold">
                                {item.serverIp || 'Soon'}
                            </span>
                            <button
                                onClick={handleCopyIP}
                                disabled={!item.serverIp}
                                className={`flex items-center gap-1.5 font-hebden text-xs transition-all ${copied ? 'text-emerald-400' : 'text-[#C7F4FA]/60 hover:text-[#15C8E0]'
                                    } ${!item.serverIp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {copied ? (
                                    <><Check className="w-3.5 h-3.5" /> Copied</>
                                ) : (
                                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                                )}
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="space-y-1.5">
                            <span className="font-hebden text-xs text-[#C7F4FA]/50 uppercase">Categories</span>
                            <div className="flex flex-wrap gap-1.5">
                                {primaryCategory && (
                                    <span className="px-2 py-0.5 rounded-md font-nunito text-xs font-semibold bg-[#109EB1]/40 text-[#C7F4FA] border border-[#109EB1]">
                                        {primaryCategory}
                                    </span>
                                )}
                                {secondaryCategories.slice(0, 2).map((category, i) => (
                                    <span
                                        key={`cat-${i}`}
                                        className="px-2 py-0.5 rounded-md font-nunito text-xs bg-[#109EB1]/20 text-[#C7F4FA]/90 border border-[#109EB1]/40"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5">
                            <span className="font-hebden text-xs text-[#C7F4FA]/50 uppercase">Tags</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {item.tags.slice(0, 2).map((tag, i) => (
                                    <span
                                        key={`tag-${i}`}
                                        className="px-2 py-0.5 rounded-md font-nunito text-[10px] bg-[#C7F4FA]/10 text-[#C7F4FA]/70 border border-[#C7F4FA]/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {item.tags.length > 2 && (
                                    <span className="px-2 py-0.5 rounded-md font-nunito text-[10px] bg-[#109EB1]/30 text-[#15C8E0] font-bold border border-[#109EB1]/50">
                                        +{item.tags.length - 2}
                                    </span>
                                )}
                                {item.tags.length === 0 && (
                                    <span className="font-nunito text-[10px] text-[#C7F4FA]/40 italic">No tags</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout - Horizontal (>= md breakpoint) */}
                <div className="hidden md:flex items-stretch">

                    {/* Rank - Compact left column */}
                    <div className="w-16 flex-shrink-0 flex items-center justify-center bg-[#032125]/60 border-r border-[#084B54]">
                        <span className={`font-hebden font-extrabold text-2xl ${getRankColor()}`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                            {item.rank}
                        </span>
                    </div>

                    {/* Logo + Name */}
                    <div className="w-64 flex-shrink-0 flex items-center gap-4 p-4 border-r border-[#084B54]">
                        {/* Logo */}
                        <div className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden ${!item.logoUrl ? 'border-2 border-[#084B54] shadow-lg' : ''}`}>
                            {item.logoUrl ? (
                                <Image
                                    src={item.logoUrl}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1] flex items-center justify-center">
                                    <span className="font-hebden text-2xl font-bold text-[#C7F4FA]">
                                        {getInitials(item.name)}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Name and Status */}
                        <div className="flex flex-col min-w-0 gap-1.5">
                            <div className="flex items-center gap-2">
                                <h3 className="font-hebden font-bold text-lg text-[#C7F4FA] truncate group-hover:text-[#109EB1] transition-colors">
                                    {item.name}
                                </h3>
                                {item.verified && (
                                    <svg className="w-5 h-5 text-[#109EB1] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                )}
                            </div>
                            {/* Online Status */}
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.onlineStatus ? 'bg-emerald-400' : 'bg-red-400'} shadow-lg`} />
                                <span className="font-nunito text-sm text-[#C7F4FA]/80 font-medium">
                                    {item.onlineStatus ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            {/* Player Count - Always shown */}
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#109EB1]" />
                                <span className="font-hebden text-sm text-[#C7F4FA]">
                                    <span className="font-bold text-[#109EB1]">{item.currentPlayers}</span>
                                    <span className="text-[#C7F4FA]/60">/{item.maxPlayers}</span>
                                </span>
                            </div>
                            {/* Vote Count */}
                            {/* <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#ecbc62]" />
                                <span className="font-hebden text-sm font-bold text-[#ecbc62]">
                                    {item.voteCount}
                                </span>
                            </div> */}
                        </div>
                    </div>

                    {/* Banner Section - Full visible and prominent */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Banner with optimal aspect ratio for GIFs */}
                        <div className="relative h-24 bg-[#032125]">
                            {item.bannerUrl ? (
                                <Image
                                    src={item.bannerUrl}
                                    alt={`${item.name} banner`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <>
                                    <Image
                                        src="/background.webp"
                                        alt="Default banner"
                                        fill
                                        className="object-cover opacity-40"
                                    />
                                    {/* Server name overlay on default banner */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <h4 className="font-hebden font-bold text-2xl text-[#C7F4FA] drop-shadow-lg">
                                            {item.name}
                                        </h4>
                                    </div>
                                </>
                            )}
                            {/* Subtle gradient overlay for better text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#06363D]/20 via-transparent to-[#06363D]/20" />
                        </div>

                        {/* Info Bar - IP */}
                        <div className="flex items-center justify-between bg-[#032125] border-t border-[#084B54] px-4 py-2">
                            {/* IP - Left side */}
                            <span className="font-hebden text-sm uppercase text-[#15C8E0] font-bold tracking-wide">
                                {item.serverIp || 'Soon'}
                            </span>

                            {/* Copy Button - Right side */}
                            <button
                                onClick={handleCopyIP}
                                disabled={!item.serverIp}
                                className={`flex items-center gap-1.5 font-hebden text-xs transition-all ${copied
                                    ? 'text-emerald-400'
                                    : 'text-[#C7F4FA]/60 hover:text-[#15C8E0]'
                                    } ${!item.serverIp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {copied ? (
                                    <><Check className="w-3.5 h-3.5" /> Copied</>
                                ) : (
                                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Categories & Tags Section */}
                    <div className="w-60 flex-shrink-0 flex flex-col justify-center gap-3 p-4 bg-[#032125]/30 border-l border-[#084B54]">
                        {/* Categories */}
                        <div className="flex flex-col gap-1.5">
                            <span className="font-hebden text-xs text-[#C7F4FA]/50 uppercase tracking-wide">Categories</span>
                            <div className="flex flex-wrap gap-1.5">
                                {/* Primary Category - Highlighted */}
                                {primaryCategory && (
                                    <span className="px-2.5 py-1 rounded-md font-nunito text-xs font-semibold bg-[#109EB1]/40 text-[#C7F4FA] border border-[#109EB1] shadow-sm">
                                        {primaryCategory}
                                    </span>
                                )}
                                {/* Secondary Categories - show up to 2 */}
                                {secondaryCategories.slice(0, 2).map((category, i) => (
                                    <span
                                        key={`cat-${i}`}
                                        className="px-2.5 py-1 rounded-md font-nunito text-xs bg-[#109EB1]/20 text-[#C7F4FA]/90 border border-[#109EB1]/40"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-1.5">
                            <span className="font-hebden text-xs text-[#C7F4FA]/50 uppercase tracking-wide">Tags</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {item.tags.slice(0, 1).map((tag, i) => (
                                    <span
                                        key={`tag-${i}`}
                                        className="px-2 py-0.5 rounded-md font-nunito text-[10px] bg-[#C7F4FA]/10 text-[#C7F4FA]/70 border border-[#C7F4FA]/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {item.tags.length > 1 && (
                                    <span className="px-2 py-0.5 rounded-md font-nunito text-[10px] bg-[#109EB1]/30 text-[#15C8E0] font-bold border border-[#109EB1]/50">
                                        +{item.tags.length - 1}
                                    </span>
                                )}
                                {item.tags.length === 0 && (
                                    <span className="font-nunito text-[10px] text-[#C7F4FA]/40 italic">No tags</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Gallery View - Compact card
    if (viewMode === 'gallery') {
        return (
            <div className="bg-[#06363D] border border-[#084B54] rounded-[20px] overflow-hidden hover:border-[#109EB1]/50 transition-all duration-300 group">
                {/* Banner */}
                <div className="w-full aspect-video relative bg-[#032125]">
                    {item.bannerUrl ? (
                        <Image src={item.bannerUrl} alt={item.name} fill className="object-cover" />
                    ) : item.logoUrl ? (
                        <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-[#084B54] to-[#032125]">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                                <Image
                                    src={item.logoUrl}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#084B54] to-[#032125]">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1] flex items-center justify-center">
                                <span className="font-hebden text-2xl font-bold text-[#C7F4FA]">
                                    {getInitials(item.name)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Overlays */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {/* Rank Badge */}
                        <div className={`bg-[#032125]/80 backdrop-blur-sm px-2.5 py-1 rounded-lg font-hebden font-bold text-xs ${getRankColor()}`}>
                            #{item.rank}
                        </div>
                    </div>
                    <div className="absolute top-3 right-3">
                        {/* Online Status */}
                        <span className={`px-2 py-1 rounded-full text-[10px] font-hebden ${item.onlineStatus
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                            }`}>
                            {item.onlineStatus ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-hebden font-semibold text-base text-[#C7F4FA] truncate group-hover:text-[#109EB1] transition-colors">
                            {item.name}
                        </h3>
                        {item.verified && (
                            <svg className="w-4 h-4 text-[#109EB1] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        )}
                    </div>

                    {/* Players + Primary Category */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-[#C7F4FA]/60">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-hebden text-xs">
                                <span className="text-[#C7F4FA]">{item.currentPlayers}</span>/{item.maxPlayers}
                            </span>
                        </div>
                        {primaryCategory && (
                            <span className="px-2 py-0.5 rounded-md font-nunito text-[10px] bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]">
                                {primaryCategory}
                            </span>
                        )}
                    </div>

                    {/* IP Copyable */}
                    <button
                        onClick={handleCopyIP}
                        disabled={!item.serverIp}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all ${copied
                            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                            : 'bg-[#032125] border border-[#084B54] hover:border-[#109EB1]/50 text-[#C7F4FA]'
                            } ${!item.serverIp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span className="font-mono text-xs truncate">
                            {item.serverIp || 'Coming soon'}
                        </span>
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-[#109EB1]" />
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Grid View - Default (2 columns)
    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[20px] overflow-hidden flex flex-col hover:border-[#109EB1]/50 transition-all duration-300 group">
            {/* Compact horizontal layout */}
            <div className="flex gap-3 p-3">
                {/* Rank */}
                <div className="flex items-center justify-center">
                    <span className={`font-hebden font-extrabold text-lg ${getRankColor()}`}>
                        {item.rank}
                    </span>
                </div>

                {/* Logo - 64x64 */}
                <div className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden ${!item.logoUrl ? 'border border-[#084B54]' : ''}`}>
                    {item.logoUrl ? (
                        <Image
                            src={item.logoUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1] flex items-center justify-center">
                            <span className="font-hebden text-xl font-bold text-[#C7F4FA]">
                                {getInitials(item.name)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-hebden font-semibold text-base leading-5 text-[#C7F4FA] truncate group-hover:text-[#109EB1] transition-colors">
                                    {item.name}
                                </h3>
                                {item.verified && (
                                    <svg className="w-4 h-4 text-[#109EB1] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-hebden flex-shrink-0 ${item.onlineStatus
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {item.onlineStatus ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    {/* Players */}
                    <div className="flex items-center gap-1 mb-2 text-[#C7F4FA]/60">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-hebden text-xs">
                            <span className="text-[#C7F4FA]">{item.currentPlayers}</span>/{item.maxPlayers} joueurs
                        </span>
                    </div>

                    {/* Categories and Tags */}
                    <div className="flex flex-wrap gap-1">
                        {primaryCategory && (
                            <span className="px-1.5 py-0.5 rounded-md font-nunito text-[10px] bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]">
                                {primaryCategory}
                            </span>
                        )}
                        {secondaryCategories.slice(0, 1).map((category, i) => (
                            <span
                                key={`cat-${i}`}
                                className="px-1.5 py-0.5 rounded-md font-nunito text-[10px] bg-[#109EB1]/20 text-[#C7F4FA]/80"
                            >
                                {category}
                            </span>
                        ))}
                        {displayedTags.slice(0, 1).map((tag, i) => (
                            <span
                                key={`tag-${i}`}
                                className="px-1.5 py-0.5 rounded-md font-nunito text-[10px] bg-[#C7F4FA]/15 text-[#C7F4FA]/70"
                            >
                                {tag}
                            </span>
                        ))}
                        {item.tags.length > 1 && (
                            <span className="px-1 font-nunito text-[10px] text-[#109EB1]">
                                +{item.tags.length - 1}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer - Server IP */}
            <div className="px-3 py-2.5 border-t border-[#084B54] bg-[#032125]/50">
                <button
                    onClick={handleCopyIP}
                    disabled={!item.serverIp}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all ${copied
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-[#084B54]/30 border border-[#084B54] hover:border-[#109EB1]/50 text-[#C7F4FA]'
                        } ${!item.serverIp ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="font-mono text-xs truncate">
                        {item.serverIp || 'IP coming soon'}
                    </span>
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-[#109EB1]" />
                    )}
                </button>
            </div>
        </div>
    );
}
