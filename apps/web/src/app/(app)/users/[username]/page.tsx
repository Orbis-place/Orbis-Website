'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import Image from 'next/image';
import { Download, Heart, UserPlus, MessageCircle, MoreVertical, Tag } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Badge {
    id: string;
    awardedAt: string;
    badge: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        color: string | null;
        rarity: string;
    };
}

interface TeamMembership {
    id: string;
    role: string;
    joinedAt: string;
    team: {
        id: string;
        name: string;
        displayName: string;
        logo: string | null;
    };
}

interface Resource {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    iconUrl: string | null;
    type: string;
    status: string;
    downloadCount: number;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
}

interface Server {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    logo: string | null;
    serverIp: string;
    port: number;
    status: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
    createdAt: string;
}

interface SocialLink {
    id: string;
    type: string;
    url: string;
    label: string | null;
    order: number;
}

interface UserProfile {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    banner: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    role: string;
    status: string;
    reputation: number;
    showEmail: boolean;
    showLocation: boolean;
    showOnlineStatus: boolean;
    createdAt: string;
    lastActiveAt: string | null;
    _count: {
        followers: number;
        following: number;
        ownedResources: number;
        ownedServers: number;
    };
    userBadges: Badge[];
    teamMemberships: TeamMembership[];
    ownedResources: Resource[];
    ownedServers: Server[];
    socialLinks: SocialLink[];
}

type TabType = 'overview' | 'resources' | 'servers';

export default function UserProfilePage() {
    const { username } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/users/username/${username}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('User not found');
                    } else {
                        setError('Failed to load user profile');
                    }
                    return;
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        }

        async function fetchCurrentUser() {
            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data);
                }
            } catch (err) {
                // User not logged in, that's ok
            }
        }

        if (username) {
            fetchUserProfile();
            fetchCurrentUser();
        }
    }, [username]);

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
                // Update follower count
                if (user) {
                    setUser({
                        ...user,
                        _count: {
                            ...user._count,
                            followers: user._count.followers + (isFollowing ? -1 : 1),
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Icon icon="mdi:account-alert" className="text-muted-foreground mx-auto mb-4" width="64" height="64" />
                    <h1 className="font-hebden text-2xl font-bold mb-2">{error || 'User not found'}</h1>
                    <p className="text-muted-foreground font-nunito mb-4">The user doesn't exist.</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', basePath: `/users/${username}` },
        { id: 'resources' as TabType, label: 'Resources', basePath: `/users/${username}`, count: user._count.ownedResources },
        { id: 'servers' as TabType, label: 'Servers', basePath: `/users/${username}`, count: user._count.ownedServers },
    ];

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-500/20 text-red-400';
            case 'MODERATOR': return 'bg-blue-500/20 text-blue-400';
            case 'SUPER_ADMIN': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-primary/20 text-primary';
        }
    };

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
            {/* Header Section - Inspired by ResourceHeader */}
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
                            {user.showOnlineStatus && (
                                <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 rounded-full border-4 border-[#032125]" />
                            )}
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
                                    {user.displayName || user.username}
                                </h1>
                                {user.bio && (
                                    <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed max-w-3xl">
                                        {user.bio}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {/* Only show follow button if not own profile */}
                                {currentUser && currentUser.id !== user.id && (
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-full font-hebden font-extrabold text-base transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                                            ? 'bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] text-[#C7F4FA]'
                                            : 'bg-[#109EB1] hover:bg-[#0D8A9A] text-[#C7F4FA]'
                                            }`}
                                    >
                                        {followLoading ? (
                                            <>
                                                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                                                <span className="hidden sm:inline">Loading...</span>
                                            </>
                                        ) : isFollowing ? (
                                            <>
                                                <Icon icon="mdi:account-check" className="w-5 h-5" />
                                                <span className="hidden sm:inline">Following</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                <span className="hidden sm:inline">Follow</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {currentUser && currentUser.id !== user.id && (
                                    <button className="flex items-center justify-center w-12 h-12 bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] rounded-full transition-all">
                                        <MessageCircle className="w-5 h-5 text-[#C7F4FA]" />
                                    </button>
                                )}

                                {currentUser && currentUser.id !== user.id && (
                                    <button className="flex items-center justify-center w-12 h-12 hover:bg-[#06363D] border border-transparent hover:border-[#084B54] rounded-full transition-all">
                                        <MoreVertical className="w-5 h-5 text-[#C7F4FA]" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#C7F4FA]/60 font-nunito mb-4">
                            <span className="text-[#109EB1] font-semibold">@{user.username}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Icon icon="mdi:calendar" className="w-4 h-4" />
                                Joined {formatDate(user.createdAt)}
                            </span>
                            {user.showLocation && user.location && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Icon icon="mdi:map-marker" className="w-4 h-4" />
                                        {user.location}
                                    </span>
                                </>
                            )}
                            {user.website && (
                                <>
                                    <span>•</span>
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#109EB1] hover:underline">
                                        <Icon icon="mdi:link" className="w-4 h-4" />
                                        Website
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats and Tags */}
                    <div className="flex flex-wrap items-center gap-6 pb-6">
                        {/* Stats */}
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {user._count.followers.toLocaleString()}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Followers
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {user._count.following.toLocaleString()}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Following
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {user.reputation.toLocaleString()}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Reputation
                                </span>
                            </div>
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
                </div>
            </div>

            {/* Tabs Navigation - Resource Style */}
            <div className="flex gap-1 mb-8 border-b border-[#084B54]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 font-hebden font-bold text-base transition-all relative ${activeTab === tab.id
                            ? 'text-[#109EB1]'
                            : 'text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#109EB1]/20 text-[#109EB1]">
                                {tab.count}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#109EB1] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Teams */}
                            {user.teamMemberships.length > 0 && (
                                <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                                    <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:office-building" width="24" height="24" className="text-[#109EB1]" />
                                        Teams ({user.teamMemberships.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {user.teamMemberships.map((membership) => (
                                            <Link
                                                key={membership.id}
                                                href={`/teams/${membership.team.name}`}
                                                className="group flex items-center gap-4 p-4 bg-[#032125]/50 border border-[#084B54] rounded-[15px] hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                                            >
                                                <Avatar className="h-14 w-14 border-2 border-[#084B54]">
                                                    <AvatarImage src={membership.team.logo || undefined} alt={membership.team.displayName} />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-hebden text-lg">
                                                        {getInitials(membership.team.displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-hebden text-base font-bold text-[#C7F4FA] group-hover:text-[#109EB1] transition-colors truncate">
                                                        {membership.team.displayName}
                                                    </div>
                                                    <div className="text-sm text-[#C7F4FA]/60 font-nunito">
                                                        {membership.role}
                                                    </div>
                                                </div>
                                                <Icon
                                                    icon="mdi:chevron-right"
                                                    width="24"
                                                    height="24"
                                                    className="text-[#C7F4FA]/40 group-hover:text-[#109EB1] transition-colors"
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity */}
                            <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                                <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:clock-outline" width="24" height="24" className="text-[#109EB1]" />
                                    Recent Activity
                                </h3>
                                <div className="text-center py-12 text-[#C7F4FA]/60">
                                    <Icon icon="mdi:history" width="48" height="48" className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-nunito">No recent activity</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === 'resources' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.ownedResources.length > 0 ? (
                                    user.ownedResources.map((resource) => (
                                        <a
                                            key={resource.id}
                                            href={`/resources/${resource.slug}`}
                                            className="bg-[#06363D]/50 border border-[#084B54] rounded-[15px] p-4 hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="h-12 w-12 rounded-lg bg-[#032125] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {resource.iconUrl ? (
                                                        <img src={resource.iconUrl} alt={resource.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon icon="mdi:package-variant" width="24" height="24" className="text-[#C7F4FA]/60" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-hebden font-bold text-[#C7F4FA] truncate">{resource.name}</h3>
                                                    <p className="text-xs text-[#C7F4FA]/60 font-nunito">{resource.type.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-[#C7F4FA]/70 font-nunito line-clamp-2 mb-3">
                                                {resource.tagline}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-[#C7F4FA]/60 font-nunito">
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:download" width="14" height="14" />
                                                    {resource.downloadCount}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:heart" width="14" height="14" />
                                                    {resource.likeCount}
                                                </span>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                                        <Icon icon="mdi:package-variant-closed" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No resources yet</h3>
                                        <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                                            This user hasn't published any resources.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Servers Tab */}
                    {activeTab === 'servers' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.ownedServers.length > 0 ? (
                                    user.ownedServers.map((server) => (
                                        <a
                                            key={server.id}
                                            href={`/servers/${server.slug}`}
                                            className="bg-[#06363D]/50 border border-[#084B54] rounded-[15px] p-4 hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="h-12 w-12 rounded-lg bg-[#032125] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {server.logo ? (
                                                        <img src={server.logo} alt={server.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon icon="mdi:server" width="24" height="24" className="text-[#C7F4FA]/60" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-hebden font-bold text-[#C7F4FA] truncate">{server.name}</h3>
                                                        {server.isOnline && (
                                                            <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#C7F4FA]/60 font-nunito">{server.serverIp}:{server.port}</p>
                                                </div>
                                            </div>
                                            {server.shortDesc && (
                                                <p className="text-sm text-[#C7F4FA]/70 font-nunito line-clamp-2 mb-3">
                                                    {server.shortDesc}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-4 text-[#C7F4FA]/60 font-nunito">
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="mdi:account" width="14" height="14" />
                                                        {server.currentPlayers}/{server.maxPlayers}
                                                    </span>
                                                    <span className={server.isOnline ? 'text-green-500' : 'text-red-500'}>
                                                        {server.isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                                        <Icon icon="mdi:server-off" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No servers</h3>
                                        <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                                            This user doesn't own any servers.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                    {/* Social Links */}
                    {user.socialLinks && user.socialLinks.length > 0 && (
                        <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                            <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-4">Social Links</h3>
                            <div className="flex flex-col gap-3">
                                {user.socialLinks.map((link) => {
                                    const getIcon = (type: string) => {
                                        switch (type) {
                                            case 'TWITTER': return 'mdi:twitter';
                                            case 'GITHUB': return 'mdi:github';
                                            case 'DISCORD': return 'ic:baseline-discord';
                                            case 'YOUTUBE': return 'mdi:youtube';
                                            case 'TWITCH': return 'mdi:twitch';
                                            case 'LINKEDIN': return 'mdi:linkedin';
                                            case 'INSTAGRAM': return 'mdi:instagram';
                                            case 'FACEBOOK': return 'mdi:facebook';
                                            case 'REDDIT': return 'mdi:reddit';
                                            case 'TIKTOK': return 'ic:baseline-tiktok';
                                            default: return 'mdi:link';
                                        }
                                    };

                                    const getColor = (type: string) => {
                                        switch (type) {
                                            case 'TWITTER': return '#1DA1F2';
                                            case 'GITHUB': return '#ffffff';
                                            case 'DISCORD': return '#5865F2';
                                            case 'YOUTUBE': return '#FF0000';
                                            case 'TWITCH': return '#9146FF';
                                            case 'LINKEDIN': return '#0A66C2';
                                            case 'INSTAGRAM': return '#E4405F';
                                            case 'FACEBOOK': return '#1877F2';
                                            case 'REDDIT': return '#FF4500';
                                            case 'TIKTOK': return '#000000';
                                            default: return '#109EB1';
                                        }
                                    };

                                    return (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-[#032125]/50 border border-[#084B54] rounded-[15px] hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all group"
                                        >
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#032125] border border-[#084B54] group-hover:border-[#109EB1]/50 transition-colors">
                                                <Icon
                                                    icon={getIcon(link.type)}
                                                    width="18"
                                                    height="18"
                                                    style={{ color: getColor(link.type) }}
                                                />
                                            </div>
                                            <span className="font-nunito font-semibold text-[#C7F4FA] group-hover:text-[#109EB1] transition-colors">
                                                {link.label || link.type.charAt(0) + link.type.slice(1).toLowerCase()}
                                            </span>
                                            <Icon
                                                icon="mdi:external-link"
                                                width="16"
                                                height="16"
                                                className="ml-auto text-[#C7F4FA]/40 group-hover:text-[#109EB1] transition-colors"
                                            />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-4">Quick Stats</h3>
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
                        <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                            <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                                <Icon icon="mdi:trophy-variant" width="20" height="20" className="text-[#109EB1]" />
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
                                                <Icon icon="mdi:trophy" width="18" height="18" className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
