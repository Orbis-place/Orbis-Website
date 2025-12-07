'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, MessageCircle, MoreVertical, Tag } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface TeamMember {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    role: string;
    joinedAt: string;
    user: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
}

interface TeamProfile {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    website: string | null;
    discordUrl: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
    members: TeamMember[];
}

type TabType = 'overview' | 'resources' | 'servers' | 'members';

export default function TeamPage() {
    const params = useParams();
    const router = useRouter();
    const teamName = params.teamName as string;
    const [team, setTeam] = useState<TeamProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        async function fetchTeamProfile() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/teams/${teamName}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Team not found');
                    } else {
                        setError('Failed to load team');
                    }
                    return;
                }

                const data = await response.json();
                setTeam(data);
            } catch (err) {
                console.error('Error fetching team:', err);
                setError('Failed to load team');
            } finally {
                setLoading(false);
            }
        }

        if (teamName) {
            fetchTeamProfile();
        }
    }, [teamName]);

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Icon icon="mdi:account-group-outline" className="text-muted-foreground mx-auto mb-4" width="64" height="64" />
                    <h1 className="font-hebden text-2xl font-bold mb-2">{error || 'Team not found'}</h1>
                    <p className="text-muted-foreground font-nunito mb-4">This team doesn't exist.</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', basePath: `/teams/${teamName}` },
        { id: 'resources' as TabType, label: 'Resources', basePath: `/teams/${teamName}`, count: 0 },
        { id: 'servers' as TabType, label: 'Servers', basePath: `/teams/${teamName}`, count: 0 },
        { id: 'members' as TabType, label: 'Members', basePath: `/teams/${teamName}`, count: team.members.length },
    ];

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
            {/* Header Section - Same as User Profile */}
            <div className="mb-4">
                {/* Banner and Logo Container */}
                <div className="relative mb-20">
                    {/* Banner Section */}
                    <div className="relative w-full h-48 rounded-[25px] overflow-hidden">
                        {/* Banner Image or Gradient */}
                        {team.banner ? (
                            <Image
                                src={team.banner}
                                alt={`${team.displayName} banner`}
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
                                <AvatarImage src={team.logo || undefined} alt={team.displayName} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-3xl rounded-none">
                                    {getInitials(team.displayName)}
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
                                    {team.displayName}
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
                            <span className="text-[#109EB1] font-semibold">@{team.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Icon icon="mdi:calendar" className="w-4 h-4" />
                                Created {formatDate(team.createdAt)}
                            </span>
                            {team.website && (
                                <>
                                    <span>•</span>
                                    <a href={team.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#109EB1] hover:underline">
                                        <Icon icon="mdi:link" className="w-4 h-4" />
                                        Website
                                    </a>
                                </>
                            )}
                            {team.discordUrl && (
                                <>
                                    <span>•</span>
                                    <a href={team.discordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#109EB1] hover:underline">
                                        <Icon icon="mdi:discord" className="w-4 h-4" />
                                        Discord
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 pb-6">
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    {team.members.length}
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Members
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    0
                                </span>
                                <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                    Resources
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                    0
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
                            <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                                <Icon icon="mdi:package-variant-closed" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                                <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No resources yet</h3>
                                <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                                    This team hasn't published any resources.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Servers Tab */}
                    {activeTab === 'servers' && (
                        <div className="space-y-6">
                            <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                                <Icon icon="mdi:server-off" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                                <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No servers</h3>
                                <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                                    This team doesn't own any servers.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            {team.members.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {team.members.map((member) => (
                                        <Link
                                            key={member.user.id}
                                            href={`/users/${member.user.username}`}
                                            className="bg-[#06363D]/50 border border-[#084B54] rounded-[15px] p-4 hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={member.user.image || undefined} alt={member.user.username} />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-hebden">
                                                        {getInitials(member.user.displayName || member.user.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-hebden font-bold text-[#C7F4FA] truncate">
                                                        {member.user.displayName || member.user.username}
                                                    </div>
                                                    <div className="text-sm text-[#C7F4FA]/60 truncate">@{member.user.username}</div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#109EB1]/20 text-[#109EB1]">
                                                            {member.role}
                                                        </span>
                                                        <span className="text-xs text-[#C7F4FA]/50">
                                                            {formatDate(member.joinedAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                                    <Icon icon="mdi:account-group-outline" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                                    <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No members</h3>
                                    <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                                        This team doesn't have any members yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                    {/* Team Owner */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-4">Team Owner</h3>
                        <Link
                            href={`/users/${team.owner.username}`}
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

                    {/* Quick Stats */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-4">Quick Stats</h3>
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
