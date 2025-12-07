/**
 * API client for resources
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Resource types enum matching backend
export enum ResourceType {
    PLUGIN = 'PLUGIN',
    ASSET_PACK = 'ASSET_PACK',
    MOD = 'MOD',
    MODPACK = 'MODPACK',
    PREMADE_SERVER = 'PREMADE_SERVER',
    WORLD = 'WORLD',
    PREFAB = 'PREFAB',
    DATA_PACK = 'DATA_PACK',
}

// Sort options enum
export enum ResourceSortOption {
    DOWNLOADS = 'downloads',
    LIKES = 'likes',
    DATE = 'date',
    UPDATED = 'updated',
    NAME = 'name',
}

// API request parameters
export interface FetchResourcesParams {
    type?: ResourceType;
    search?: string;
    sortBy?: ResourceSortOption;
    page?: number;
    limit?: number;
}

// API response types
export interface ResourceTag {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface ResourceOwner {
    id: string;
    username: string;
    displayName: string;
    image?: string;
}

export interface ResourceTeam {
    id: string;
    name: string;
    displayName: string;
    logo?: string;
}

export interface ResourceVersion {
    id: string;
    versionNumber: string;
    name?: string;
    channel: string;
    createdAt: string;
    publishedAt?: string;
}

export interface Resource {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description?: string;
    type: ResourceType;
    iconUrl?: string;
    bannerUrl?: string;
    downloadCount: number;
    likeCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    owner: ResourceOwner;
    team?: ResourceTeam;
    latestVersion?: ResourceVersion;
    tags: Array<{
        tag: ResourceTag;
    }>;
    _count: {
        versions: number;
        downloads: number;
    };
}

export interface PaginatedResourcesResponse {
    data: Resource[];
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
 * Map frontend resource type to backend enum
 */
export function mapTypeToBackendEnum(type: string): ResourceType | undefined {
    const typeMapping: Record<string, ResourceType> = {
        'plugins': ResourceType.PLUGIN,
        'plugin': ResourceType.PLUGIN,
        'mods': ResourceType.MOD,
        'mod': ResourceType.MOD,
        'worlds': ResourceType.WORLD,
        'world': ResourceType.WORLD,
        'prefabs': ResourceType.PREFAB,
        'prefab': ResourceType.PREFAB,
        'asset-packs': ResourceType.ASSET_PACK,
        'asset-pack': ResourceType.ASSET_PACK,
        'data-packs': ResourceType.DATA_PACK,
        'data-pack': ResourceType.DATA_PACK,
        'modpacks': ResourceType.MODPACK,
        'modpack': ResourceType.MODPACK,
    };

    return typeMapping[type.toLowerCase()];
}

/**
 * Fetch resources from the API
 */
export async function fetchResources(
    params: FetchResourcesParams = {}
): Promise<PaginatedResourcesResponse> {
    const queryParams = new URLSearchParams();

    if (params.type) {
        queryParams.append('type', params.type);
    }
    if (params.search) {
        queryParams.append('search', params.search);
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

    const url = `${API_URL}/resources?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch resources',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch a single resource by ID
 */
export async function fetchResourceById(id: string): Promise<{ resource: Resource }> {
    const response = await fetch(`${API_URL}/resources/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch a single resource by slug
 */
export async function fetchResourceBySlug(slug: string): Promise<{ resource: Resource }> {
    const response = await fetch(`${API_URL}/resources/slug/${slug}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Like a resource
 */
export async function likeResource(resourceId: string): Promise<{ message: string; likeCount: number }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/likes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to like resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Unlike a resource
 */
export async function unlikeResource(resourceId: string): Promise<{ message: string; likeCount: number }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/likes`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to unlike resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Check if user has liked a resource
 */
export async function hasLikedResource(resourceId: string): Promise<{ hasLiked: boolean }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/likes/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to check like status',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Add resource to favorites
 */
export async function favoriteResource(resourceId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to favorite resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Remove resource from favorites
 */
export async function unfavoriteResource(resourceId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/favorites`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to unfavorite resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Check if user has favorited a resource
 */
export async function hasFavoritedResource(resourceId: string): Promise<{ hasFavorited: boolean }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/favorites/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to check favorite status',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Tags API
 */

export interface Tag {
    id: string;
    name: string;
    slug: string;
    color?: string;
    usageCount?: number;
    usageCountForType?: number;
    _count?: {
        resourceTags: number;
    };
}

/**
 * Fetch all tags with optional search and limit
 */
export async function fetchTags(search?: string, limit?: number): Promise<Tag[]> {
    const queryParams = new URLSearchParams();

    if (search) {
        queryParams.append('search', search);
    }
    if (limit) {
        queryParams.append('limit', limit.toString());
    }

    const url = `${API_URL}/resource-tags?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch tags',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Search tags for autocomplete
 */
export async function searchTags(query: string, limit?: number): Promise<Tag[]> {
    const queryParams = new URLSearchParams();

    if (query) {
        queryParams.append('q', query);
    }
    if (limit) {
        queryParams.append('limit', limit.toString());
    }

    const url = `${API_URL}/resource-tags/search?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to search tags',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get popular tags for a specific resource type
 */
export async function getPopularTagsForType(type: ResourceType, limit?: number): Promise<Tag[]> {
    const queryParams = new URLSearchParams();

    if (limit) {
        queryParams.append('limit', limit.toString());
    }

    const url = `${API_URL}/resource-tags/popular/${type}?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch popular tags',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Categories API
 */

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    usageCount?: number;
    usageCountForType?: number;
}

/**
 * Fetch categories filtered by resource type
 */
export async function fetchCategories(type?: ResourceType): Promise<Category[]> {
    const queryParams = new URLSearchParams();

    if (type) {
        queryParams.append('type', type);
    }

    const url = `${API_URL}/resources/categories?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch categories',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Hytale Versions API
 */

/**
 * Fetch all available Hytale versions
 */
export async function fetchHytaleVersions(): Promise<string[]> {
    const url = `${API_URL}/resources/hytale-versions`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch Hytale versions',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}
