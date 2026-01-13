"use client";

import { ReactNode, useState } from 'react';
import { useParams } from 'next/navigation';
import ResourceHeader from '@/components/marketplace/ResourceHeader';
import ResourceSidebar from '@/components/marketplace/ResourceSidebar';
import ResourceTabs from '@/components/marketplace/ResourceTabs';
import { Icon } from '@iconify/react';
import { getResourceTypeBySingular } from '@/config/resource-types';
import { useResource } from '@/contexts/ResourceContext';
import { likeResource, unlikeResource } from '@/lib/api/resources';
import { useSession } from '@repo/auth/client';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/utils/resourceConverters';

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

    // Handle login required

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
    const author = resource.ownerTeam?.name || resource.ownerUser?.username || 'Unknown';
    const authorDisplay = resource.ownerTeam?.displayName || resource.ownerUser?.displayName || author;

    const tags = resource.tags && resource.tags.length > 0
        ? resource.tags.map(t => t.tag.name)
        : [];

    const categories = resource.categories && resource.categories.length > 0
        ? resource.categories.map((c: any) => c.category.name)
        : [];

    console.log('Resource tags:', resource.tags);
    console.log('Resource categories:', resource.categories);

    // Map external links with appropriate icons based on type
    const getExternalLinkIcon = (type: string) => {
        switch (type) {
            case 'SOURCE_CODE':
                return <Icon ssr={true} icon="mdi:github" width="20" height="20" />;
            case 'ISSUE_TRACKER':
                return <Icon ssr={true} icon="mdi:bug" width="20" height="20" />;
            case 'WIKI':
                return <Icon ssr={true} icon="mdi:book-open-page-variant" width="20" height="20" />;
            case 'DISCORD':
                return <Icon ssr={true} icon="ic:baseline-discord" width="20" height="20" />;
            case 'DONATION':
                return <Icon ssr={true} icon="mdi:heart" width="20" height="20" />;
            case 'WEBSITE':
                return <Icon ssr={true} icon="mdi:web" width="20" height="20" />;
            case 'OTHER':
            default:
                return <Icon ssr={true} icon="mdi:link" width="20" height="20" />;
        }
    };

    const externalLinks = (resource as any).externalLinks || [];
    const links = externalLinks.map((link: any) => ({
        label: link.label || link.type,
        url: link.url,
        icon: getExternalLinkIcon(link.type)
    }));

    const donationLink = externalLinks.find((link: any) => link.type === 'DONATION')?.url;

    // Map creators
    const creators = resource.ownerTeam ? [
        {
            username: resource.ownerTeam.name,
            avatar: (resource.ownerTeam as any).logo || '',
            role: 'Owner' as const,
            isTeam: true
        }
    ] : resource.ownerUser ? [
        {
            username: resource.ownerUser.username,
            avatar: resource.ownerUser.image || '',
            role: 'Owner' as const,
            isTeam: false
        }
    ] : [];

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
                categories={categories}
                type={type! as 'mod' | 'plugin' | 'world' | 'prefab' | 'asset-pack' | 'data-pack' | 'modpack' | 'tool'}
                slug={resource.slug}
                author={author}
                team={resource.ownerTeam}
                owner={resource.ownerUser || undefined}
                updatedAt={resource.latestVersion?.publishedAt ? formatRelativeTime(resource.latestVersion.publishedAt) : formatRelativeTime(resource.updatedAt)}
                isOwner={isOwner}
                isLiked={isLiked}
                onToggleLike={handleToggleLike}
                isLiking={isLiking}
                resourceId={resource.id}
                isLoggedIn={!!session?.user}
                onLoginRequired={() => toast.error('Please log in to save resources')}
                donationLink={donationLink}
            />

            {/* Main Content + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <ResourceTabs basePath={`/${type}/${resource.slug}`} commentCount={(resource as any).commentCount || 0} />
                    {children}
                </div>

                {/* Sidebar */}
                <ResourceSidebar
                    compatibility={compatibility}
                    links={links}
                    creators={creators}
                    license={license}
                    publishedAt={formatRelativeTime(resource.publishedAt || resource.createdAt)}
                    updatedAt={resource.latestVersion?.publishedAt ? formatRelativeTime(resource.latestVersion.publishedAt) : formatRelativeTime(resource.updatedAt)}
                />
            </div>
        </div>
    );
}
