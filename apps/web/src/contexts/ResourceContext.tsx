"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { fetchResourceBySlug, hasLikedResource, hasFavoritedResource, type Resource } from '@/lib/api/resources';
import { useSession } from '@repo/auth/client';
import { getResourceTypeBySingular, isValidSingularType } from '@/config/resource-types';

interface ResourceContextType {
    resource: Resource | null;
    isLoading: boolean;
    isLiked: boolean;
    isFavorited: boolean;
    likeCount: number;
    setIsLiked: (liked: boolean) => void;
    setIsFavorited: (favorited: boolean) => void;
    setLikeCount: (count: number) => void;
    isOwner: boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function useResource() {
    const context = useContext(ResourceContext);
    if (!context) {
        throw new Error('useResource must be used within ResourceProvider');
    }
    return context;
}

export function ResourceProvider({ children }: { children: ReactNode }) {
    const params = useParams<{ type: string; slug: string }>();
    const type = params?.type;
    const slug = params?.slug;
    const { data: session } = useSession();

    const [resource, setResource] = useState<Resource | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // Validate resource type
    useEffect(() => {
        if (type && !isValidSingularType(type)) {
            notFound();
        }
    }, [type]);

    // Fetch resource data
    useEffect(() => {
        if (!slug || !type) return;

        const loadResource = async () => {
            setIsLoading(true);

            try {
                const response = await fetchResourceBySlug(slug);
                setResource(response.resource);
                setLikeCount(response.resource.likeCount);
            } catch (err) {
                console.error('Failed to fetch resource:', err);
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        loadResource();
    }, [slug, type]);

    // Load like and favorite status if user is authenticated
    useEffect(() => {
        if (!resource || !session?.user) return;

        const loadStatus = async () => {
            try {
                const [likeStatus, favoriteStatus] = await Promise.all([
                    hasLikedResource(resource.id),
                    hasFavoritedResource(resource.id)
                ]);
                setIsLiked(likeStatus.liked);
                setIsFavorited(favoriteStatus.favorited);
            } catch (err) {
                console.error('Failed to load like/favorite status:', err);
            }
        };

        loadStatus();
    }, [resource, session?.user]);

    // Check if current user is the owner
    const isOwner = !!session?.user?.id && !!resource && session.user.id === resource.owner.id;

    const value: ResourceContextType = {
        resource,
        isLoading,
        isLiked,
        isFavorited,
        likeCount,
        setIsLiked,
        setIsFavorited,
        setLikeCount,
        isOwner,
    };

    return (
        <ResourceContext.Provider value={value}>
            {children}
        </ResourceContext.Provider>
    );
}
