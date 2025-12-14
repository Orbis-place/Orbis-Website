"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface TeamMember {
    id: string;
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
    user: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
}

interface SocialLink {
    id: string;
    type: string;
    url: string;
    label: string | null;
    order: number;
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

export interface TeamProfile {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
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
    socialLinks: SocialLink[];
    _count?: {
        members: number;
        resources: number;
        servers: number;
    };
    resources?: Resource[];
    servers?: Server[];
}

interface TeamContextType {
    team: TeamProfile | null;
    isLoading: boolean;
    error: string | null;
    currentUser: any;
    userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
    canEdit: boolean;
    isOwner: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
    const { teamName } = useParams<{ teamName: string }>();
    const [team, setTeam] = useState<TeamProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        async function fetchTeamProfile() {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/teams/${teamName}`, {
                    credentials: 'include',
                });

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

        if (teamName) {
            fetchTeamProfile();
            fetchCurrentUser();
        }
    }, [teamName]);

    const userRole = team?.members?.find(m => m.user.id === currentUser?.id)?.role || null;
    const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';
    const isOwner = userRole === 'OWNER';

    return (
        <TeamContext.Provider
            value={{
                team,
                isLoading,
                error,
                currentUser,
                userRole,
                canEdit,
                isOwner,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
}
