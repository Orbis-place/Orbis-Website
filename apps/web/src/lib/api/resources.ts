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
export interface ResourceCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

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
    ownerUser: ResourceOwner | null;
    ownerTeam?: ResourceTeam | null;
    latestVersion?: ResourceVersion;
    tags: Array<{
        tag: ResourceTag;
    }>;
    categories: Array<{
        category: ResourceCategory;
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
export async function likeResource(resourceId: string): Promise<{ message: string; liked: boolean }> {
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
export async function unlikeResource(resourceId: string): Promise<{ message: string; liked: boolean }> {
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
export async function hasLikedResource(resourceId: string): Promise<{ liked: boolean }> {
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
export async function hasFavoritedResource(resourceId: string): Promise<{ favorited: boolean }> {
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

/**
 * Team API
 */

export interface Team {
    id: string;
    name: string;
    slug: string;
    logo?: string;
}

/**
 * Fetch user's teams (where user is owner or admin)
 */
export async function fetchUserTeams(): Promise<Team[]> {
    const response = await fetch(`${API_URL}/teams/user/my-teams`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch teams',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    const teams = await response.json();
    // Filter to only teams where user is owner or admin
    return teams.filter((team: any) =>
        team.memberRole === 'OWNER' || team.memberRole === 'ADMIN'
    );
}

/**
 * Creation API
 */

export interface CreateResourceData {
    name: string;
    slug: string;
    tagline: string;
    type: ResourceType;
    teamId?: string;
}

/**
 * Create a new resource
 */
export async function createResource(data: CreateResourceData): Promise<{ message: string; resource: Resource }> {
    const response = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to create resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Gallery Images API
 */

export interface GalleryImage {
    id: string;
    resourceId: string;
    url: string;
    storageKey: string;
    caption?: string;
    title?: string;
    description?: string;
    order: number;
    size: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGalleryImageData {
    caption?: string;
    title?: string;
    description?: string;
    order?: number;
}

export interface UpdateGalleryImageData {
    caption?: string;
    title?: string;
    description?: string;
    order?: number;
}

/**
 * Fetch all gallery images for a resource
 */
export async function fetchGalleryImages(resourceId: string): Promise<{ galleryImages: GalleryImage[]; total: number }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/gallery-images`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch gallery images',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Create a new gallery image with file upload
 */
export async function createGalleryImage(
    resourceId: string,
    file: File,
    data?: CreateGalleryImageData
): Promise<{ message: string; galleryImage: GalleryImage }> {
    const formData = new FormData();
    formData.append('image', file);

    // Add optional metadata
    if (data?.caption) formData.append('caption', data.caption);
    if (data?.title) formData.append('title', data.title);
    if (data?.description) formData.append('description', data.description);
    if (data?.order !== undefined) formData.append('order', data.order.toString());

    const response = await fetch(`${API_URL}/resources/${resourceId}/gallery-images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to create gallery image',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Update a gallery image
 */
export async function updateGalleryImage(
    resourceId: string,
    imageId: string,
    data: UpdateGalleryImageData
): Promise<{ message: string; galleryImage: GalleryImage }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/gallery-images/${imageId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to update gallery image',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Delete a gallery image
 */
export async function deleteGalleryImage(
    resourceId: string,
    imageId: string
): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/gallery-images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to delete gallery image',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Reorder gallery images
 */
export async function reorderGalleryImages(
    resourceId: string,
    imageIds: string[]
): Promise<{ message: string; galleryImages: GalleryImage[] }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/gallery-images/reorder`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to reorder gallery images',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Replace the image file of an existing gallery image
 */
export async function replaceGalleryImage(
    resourceId: string,
    imageId: string,
    file: File
): Promise<{ message: string; galleryImage: GalleryImage }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/resources/${resourceId}/gallery-images/${imageId}/replace`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to replace gallery image',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}
