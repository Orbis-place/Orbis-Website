/**
 * API client for discovery endpoints
 */

import type { Resource } from './resources';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Discovery Collection Types
export type DiscoveryCollectionType =
    | 'SELECTION_OF_WEEK'
    | 'HIDDEN_GEMS'
    | 'STARTER_PACK'
    | 'THEME_OF_MONTH';

// API Response Types
export interface DiscoveryCollection {
    id: string;
    type: DiscoveryCollectionType;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
}

export interface DiscoveryCollectionResponse {
    collection: DiscoveryCollection;
    resources: Resource[];
}

/**
 * Fetch Selection of the Week
 */
export async function fetchSelectionOfWeek(): Promise<DiscoveryCollectionResponse> {
    const response = await fetch(`${API_URL}/discovery/resources/selection-of-week`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch Selection of the Week',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch Hidden Gems collection
 */
export async function fetchHiddenGems(): Promise<DiscoveryCollectionResponse> {
    const response = await fetch(`${API_URL}/discovery/resources/hidden-gems`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch Hidden Gems',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch Starter Pack collection
 */
export async function fetchStarterPack(): Promise<DiscoveryCollectionResponse> {
    const response = await fetch(`${API_URL}/discovery/resources/starter-pack`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch Starter Pack',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch Theme of the Month collection
 */
export async function fetchThemeOfMonth(): Promise<DiscoveryCollectionResponse> {
    const response = await fetch(`${API_URL}/discovery/resources/theme-of-month`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch Theme of the Month',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch most downloaded resources
 */
export async function fetchMostDownloaded(limit = 10): Promise<{ resources: Resource[] }> {
    const response = await fetch(`${API_URL}/discovery/resources/most-downloaded?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch most downloaded resources',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ============================================
// CREATOR DISCOVERY API
// ============================================

export interface CreatorStats {
    resources: number;
    downloads: number;
    followers: number;
}

export interface Creator {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    bio: string | null;
    stats: CreatorStats;
    specialties?: string[];
}

export interface LeaderboardEntry {
    rank: number;
    previousRank: number;
    creator: Creator;
    weeklyDownloads: number;
    weeklyChange: number;
}

export interface WeeklyLeaderboardResponse {
    leaderboard: LeaderboardEntry[];
}

export interface TopByCategoryResponse {
    topByCategory: Record<string, Creator>;
}

export interface ShuffleCreatorsResponse {
    creators: Creator[];
}

/**
 * Fetch weekly leaderboard of top creators
 */
export async function fetchWeeklyLeaderboard(limit = 10): Promise<WeeklyLeaderboardResponse> {
    const response = await fetch(`${API_URL}/discovery/creators/weekly-leaderboard?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch weekly leaderboard',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch top creator for each resource category
 */
export async function fetchTopCreatorsByCategory(): Promise<TopByCategoryResponse> {
    const response = await fetch(`${API_URL}/discovery/creators/top-by-category`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch top creators by category',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch random creators for shuffle discovery
 */
export async function fetchShuffleCreators(limit = 6): Promise<ShuffleCreatorsResponse> {
    const response = await fetch(`${API_URL}/discovery/creators/shuffle?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch shuffle creators',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

