"use client";

import { ReactNode, useState } from 'react';
import { useParams } from 'next/navigation';
import ResourceHeader from '@/components/marketplace/ResourceHeader';
import ResourceSidebar from '@/components/marketplace/ResourceSidebar';
import ResourceTabs from '@/components/marketplace/ResourceTabs';
import { Icon } from '@iconify-icon/react';
import { getResourceTypeBySingular } from '@/config/resource-types';
import { useResource } from '@/contexts/ResourceContext';
import { likeResource, unlikeResource, favoriteResource, unfavoriteResource } from '@/lib/api/resources';
import { useSession } from '@repo/auth/client';

export default function ResourceLayoutContent({ children }: { children: ReactNode }) {
    const params = useParams<{ type: string; slug: string }>();
    const type = params?.type;

    const {
        resource,
        isLoading,
        isLiked,
        isFavorited,
        likeCount,
        setIsLiked,
        setIsFavorited,
        setLikeCount,
        isOwner
    } = useResource();

    const { data: session } = useSession();
    const [isLiking, setIsLiking] = useState(false);
    const [isFavoriting, setIsFavoriting] = useState(false);

    // Format numbers
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years !== 1 ? 's' : ''} ago`;
        }
    };

    // Toggle like
    const handleToggleLike = async () => {
        if (!session?.user) {
            alert('Please log in to like this resource');
            return;
        }

        if (!resource || isLiking) return;

        const previousLiked = isLiked;
        const previousCount = likeCount;

        // Optimistic update
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        setIsLiking(true);

        try {
            if (isLiked) {
                await unlikeResource(resource.id);
            } else {
                await likeResource(resource.id);
            }
            // Success - keep the optimistic update
        } catch (err) {
            console.error('Failed to toggle like:', err);
            // Rollback on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    };

    // Toggle favorite
    const handleToggleFavorite = async () => {
        if (!session?.user) {
            alert('Please log in to favorite this resource');
            return;
        }

        if (!resource || isFavoriting) return;

        const previousFavorited = isFavorited;
        setIsFavorited(!isFavorited);
        setIsFavoriting(true);

        try {
            if (isFavorited) {
                await unfavoriteResource(resource.id);
            } else {
                await favoriteResource(resource.id);
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            setIsFavorited(previousFavorited);
        } finally {
            setIsFavoriting(false);
        }
    };

    // Loading state
    if (isLoading || !resource) {
        return (
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
                <div className="flex justify-center items-center py-20">
                    <div className="text-white/60">Loading resource...</div>
                </div>
            </div>
        );
    }

    const typeConfig = getResourceTypeBySingular(type!);
    const author = resource.team?.name || resource.owner.username;
    const authorDisplay = resource.team?.displayName || resource.owner.displayName;

    const tags = resource.tags && resource.tags.length > 0
        ? resource.tags.map(t => t.tag.name).slice(0, 5)
        : resource.categories
            ? resource.categories.map((c: any) => c.category.name).slice(0, 5)
            : [];

    console.log('Resource tags:', resource.tags);
    console.log('Resource categories:', resource.categories);
    console.log('Mapped tags:', tags);

    // Map external links with appropriate icons based on type
    const getExternalLinkIcon = (type: string) => {
        switch (type) {
            case 'SOURCE_CODE':
                return <Icon icon="mdi:github" width="20" height="20" />;
            case 'ISSUE_TRACKER':
                return <Icon icon="mdi:bug" width="20" height="20" />;
            case 'WIKI':
                return <Icon icon="mdi:book-open-page-variant" width="20" height="20" />;
            case 'DISCORD':
                return <Icon icon="ic:baseline-discord" width="20" height="20" />;
            case 'DONATION':
                return <Icon icon="mdi:heart" width="20" height="20" />;
            case 'WEBSITE':
                return <Icon icon="mdi:web" width="20" height="20" />;
            case 'OTHER':
            default:
                return <Icon icon="mdi:link" width="20" height="20" />;
        }
    };

    const externalLinks = (resource as any).externalLinks || [];
    const links = externalLinks.map((link: any) => ({
        label: link.label || link.type,
        url: link.url,
        icon: getExternalLinkIcon(link.type)
    }));

    // Map creators
    const creators = [
        {
            username: resource.owner.username,
            avatar: resource.owner.image || '',
            role: 'Owner' as const
        }
    ];

    // Compatibility info
    const compatibility = {
        platform: 'Hytale',
        versions: resource.latestVersion ? [resource.latestVersion.versionNumber] : []
    };

    // License info
    const licenseType = (resource as any).licenseType;
    const customLicenseName = (resource as any).customLicenseName;
    const license = licenseType === 'CUSTOM'
        ? customLicenseName || 'Custom License'
        : licenseType || 'All Rights Reserved';

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-6 sm:py-8">
            {/* Header */}
            <ResourceHeader
                title={resource.name}
                description={resource.tagline || resource.description || ''}
                image={resource.iconUrl || ''}
                bannerImage={resource.bannerUrl}
                downloads={formatNumber(resource.downloadCount)}
                likes={likeCount}
                tags={tags}
                type={type! as 'mod' | 'plugin' | 'world' | 'prefab' | 'asset-pack' | 'data-pack' | 'modpack' | 'tool'}
                slug={resource.slug}
                author={author}
                updatedAt={formatDate(resource.updatedAt)}
                isOwner={isOwner}
                isLiked={isLiked}
                isFavorited={isFavorited}
                onToggleLike={handleToggleLike}
                onToggleFavorite={handleToggleFavorite}
                isLiking={isLiking}
                isFavoriting={isFavoriting}
                resourceId={resource.id}
            />

            {/* Main Content + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <ResourceTabs basePath={`/${type}/${resource.slug}`} />
                    {children}
                </div>

                {/* Sidebar */}
                <ResourceSidebar
                    compatibility={compatibility}
                    links={links}
                    creators={creators}
                    license={license}
                    publishedAt={formatDate(resource.publishedAt || resource.createdAt)}
                    updatedAt={formatDate(resource.updatedAt)}
                />
            </div>
        </div>
    );
}
