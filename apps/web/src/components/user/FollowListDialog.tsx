"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { OrbisDialog } from '@/components/OrbisDialog';
import UserListCard from '@/components/user/UserListCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface User {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    bio: string | null;
    followedAt: string;
    _count: {
        followers: number;
        following: number;
    };
}

interface CurrentUser {
    id: string;
    username: string;
}

interface FollowListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: 'followers' | 'following';
    userId: string;
    username: string;
}

export default function FollowListDialog({
    open,
    onOpenChange,
    initialTab = 'followers',
    userId,
    username,
}: FollowListDialogProps) {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [followers, setFollowers] = useState<User[]>([]);
    const [followings, setFollowings] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser({
                        id: userData.id,
                        username: userData.username,
                    });
                }
            } catch (err) {
                console.error('Error fetching current user:', err);
            }
        };

        if (open) {
            fetchCurrentUser();
        }
    }, [open]);

    // Fetch followers
    const fetchFollowers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/users/${userId}/followers`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 403) {
                    setError('Followers list is private');
                } else if (response.status === 401) {
                    setError('You must be logged in');
                } else {
                    setError('Failed to load followers');
                }
                return;
            }

            const data = await response.json();
            setFollowers(data);
        } catch (err) {
            console.error('Error fetching followers:', err);
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch followings
    const fetchFollowings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/users/${userId}/following`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 403) {
                    setError('Following list is private');
                } else if (response.status === 401) {
                    setError('You must be logged in');
                } else {
                    setError('Failed to load followings');
                }
                return;
            }

            const data = await response.json();
            setFollowings(data);

            // Create set of following IDs for follow status
            const ids = new Set<string>(data.map((u: User) => u.id));
            setFollowingIds(ids);
        } catch (err) {
            console.error('Error fetching followings:', err);
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when tab changes or dialog opens
    useEffect(() => {
        if (open && currentUser) {
            // Check if viewing own profile
            const isOwnProfile = currentUser.id === userId;

            if (!isOwnProfile) {
                // Not viewing own profile - show privacy message
                setIsLoading(false);
                setError('This list is private');
                return;
            }

            // Own profile - fetch data normally
            if (activeTab === 'followers') {
                fetchFollowers();
            } else {
                fetchFollowings();
            }
        }
    }, [open, activeTab, currentUser, userId]);

    const handleFollowChange = async () => {
        // Refetch the current tab
        if (activeTab === 'followers') {
            // Also refetch followings to update follow status
            await fetchFollowings();
            await fetchFollowers();
        } else {
            await fetchFollowings();
        }
    };

    const handleTabChange = (tab: 'followers' | 'following') => {
        setActiveTab(tab);
        setError(null);
    };

    const users = activeTab === 'followers' ? followers : followings;

    return (
        <OrbisDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            title=""
            showCloseButton={true}
            className="max-h-[80vh] flex flex-col"
        >
            {/* Custom Header with Tabs */}
            <div className="space-y-4 -mt-2">
                <div>
                    <h2 className="font-hebden text-xl font-bold text-[#C7F4FA]">
                        @{username}
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-[#084B54]">
                    <button
                        onClick={() => handleTabChange('followers')}
                        className={`flex-1 py-3 font-hebden font-bold text-sm transition-all relative ${activeTab === 'followers'
                            ? 'text-[#109EB1]'
                            : 'text-[#C7F4FA]/60 hover:text-[#C7F4FA]/80'
                            }`}
                    >
                        Followers
                        {activeTab === 'followers' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#109EB1]" />
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange('following')}
                        className={`flex-1 py-3 font-hebden font-bold text-sm transition-all relative ${activeTab === 'following'
                            ? 'text-[#109EB1]'
                            : 'text-[#C7F4FA]/60 hover:text-[#C7F4FA]/80'
                            }`}
                    >
                        Following
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#109EB1]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[500px] -mx-6 px-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Icon ssr={true} icon="mdi:loading" className="animate-spin text-primary w-8 h-8" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon ssr={true} icon="mdi:lock" className="w-16 h-16 text-[#C7F4FA]/30 mb-4" />
                        <h3 className="font-hebden font-bold text-lg text-[#C7F4FA] mb-2">
                            {error}
                        </h3>
                        <p className="font-nunito text-sm text-[#C7F4FA]/60">
                            {activeTab === 'followers' ? 'Followers' : 'Following'} lists are currently private.
                        </p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon ssr={true} icon="mdi:account-multiple-outline" className="w-16 h-16 text-[#C7F4FA]/30 mb-4" />
                        <h3 className="font-hebden font-bold text-lg text-[#C7F4FA] mb-2">
                            {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                        </h3>
                        <p className="font-nunito text-sm text-[#C7F4FA]/60">
                            {activeTab === 'followers'
                                ? "When people follow you, they'll appear here."
                                : "When you follow people, they'll appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 py-2">
                        {users.map((user) => (
                            <UserListCard
                                key={user.id}
                                user={user}
                                currentUserId={currentUser?.id}
                                isFollowing={activeTab === 'following' ? true : followingIds.has(user.id)}
                                onFollowChange={handleFollowChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </OrbisDialog>
    );
}
