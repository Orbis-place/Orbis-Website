"use client";

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import TeamProfileTabs from '@/components/team/TeamProfileTabs';
import { TeamProvider, useTeam } from '@/contexts/TeamContext';

function TeamProfileLayoutContent({ children }: { children: ReactNode }) {
    const { team, isLoading, error } = useTeam();

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getSocialIcon = (type: string) => {
        const icons: Record<string, string> = {
            'TWITTER': 'mdi:twitter',
            'GITHUB': 'mdi:github',
            'DISCORD': 'mdi:discord',
            'YOUTUBE': 'mdi:youtube',
            'TWITCH': 'mdi:twitch',
            'LINKEDIN': 'mdi:linkedin',
            'INSTAGRAM': 'mdi:instagram',
            'FACEBOOK': 'mdi:facebook',
            'REDDIT': 'mdi:reddit',
            'TIKTOK': 'mdi:music-note',
            'CUSTOM': 'mdi:link-variant',
        };
        return icons[type] || 'mdi:link-variant';
    };

    if (isLoading || !team) {
        return (
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                <div className="flex items-center justify-center min-h-screen">
                    <Icon ssr={true} icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Icon ssr={true} icon="mdi:account-group-outline" className="text-muted-foreground mx-auto mb-4" width="64" height="64" />
                        <h1 className="font-hebden text-2xl font-bold mb-2">{error}</h1>
                        <p className="text-muted-foreground font-nunito mb-4">This team doesn't exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
            {/* Header Section */}
            <div className="mb-4">
                {/* Banner and Logo Container */}
                <div className="relative mb-20">
                    {/* Banner Section */}
                    <div className="relative w-full h-48 rounded-[25px] overflow-hidden">
                        {/* Banner Image or Gradient */}
                        {team.banner ? (
                            <Image
                                src={team.banner}
                                alt={`${team.slug} banner`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]" />
                        )}
                    </div>

                    {/* Logo - Overlapping Banner */}
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative w-32 h-32 rounded-[25px] overflow-hidden border-4 border-[#032125] shadow-2xl bg-[#032125]">
                            <Avatar className="h-full w-full rounded-none">
                                <AvatarImage src={team.logo || undefined} alt={team.slug} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-3xl rounded-none">
                                    {getInitials(team.slug)}
                                </AvatarFallback>
                            </Avatar>
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
                                    {team.name}
                                </h1>
                                {team.description && (
                                    <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed max-w-3xl">
                                        {team.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#C7F4FA]/60 font-nunito mb-4">
                            <span className="flex items-center gap-1.5">
                                <Icon ssr={true} icon="mdi:calendar" className="w-4 h-4" />
                                Created {formatDate(team.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 pb-6">
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {team._count?.members || team.members.length}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Members
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {team._count?.resources || 0}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Resources
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {team._count?.servers || 0}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Servers
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <TeamProfileTabs
                teamName={team.name}
                teamSlug={team.slug}
                resourceCount={team._count?.resources || 0}
                serverCount={team._count?.servers || 0}
                memberCount={team._count?.members || team.members.length}
            />

            {/* Main Content + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                    {/* Team Owner */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                        <h3 className="font-hebden text-lg font-semibold text-[#C7F4FA] m-0">Team Owner</h3>
                        <Link
                            href={`/user/${team.owner.username}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#032125]/50 transition-colors"
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={team.owner.image || undefined} alt={team.owner.displayName || team.owner.username} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-hebden">
                                    {getInitials(team.owner.displayName || team.owner.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="font-hebden text-base font-bold text-[#C7F4FA] truncate">
                                    {team.owner.displayName || team.owner.username}
                                </div>
                                <div className="text-sm text-[#C7F4FA]/60">@{team.owner.username}</div>
                            </div>
                        </Link>
                    </div>

                    {/* Social Links */}
                    {team.socialLinks && team.socialLinks.length > 0 && (
                        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                            <h3 className="font-hebden text-lg font-semibold text-[#C7F4FA] m-0">Social Links</h3>
                            <div className="flex flex-col gap-3">
                                {team.socialLinks.map((link) => {
                                    const displayLabel = link.label || (link.type === 'CUSTOM' ? link.url : link.type.charAt(0) + link.type.slice(1).toLowerCase());

                                    return (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-[#109EB1] hover:underline font-hebden font-semibold text-sm group"
                                        >
                                            <span className="text-[#109EB1]">
                                                <Icon ssr={true} icon={getSocialIcon(link.type)}
                                                    width="20"
                                                    height="20"
                                                />
                                            </span>
                                            <span className="flex-1 truncate">{displayLabel}</span>
                                            <Icon ssr={true} icon="mdi:external-link"
                                                width="16"
                                                height="16"
                                                className="text-[#C7F4FA]/50 group-hover:text-[#C7F4FA] flex-shrink-0"
                                            />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                        <h3 className="font-hebden text-lg font-semibold text-[#C7F4FA] m-0">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#C7F4FA]/60 font-nunito">Total Downloads</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">0</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#C7F4FA]/60 font-nunito">Total Likes</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">0</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#C7F4FA]/60 font-nunito">Created</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{formatDate(team.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#C7F4FA]/60 font-nunito">Last Updated</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{formatDate(team.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TeamProfileLayout({ children }: { children: ReactNode }) {
    return (
        <TeamProvider>
            <TeamProfileLayoutContent>
                {children}
            </TeamProfileLayoutContent>
        </TeamProvider>
    );
}
