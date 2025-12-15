'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

interface ServerCategory {
    id: string;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
}

interface ServerTag {
    id: string;
    name: string;
    slug: string;
}

interface Server {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDesc?: string;
    serverIp: string;
    port: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';
    logoUrl?: string;
    bannerUrl?: string;
    gameVersion: string;
    supportedVersions: string[];
    currentPlayers: number;
    maxPlayers: number;
    onlineStatus: boolean;
    voteCount: number;
    websiteUrl?: string;
    discordUrl?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    featured: boolean;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
    isOwner?: boolean;
    owner?: {
        id: string;
        username: string;
        displayName?: string;
        image?: string;
    };
    team?: {
        id: string;
        name: string;
        displayName?: string;
        logo?: string;
    };
    categories?: Array<{
        category: ServerCategory;
        isPrimary: boolean;
    }>;
    tags?: Array<{
        tag: ServerTag;
    }>;
}

interface ServerContextType {
    server: Server | null;
    isLoading: boolean;
    isOwner: boolean;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
    const params = useParams();
    const slug = params.slug as string;
    const [server, setServer] = useState<Server | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchServer = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/servers/${slug}`, {
                    credentials: 'include', // Include credentials for session
                });

                if (response.ok) {
                    const data = await response.json();
                    setServer(data);

                    // Set isOwner from the API response
                    setIsOwner(data.isOwner || false);
                } else {
                    // Server not found or access denied - show 404 page
                    notFound();
                }
            } catch (error) {
                console.error('Failed to fetch server:', error);
                // Network error or other issue - show 404 page
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchServer();
    }, [slug]);

    return (
        <ServerContext.Provider value={{ server, isLoading: loading, isOwner }}>
            {children}
        </ServerContext.Provider>
    );
}

export function useServer() {
    const context = useContext(ServerContext);
    if (context === undefined) {
        throw new Error('useServer must be used within a ServerProvider');
    }
    return context;
}
