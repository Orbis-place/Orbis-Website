'use client';

import { useRouter, useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useState, ReactNode } from 'react';
import { useServer } from '@/contexts/ServerContext';

export default function ServerLayoutContent({ children }: { children: ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { server, isLoading, isOwner } = useServer();
    const [copiedIP, setCopiedIP] = useState(false);

    const getInitials = (name: string) => {
        if (!name) return 'S';
        return name.charAt(0).toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const handleCopyIP = () => {
        if (server?.serverIp && server?.port) {
            navigator.clipboard.writeText(`${server.serverIp}:${server.port}`);
            setCopiedIP(true);
            setTimeout(() => setCopiedIP(false), 2000);
        }
    };

    const handleVote = () => {
        // TODO: Implement vote functionality
        alert('Vote functionality coming soon!');
    };

    if (isLoading) {
        return (
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                <div className="flex items-center justify-center min-h-screen">
                    <Icon icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
                </div>
            </div>
        );
    }

    if (!server) {
        return null;
    }

    // Get primary category
    const primaryCategory = server.categories?.find((c) => c.isPrimary)?.category;

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
            {/* Header Section */}
            <div className="mb-4">
                {/* Banner and Logo Container */}
                <div className="relative mb-20">
                    {/* Banner Section */}
                    <div className="relative w-full h-48 rounded-[25px] overflow-hidden">
                        {/* Banner Image or Gradient */}
                        {server.bannerUrl ? (
                            <Image
                                src={server.bannerUrl}
                                alt={`${server.name} banner`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]" />
                        )}

                        {/* Dark overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06363D] via-[#06363D]/80 to-transparent" />

                        {/* Primary Category Badge on Banner */}
                        {primaryCategory && (
                            <div className="absolute top-6 left-6">
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
                    </div>

                    {/* Logo - Overlapping Banner */}
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative w-32 h-32 rounded-[25px] overflow-hidden border-4 border-[#032125] shadow-2xl bg-[#032125]">
                            <Avatar className="h-full w-full rounded-none">
                                <AvatarImage src={server.logoUrl || undefined} alt={server.name} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-3xl rounded-none">
                                    {getInitials(server.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {/* Online Status Indicator on Logo */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm border"
                            style={{
                                backgroundColor: server.onlineStatus ? '#69a024CC' : '#ef4444CC',
                                borderColor: server.onlineStatus ? '#69a024' : '#ef4444'
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: server.onlineStatus ? '#69a024' : '#ef4444' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="px-2">
                    {/* Title and Description */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                                <h1 className="font-hebden font-extrabold text-3xl sm:text-4xl leading-tight text-[#C7F4FA] mb-2">
                                    {server.name}
                                </h1>
                                {server.description && (
                                    <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed max-w-3xl">
                                        {server.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#C7F4FA]/60 font-nunito mb-4">
                            <span className="text-[#109EB1] font-semibold">@{server.slug}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Icon icon="mdi:calendar" className="w-4 h-4" />
                                Created {formatDate(server.createdAt)}
                            </span>
                            {server.gameVersion && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Icon icon="mdi:minecraft" className="w-4 h-4" />
                                        {server.gameVersion}
                                    </span>
                                </>
                            )}
                            {server.serverIp && server.port && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Icon icon="mdi:server-network" className="w-4 h-4" />
                                        {server.serverIp}:{server.port}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 pb-6">
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {server.voteCount || 0}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Total Votes
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {server.onlineStatus ? `${server.currentPlayers}/${server.maxPlayers}` : '0'}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Players Online
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {server.onlineStatus ? '99.2%' : '0%'}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Uptime
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pb-6">
                        <Button
                            onClick={handleVote}
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
                            {copiedIP ? 'Copied!' : 'Copy IP'}
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-[#084B54]/50 hover:bg-[#084B54] border-[#109EB1]/30 text-[#C7F4FA] font-hebden px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Icon icon="mdi:share-variant" width="18" height="18" />
                            Share
                        </Button>

                        {isOwner && (
                            <Button
                                onClick={() => router.push(`/servers/${server.slug}/manage`)}
                                variant="outline"
                                className="bg-[#084B54]/50 hover:bg-[#084B54] border-[#109EB1]/30 text-[#C7F4FA] font-hebden px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                            >
                                <Icon icon="mdi:cog" width="20" height="20" />
                                Manage
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="pb-16">
                {children}
            </div>
        </div>
    );
}
