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
    TOOLS_SCRIPTS = 'TOOLS_SCRIPTS',
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
    tags?: string[];
    categories?: string[];
    versions?: string[];
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
    slug: string;
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
        'tools-scripts': ResourceType.TOOLS_SCRIPTS,
        'tool': ResourceType.TOOLS_SCRIPTS,
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
    if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.categories && params.categories.length > 0) {
        params.categories.forEach(category => queryParams.append('categories', category));
    }
    if (params.versions && params.versions.length > 0) {
        params.versions.forEach(version => queryParams.append('versions', version));
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

export interface HytaleVersion {
    id: string;
    hytaleVersion: string;
    name: string;
    releaseDate: string;
    createdAt: string;
}

/**
 * Fetch all available Hytale versions
 */
export async function fetchHytaleVersions(): Promise<string[]> {
    const url = `${API_URL}/hytale-versions`;

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

    const versions: HytaleVersion[] = await response.json();
    // Return only the version strings for compatibility with VersionFilter
    return versions.map(v => v.hytaleVersion);
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

/**
 * External Links API
 */

export interface ExternalLink {
    id: string;
    type: string;
    url: string;
    label?: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExternalLinkData {
    type: string;
    url: string;
    label?: string;
}

export interface UpdateExternalLinkData {
    url?: string;
    label?: string;
}

/**
 * Get all external links for a resource
 */
export async function fetchExternalLinks(resourceId: string): Promise<ExternalLink[]> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/external-links`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch external links',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Create a new external link
 */
export async function createExternalLink(
    resourceId: string,
    data: CreateExternalLinkData
): Promise<{ message: string; link: ExternalLink }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/external-links`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to create external link',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Update an external link
 */
export async function updateExternalLink(
    resourceId: string,
    linkId: string,
    data: UpdateExternalLinkData
): Promise<{ message: string; link: ExternalLink }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/external-links/${linkId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to update external link',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Delete an external link
 */
export async function deleteExternalLink(
    resourceId: string,
    linkId: string
): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/external-links/${linkId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to delete external link',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Reorder external links
 */
export async function reorderExternalLinks(
    resourceId: string,
    linkIds: string[]
): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/external-links/reorder`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkIds }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to reorder external links',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ============================================
// DISCOVERY COLLECTIONS API
// ============================================

export interface DiscoveryCollectionResponse {
    collection: {
        id: string;
        type: string;
        title: string;
        description?: string;
        metadata?: any;
    };
    resources: Resource[];
}

/**
 * Fetch Selection of the Week
 */
export async function fetchSelectionOfWeek(): Promise<Resource | null> {
    try {
        const response = await fetch(`${API_URL}/discovery/resources/selection-of-week`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return null;

        const data: DiscoveryCollectionResponse = await response.json();
        return data.resources[0] || null;
    } catch (error) {
        console.error('Failed to fetch selection of the week:', error);
        return null;
    }
}

/**
 * Fetch Hidden Gems collection
 */
export async function fetchHiddenGems(): Promise<Resource[]> {
    try {
        const response = await fetch(`${API_URL}/discovery/resources/hidden-gems`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return [];

        const data: DiscoveryCollectionResponse = await response.json();
        return data.resources;
    } catch (error) {
        console.error('Failed to fetch hidden gems:', error);
        return [];
    }
}

/**
 * Fetch Starter Pack collection
 */
export async function fetchStarterPack(): Promise<Resource[]> {
    try {
        const response = await fetch(`${API_URL}/discovery/resources/starter-pack`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return [];

        const data: DiscoveryCollectionResponse = await response.json();
        return data.resources;
    } catch (error) {
        console.error('Failed to fetch starter pack:', error);
        return [];
    }
}

/**
 * Fetch Theme of the Month collection
 */
export async function fetchThemeOfMonth(): Promise<DiscoveryCollectionResponse | null> {
    try {
        const response = await fetch(`${API_URL}/discovery/resources/theme-of-month`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return null;

        return response.json();
    } catch (error) {
        console.error('Failed to fetch theme of the month:', error);
        return null;
    }
}

/**
 * Fetch Most Downloaded resources
 */
export async function fetchMostDownloaded(limit = 4): Promise<Resource[]> {
    try {
        const response = await fetch(`${API_URL}/discovery/resources/most-downloaded?limit=${limit}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return [];

        const data: { resources: Resource[] } = await response.json();
        return data.resources;
    } catch (error) {
        console.error('Failed to fetch most downloaded:', error);
        return [];
    }
}

// ============================================================================
// Collection API
// ============================================================================

export interface UserCollection {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isPublic: boolean;
    itemCount: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CollectionWithItems {
    collection: UserCollection & { isPublic: boolean };
    items: Array<{
        addedAt: string;
        resource: Resource;
    }>;
    count: number;
}

/**
 * Quick save resource to default collection
 */
export async function saveResourceToDefault(resourceId: string): Promise<{ message: string; added: boolean; collectionId: string }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to save resource',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get collections containing a specific resource (for current user)
 */
export async function getResourceCollections(resourceId: string): Promise<{ collections: UserCollection[]; count: number }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/collections`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch resource collections',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get all user collections
 */
export async function getUserCollections(): Promise<{ collections: UserCollection[]; count: number }> {
    const response = await fetch(`${API_URL}/users/me/collections`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch collections',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Search collections by name
 */
export async function searchCollections(query: string): Promise<{ collections: UserCollection[]; count: number }> {
    const response = await fetch(`${API_URL}/users/me/collections/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to search collections',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Create a new collection
 */
export async function createCollection(name: string, description?: string): Promise<UserCollection> {
    const response = await fetch(`${API_URL}/users/me/collections`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to create collection',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Add resource to a specific collection
 */
export async function addResourceToCollection(collectionId: string, resourceId: string): Promise<{ message: string; added: boolean }> {
    const response = await fetch(`${API_URL}/users/me/collections/${collectionId}/resources/${resourceId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to add resource to collection',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Remove resource from a collection
 */
export async function removeResourceFromCollection(collectionId: string, resourceId: string): Promise<{ message: string; removed: boolean }> {
    const response = await fetch(`${API_URL}/users/me/collections/${collectionId}/resources/${resourceId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to remove resource from collection',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Update a collection
 */
export async function updateCollection(collectionId: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<UserCollection> {
    const response = await fetch(`${API_URL}/users/me/collections/${collectionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to update collection',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/users/me/collections/${collectionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to delete collection',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get collection with items
 */
export async function getCollectionWithItems(collectionId: string): Promise<CollectionWithItems & { count: number }> {
    const response = await fetch(`${API_URL}/users/me/collections/${collectionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch collection',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get user's favorite resources
 */
export async function getUserFavorites(): Promise<{ favorites: Array<{ resource: Resource; createdAt: string }>; count: number }> {
    const response = await fetch(`${API_URL}/user/favorites`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch favorites',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get public collections for a user
 */
export async function getPublicCollections(userId: string): Promise<{ collections: UserCollection[]; count: number }> {
    const response = await fetch(`${API_URL}/users/${userId}/collections/public`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return { collections: [], count: 0 };
    }

    return response.json();
}

/**
 * Get a public collection with items
 */
export async function getPublicCollection(collectionId: string): Promise<CollectionWithItems> {
    const response = await fetch(`${API_URL}/collections/${collectionId}/public`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch collection');
    }

    return response.json();
}

