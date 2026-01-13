"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UserListCardProps {
    user: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
        bio: string | null;
        _count: {
            followers: number;
            following: number;
        };
    };
    currentUserId?: string;
    isFollowing?: boolean;
    onFollowChange?: () => void;
}

export default function UserListCard({ user, currentUserId, isFollowing: initialIsFollowing, onFollowChange }: UserListCardProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);
    const [followLoading, setFollowLoading] = useState(false);

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleFollowToggle = async () => {
        if (!currentUserId) return;

        setFollowLoading(true);
        try {
            const endpoint = `${API_URL}/users/${user.id}/follow`;
            const response = await fetch(endpoint, {
                method: isFollowing ? 'DELETE' : 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                onFollowChange?.();
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const isCurrentUser = currentUserId === user.id;

    return (
        <div className="flex items-center gap-3 p-4 bg-[#06363D] border border-[#084B54] rounded-xl hover:bg-[#084B54]/30 transition-colors">
            {/* Avatar */}
            <Link href={`/user/${user.username}`} className="flex-shrink-0">
                <Avatar className="h-12 w-12 rounded-lg border-2 border-[#084B54]">
                    <AvatarImage src={user.image || undefined} alt={user.displayName || user.username} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-sm rounded-lg">
                        {getInitials(user.displayName || user.username)}
                    </AvatarFallback>
                </Avatar>
            </Link>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <Link href={`/user/${user.username}`}>
                    <h3 className="font-hebden font-bold text-[#C7F4FA] text-sm truncate hover:text-[#109EB1] transition-colors">
                        {user.displayName || user.username}
                    </h3>
                </Link>
                <p className="font-nunito text-xs text-[#C7F4FA]/60 truncate">
                    @{user.username}
                </p>
                {user.bio && (
                    <p className="font-nunito text-xs text-[#C7F4FA]/50 truncate mt-1">
                        {user.bio}
                    </p>
                )}
                <div className="flex gap-3 mt-1 text-xs font-nunito text-[#C7F4FA]/60">
                    <span>{user._count.followers} followers</span>
                    <span>•</span>
                    <span>{user._count.following} following</span>
                </div>
            </div>

            {/* Follow Button */}
            {currentUserId && !isCurrentUser && (
                <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full font-hebden font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                        ? 'bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] text-[#C7F4FA]'
                        : 'bg-[#109EB1] hover:bg-[#0D8A9A] text-[#C7F4FA]'
                        }`}
                >
                    {followLoading ? (
                        <Icon ssr={true} icon="mdi:loading" className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                        <>
                            <Icon ssr={true} icon="mdi:account-check" className="w-4 h-4" />
                            <span>Following</span>
                        </>
                    ) : (
                        <>
                            <Icon ssr={true} icon="mdi:account-plus" className="w-4 h-4" />
                            <span>Follow</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
