"use client";

import { ReactNode, useState } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, MessageCircle, MoreVertical, Tag, Flag, Copy } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportUserDialog } from '@/components/ReportUserDialog';
import UserProfileTabs from '@/components/user/UserProfileTabs';
import { UserProvider, useUser } from '@/contexts/UserContext';
import FollowListDialog from '@/components/user/FollowListDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function UserProfileLayoutContent({ children }: { children: ReactNode }) {
    const { user, setUser, isLoading, error, isFollowing, setIsFollowing, currentUser } = useUser();
    const [followLoading, setFollowLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [followListDialogOpen, setFollowListDialogOpen] = useState(false);
    const [followListInitialTab, setFollowListInitialTab] = useState<'followers' | 'following'>('followers');

    const handleCopyId = () => {
        if (user) {
            navigator.clipboard.writeText(user.id);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const handleFollowToggle = async () => {
        if (!currentUser || !user) return;

        setFollowLoading(true);
        try {
            const endpoint = isFollowing
                ? `${API_URL}/users/${user.id}/follow`
                : `${API_URL}/users/${user.id}/follow`;

            const response = await fetch(endpoint, {
                method: isFollowing ? 'DELETE' : 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                if (user) {
                    setUser({
                        ...user,
                        _count: {
                            ...user._count,
                            followers: isFollowing ? user._count.followers - 1 : user._count.followers + 1,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-500/20 text-red-400';
            case 'MODERATOR': return 'bg-blue-500/20 text-blue-400';
            case 'SUPER_ADMIN': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-primary/20 text-primary';
        }
    };

    // Follow button component to avoid duplication
    const FollowButton = ({ className = '' }: { className?: string }) => (
        <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full font-hebden font-extrabold text-base transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                ? 'bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] text-[#C7F4FA]'
                : 'bg-[#109EB1] hover:bg-[#0D8A9A] text-[#C7F4FA]'
                } ${className}`}
        >
            {followLoading ? (
                <>
                    <Icon ssr={true} icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : isFollowing ? (
                <>
                    <Icon ssr={true} icon="mdi:account-check" className="w-5 h-5" />
                    <span>Following</span>
                </>
            ) : (
                <>
                    <UserPlus className="w-5 h-5" />
                    <span>Follow</span>
                </>
            )}
        </button>
    );

    if (isLoading || !user) {
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
                        <Icon ssr={true} icon="mdi:account-alert" className="text-muted-foreground mx-auto mb-4" width="64" height="64" />
                        <h1 className="font-hebden text-2xl font-bold mb-2">{error}</h1>
                        <p className="text-muted-foreground font-nunito mb-4">The user doesn't exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
            {/* Header Section */}
            <div className="mb-4">
                {/* Banner and Avatar Container */}
                <div className="relative mb-20">
                    {/* Banner Section */}
                    <div className="relative w-full h-48 rounded-[25px] overflow-hidden">
                        {/* Banner Image or Gradient */}
                        {user.banner ? (
                            <Image
                                src={user.banner}
                                alt={`${user.displayName || user.username} banner`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]" />
                        )}

                        {/* Role Badge on Banner */}
                        {user.role !== 'USER' && (
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-2 rounded-full font-hebden font-bold text-sm ${getRoleColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Avatar - Overlapping Banner */}
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative">
                            <div className="relative w-32 h-32 rounded-[25px] overflow-hidden border-4 border-[#032125] shadow-2xl bg-[#032125]">
                                <Avatar className="h-full w-full rounded-none">
                                    <AvatarImage src={user.image || undefined} alt={user.displayName || user.username} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-3xl rounded-none">
                                        {getInitials(user.displayName || user.username)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Below banner */}
                    {currentUser && currentUser.id !== user.id && (
                        <div className="absolute -bottom-16 right-2 flex gap-3">
                            {/* Follow button - Desktop only */}
                            <div className="hidden sm:flex">
                                <FollowButton />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center justify-center w-12 h-12 hover:bg-[#06363D] border border-transparent hover:border-[#084B54] rounded-full transition-all">
                                        <MoreVertical className="w-5 h-5 text-[#C7F4FA]" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-accent border border-border font-hebden">
                                    <DropdownMenuItem
                                        onClick={() => setReportDialogOpen(true)}
                                        className="text-destructive cursor-pointer flex items-center gap-2 data-[highlighted]:text-destructive"
                                    >
                                        <Flag className="w-4 h-4 text-destructive" />
                                        Report
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#084B54]" />
                                    <DropdownMenuItem onClick={handleCopyId} className="text-foreground cursor-pointer flex items-center gap-2">
                                        <Copy className="w-4 h-4" />
                                        {copySuccess ? 'Copied!' : 'Copy ID'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="px-2">
                {/* Title and Description */}
                <div className="mb-4">
                    <h1 className="font-hebden font-extrabold text-3xl sm:text-4xl leading-tight text-[#C7F4FA] mb-2 items-center flex gap-2">
                        {user.displayName || user.username}
                        {user.isVerifiedCreator && (
                            <div className="inline-flex relative group">
                                <Icon
                                    ssr={true}
                                    icon="mdi:check-decagram"
                                    className="w-6 h-6 sm:w-8 sm:h-8 text-[#109EB1]"
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#06363D] border border-[#084B54] text-[#C7F4FA] text-xs font-nunito rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Verified Creator
                                </div>
                            </div>
                        )}
                    </h1>
                    {user.bio && (
                        <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                            {user.bio}
                        </p>
                    )}
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#C7F4FA]/60 font-nunito mb-4">
                    <span className="text-[#109EB1] font-semibold">@{user.username}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                        <Icon ssr={true} icon="mdi:calendar" className="w-4 h-4" />
                        Joined {formatDate(user.createdAt)}
                    </span>
                    {user.showLocation && user.location && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Icon ssr={true} icon="mdi:map-marker" className="w-4 h-4" />
                                {user.location}
                            </span>
                        </>
                    )}
                    {user.website && (
                        <>
                            <span>•</span>
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#109EB1] hover:underline">
                                <Icon ssr={true} icon="mdi:link" className="w-4 h-4" />
                                Website
                            </a>
                        </>
                    )}
                </div>

                {/* Stats and Tags */}
                <div className="flex flex-wrap items-center gap-6 pb-6">
                    {/* Stats */}
                    <div className="flex gap-6">
                        <button
                            onClick={() => {
                                setFollowListInitialTab('followers');
                                setFollowListDialogOpen(true);
                            }}
                            className="flex flex-col hover:opacity-80 transition-opacity cursor-pointer text-left"
                        >
                            <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                {user._count.followers.toLocaleString()}
                            </span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                Followers
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setFollowListInitialTab('following');
                                setFollowListDialogOpen(true);
                            }}
                            className="flex flex-col hover:opacity-80 transition-opacity cursor-pointer text-left"
                        >
                            <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                {user._count.following.toLocaleString()}
                            </span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                Following
                            </span>
                        </button>
                    </div>

                    {/* Badges */}
                    {user.userBadges.length > 0 && (
                        <div className="flex items-center gap-2 flex-1">
                            <Tag className="w-5 h-5 text-[#C7F4FA]/50" />
                            <div className="flex flex-wrap gap-2">
                                {user.userBadges.slice(0, 5).map((userBadge) => (
                                    <span
                                        key={userBadge.id}
                                        className="px-3 py-1.5 bg-[#06363D] border border-[#084B54] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA] hover:bg-[#084B54] transition-colors cursor-pointer"
                                        title={userBadge.badge.name}
                                    >
                                        {userBadge.badge.name}
                                    </span>
                                ))}
                                {user.userBadges.length > 5 && (
                                    <span className="px-3 py-1.5 bg-[#06363D] border border-[#084B54] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA]">
                                        +{user.userBadges.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary action button (Follow) - Mobile only */}
                {currentUser && currentUser.id !== user.id && (
                    <div className="pb-6 sm:hidden">
                        <FollowButton className="w-full" />
                    </div>
                )}
            </div>

            {/* Tabs Navigation */}
            <UserProfileTabs
                username={user.username}
                resourceCount={user._count.ownedResources}
                serverCount={user._count.ownedServers}
            />

            {/* Main Content + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                    {/* Teams */}
                    {user.teamMemberships.length > 0 && (
                        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                            <h3 className="font-hebden text-lg font-semibold text-[#C7F4FA] m-0">Teams</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {user.teamMemberships.map((membership) => {
                                    const getInitials = (name: string) => {
                                        if (!name) return '??';
                                        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                                    };

                                    return (
                                        <Link
                                            key={membership.id}
                                            href={`/team/${membership.team.name}`}
                                            className="group relative"
                                            title={membership.team.name}
                                        >
                                            <Avatar className="h-12 w-12 border-2 border-[#084B54] group-hover:border-[#109EB1] transition-colors">
                                                <AvatarImage src={membership.team.logo || undefined} alt={membership.team.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-sm">
                                                    {getInitials(membership.team.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {user.socialLinks && user.socialLinks.length > 0 && (
                        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                            <h3 className="font-hebden text-lg font-semibold text-[#C7F4FA] m-0">Social Links</h3>
                            <div className="flex flex-col gap-3">
                                {user.socialLinks.map((link) => {
                                    const getIcon = (type: string) => {
                                        switch (type) {
                                            case 'TWITTER': return 'mdi:twitter';
                                            case 'GITHUB': return 'mdi:github';
                                            case 'DISCORD': return 'mdi:discord';
                                            case 'YOUTUBE': return 'mdi:youtube';
                                            case 'TWITCH': return 'mdi:twitch';
                                            case 'LINKEDIN': return 'mdi:linkedin';
                                            case 'INSTAGRAM': return 'mdi:instagram';
                                            case 'FACEBOOK': return 'mdi:facebook';
                                            case 'REDDIT': return 'mdi:reddit';
                                            case 'TIKTOK': return 'mdi:music-note';
                                            case 'CUSTOM': return 'mdi:link-variant';
                                            default: return 'mdi:link-variant';
                                        }
                                    };

                                    // For CUSTOM links without label, show the URL
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
                                                <Icon ssr={true} icon={getIcon(link.type)}
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
                                <span className="text-[#C7F4FA]/60 font-nunito">Resources</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{user._count.ownedResources}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#C7F4FA]/60 font-nunito">Servers</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{user._count.ownedServers}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#C7F4FA]/60 font-nunito">Member Since</span>
                                <span className="font-hebden font-bold text-[#C7F4FA]">{formatDate(user.createdAt)}</span>
                            </div>
                            {user.lastActiveAt && user.showOnlineStatus && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[#C7F4FA]/60 font-nunito">Last Active</span>
                                    <span className="font-hebden font-bold text-[#C7F4FA]">{formatDate(user.lastActiveAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* All Badges */}
                    {user.userBadges.length > 0 && (
                        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                            <h3 className="font-hebden text-lg font-semibold text-[#C7F4FA] m-0 flex items-center gap-2">
                                <Icon ssr={true} icon="mdi:trophy-variant" width="20" height="20" className="text-[#109EB1]" />
                                Badges ({user.userBadges.length})
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {user.userBadges.map((userBadge) => (
                                    <div
                                        key={userBadge.id}
                                        className="aspect-square rounded-lg bg-[#032125]/50 hover:bg-[#084B54]/50 border border-[#084B54] transition-colors flex items-center justify-center cursor-pointer group relative"
                                        title={userBadge.badge.name}
                                    >
                                        {userBadge.badge.icon ? (
                                            <img src={userBadge.badge.icon} alt={userBadge.badge.name} className="w-8 h-8" />
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: userBadge.badge.color || '#109EB1' }}
                                            >
                                                <Icon ssr={true} icon="mdi:trophy" width="18" height="18" className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Follow List Dialog */}
            <FollowListDialog
                open={followListDialogOpen}
                onOpenChange={setFollowListDialogOpen}
                initialTab={followListInitialTab}
                userId={user.id}
                username={user.username}
            />

            {/* Report Dialog */}
            <ReportUserDialog
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
                userId={user.id}
                username={user.username}
            />
        </div>
    );
}

export default function UserProfileLayout({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <UserProfileLayoutContent>
                {children}
            </UserProfileLayoutContent>
        </UserProvider>
    );
}