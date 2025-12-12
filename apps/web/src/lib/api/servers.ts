/**
 * API client for servers
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Server sort options enum matching backend
export enum ServerSortOption {
    VOTES = 'votes',
    PLAYERS = 'players',
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASC = 'name-asc',
    NAME_DESC = 'name-desc',
}

// API request parameters
export interface FetchServersParams {
    search?: string;
    category?: string;
    tags?: string[];
    gameVersion?: string;
    online?: boolean;
    featured?: boolean;
    verified?: boolean;
    minPlayers?: number;
    maxPlayers?: number;
    sortBy?: ServerSortOption;
    page?: number;
    limit?: number;
}

// API response types
export interface ServerCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

export interface ServerTag {
    id: string;
    name: string;
    slug: string;
}

export interface ServerOwner {
    id: string;
    username: string;
    displayName: string;
    image?: string;
}

export interface Server {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    serverIp?: string;
    serverPort?: number;
    onlineStatus: boolean;
    currentPlayers: number;
    maxPlayers: number;
    voteCount: number;
    verified: boolean;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    owner: ServerOwner;
    tags: Array<{
        tag: ServerTag;
    }>;
    categories: Array<{
        category: ServerCategory;
    }>;
}

export interface PaginatedServersResponse {
    data: Server[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

/**
 * Fetch servers from the API
 */
export async function fetchServers(
    params: FetchServersParams = {}
): Promise<PaginatedServersResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) {
        queryParams.append('search', params.search);
    }
    if (params.category) {
        queryParams.append('category', params.category);
    }
    if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.gameVersion) {
        queryParams.append('gameVersion', params.gameVersion);
    }
    if (params.online !== undefined) {
        queryParams.append('online', params.online.toString());
    }
    if (params.featured !== undefined) {
        queryParams.append('featured', params.featured.toString());
    }
    if (params.verified !== undefined) {
        queryParams.append('verified', params.verified.toString());
    }
    if (params.minPlayers !== undefined) {
        queryParams.append('minPlayers', params.minPlayers.toString());
    }
    if (params.maxPlayers !== undefined) {
        queryParams.append('maxPlayers', params.maxPlayers.toString());
    }
    if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
    }
    if (params.page) {
        queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
        queryParams.append('limit', params.limit.toString());
    }

    const url = `${API_URL}/servers?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch servers',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch a single server by slug
 */
export async function fetchServerBySlug(slug: string): Promise<{ server: Server }> {
    const response = await fetch(`${API_URL}/servers/${slug}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch server',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch server categories
 */
export async function fetchServerCategories(): Promise<ServerCategory[]> {
    const response = await fetch(`${API_URL}/servers/categories`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch server categories',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch server tags
 */
export async function fetchServerTags(search?: string, limit?: number): Promise<ServerTag[]> {
    const queryParams = new URLSearchParams();

    if (search) {
        queryParams.append('search', search);
    }
    if (limit) {
        queryParams.append('limit', limit.toString());
    }

    const url = `${API_URL}/servers/tags?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch server tags',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Creation API
 */

export interface CreateServerData {
    name: string;
    description: string;
    shortDesc?: string;
    serverIp: string;
    port?: number;
    gameVersion: string;
    supportedVersions?: string[];
    websiteUrl?: string;
    discordUrl?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
    primaryCategoryId: string;
    categoryIds?: string[];
    tagIds: string[];
    teamId?: string;
}

/**
 * Create a new server
 */
export async function createServer(data: CreateServerData): Promise<Server> {
    const response = await fetch(`${API_URL}/servers`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to create server',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}
