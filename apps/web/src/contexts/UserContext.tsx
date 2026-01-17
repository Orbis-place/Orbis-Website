"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';

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
        slug: string;
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

export interface UserProfile {
    id: string;
    isVerifiedCreator: boolean;
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
    isFollowing?: boolean;
}

interface UserContextType {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    isLoading: boolean;
    error: string | null;
    isFollowing: boolean;
    setIsFollowing: (value: boolean) => void;
    currentUser: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/users/username/${username}`, {
                    credentials: 'include',
                });

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
                if (typeof data.isFollowing === 'boolean') {
                    setIsFollowing(data.isFollowing);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user profile');
            } finally {
                setIsLoading(false);
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

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                error,
                isFollowing,
                setIsFollowing,
                currentUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
