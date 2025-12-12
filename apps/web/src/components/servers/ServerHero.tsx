"use client";

import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServerHeroProps {
    name: string;
    banner?: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
    primaryCategory?: {
        name: string;
        color?: string;
        icon?: string;
    };
    serverAddress: string;
    onVote?: () => void;
    onCopyIP?: () => void;
}

export default function ServerHero({
    name,
    banner,
    isOnline,
    currentPlayers,
    maxPlayers,
    primaryCategory,
    serverAddress,
    onVote,
    onCopyIP
}: ServerHeroProps) {
    const handleCopyIP = () => {
        navigator.clipboard.writeText(serverAddress);
        if (onCopyIP) onCopyIP();
    };

    return (
        <div className="relative w-full rounded-[20px] overflow-hidden mb-6">
            {/* Banner Image with Overlay */}
            <div className="relative h-[280px] w-full">
                {banner ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${banner})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]/20" />
                )}

                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06363D] via-[#06363D]/80 to-transparent" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-8">
                    {/* Primary Category Badge */}
                    {primaryCategory && (
                        <div className="mb-4">
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm"
                                style={{
                                    backgroundColor: `${primaryCategory.color || '#109EB1'}20`,
                                    borderColor: `${primaryCategory.color || '#109EB1'}40`
                                }}
                            >
                                {primaryCategory.icon && (
                                    <Icon
                                        icon={primaryCategory.icon}
                                        width="18"
                                        height="18"
                                        style={{ color: primaryCategory.color || '#109EB1' }}
                                    />
                                )}
                                <span
                                    className="font-hebden text-sm font-bold"
                                    style={{ color: primaryCategory.color || '#109EB1' }}
                                >
                                    {primaryCategory.name}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Server Name and Status */}
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="font-hebden text-4xl md:text-5xl font-bold text-white">
                            {name}
                        </h1>

                        {/* Online Status Indicator */}
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border",
                            isOnline
                                ? "bg-[#69a024]/20 border-[#69a024]/40"
                                : "bg-red-500/20 border-red-500/40"
                        )}>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full",
                                isOnline ? "bg-[#69a024] animate-pulse" : "bg-red-500"
                            )} />
                            <span className={cn(
                                "font-nunito text-sm font-medium",
                                isOnline ? "text-[#69a024]" : "text-red-400"
                            )}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    {/* Player Count */}
                    <div className="flex items-center gap-2 mb-6">
                        <Icon icon="mdi:account-group" width="20" height="20" className="text-[#C7F4FA]/60" />
                        <span className="font-hebden text-lg text-[#C7F4FA]">
                            {isOnline ? `${currentPlayers}/${maxPlayers}` : '0'} {' '}
                            <span className="text-[#C7F4FA]/60 font-nunito text-base">players online</span>
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={onVote}
                            className="bg-[#109EB1] hover:bg-[#109EB1]/80 text-white font-hebden px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <Icon icon="mdi:vote" width="20" height="20" />
                            Vote for Server
                        </Button>

                        <Button
                            onClick={handleCopyIP}
                            variant="outline"
                            className="bg-[#084B54]/50 hover:bg-[#084B54] border-[#109EB1]/30 text-[#C7F4FA] font-hebden px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Icon icon="mdi:content-copy" width="18" height="18" />
                            Copy IP
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-[#084B54]/50 hover:bg-[#084B54] border-[#109EB1]/30 text-[#C7F4FA] font-hebden px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Icon icon="mdi:share-variant" width="18" height="18" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
