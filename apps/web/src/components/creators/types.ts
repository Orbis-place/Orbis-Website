// Types for Creators page

export interface Resource {
    id: string;
    name: string;
    category: ResourceCategory;
    downloads: number;
    rating: number;
    image: string | null;
}

export interface Creator {
    id: string;
    username: string;
    displayName: string;
    image: string | null;
    bio: string;
    stats: {
        resources: number;
        downloads: number;
        followers: number;
    };
    specialties: string[];
    isFollowing?: boolean;
    topResources?: Resource[];
}

export const RESOURCE_CATEGORIES = [
    { id: 'mods', label: 'Mods' },
    { id: 'modpacks', label: 'Modpacks' },
    { id: 'worlds', label: 'Worlds' },
    { id: 'plugins', label: 'Plugins' },
    { id: 'asset-packs', label: 'Asset Packs' },
    { id: 'prefabs', label: 'Prefabs' },
    { id: 'data-packs', label: 'Data Packs' },

] as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[number]['id'];

export interface LeaderboardEntry {
    rank: number;
    previousRank: number;
    creator: Creator;
    weeklyDownloads: number;
    weeklyChange: number; // percentage change
}

// Helper function to format numbers
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}
