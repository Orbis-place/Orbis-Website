import type { Resource } from '@/lib/api/resources';
import type { MarketplaceItem } from '@/components/marketplace/MarketplaceCard';

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Format a date to absolute format (e.g., "Dec 17, 2025")
 */
function formatAbsoluteDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format count numbers to human-readable format (e.g., "1.2k", "3.5M")
 */
function formatCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}

/**
 * Convert API Resource type to UI MarketplaceItem type
 */
export function convertResourceToMarketplaceItem(resource: Resource): MarketplaceItem {
    return {
        id: resource.id,
        slug: resource.slug,
        title: resource.name,
        author: resource.ownerUser?.username || resource.ownerTeam?.slug || 'Unknown',
        authorDisplay: resource.ownerUser?.displayName || resource.ownerTeam?.name || 'Unknown',
        description: resource.tagline,
        image: resource.iconUrl || '',
        banner: resource.bannerUrl,
        rating: 0, // Not yet implemented in backend
        likes: formatCount(resource.likeCount),
        downloads: formatCount(resource.downloadCount),
        date: formatAbsoluteDate(resource.createdAt),
        updatedAt: `Updated ${formatRelativeTime(resource.updatedAt)}`,
        tags: resource.tags?.map(t => t.tag.name) || [],
        categories: resource.categories?.map(c => c.category.name) || [],
        type: resource.type.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ')
    };
}
