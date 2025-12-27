const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface ShowcasePost {
    id: string;
    title: string;
    description: string | null;
    category: ShowcaseCategory;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    thumbnailUrl: string | null;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
    media?: ShowcaseMedia[];
    linkedResource?: {
        id: string;
        name: string;
        slug: string;
        iconUrl: string | null;
        type: string;
    } | null;
    hasLiked?: boolean;
    _count?: {
        likes: number;
        comments: number;
    };
}

export interface ShowcaseMedia {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    order: number;
    caption: string | null;
}

export interface ShowcaseComment {
    id: string;
    content: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
    replies?: ShowcaseComment[];
}

export type ShowcaseCategory =
    | 'THREE_D_MODEL'
    | 'TEXTURE'
    | 'MAP'
    | 'PLUGIN'
    | 'CONCEPT_ART'
    | 'ANIMATION'
    | 'MUSIC_SOUND'
    | 'OTHER';

export interface ShowcaseCategoryInfo {
    category: ShowcaseCategory;
    count: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface FilterShowcasePostsDto {
    category?: ShowcaseCategory;
    authorId?: string;
    authorUsername?: string;
    featured?: boolean;
    search?: string;
    sortBy?: 'createdAt' | 'likeCount' | 'viewCount';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// Category display info - using soft pastel colors
export const SHOWCASE_CATEGORIES: Record<ShowcaseCategory, { label: string; icon: string; color: string }> = {
    THREE_D_MODEL: { label: '3D Models', icon: 'mdi:cube-outline', color: '#7EC8D3' },
    TEXTURE: { label: 'Textures', icon: 'mdi:texture', color: '#A8D5BA' },
    MAP: { label: 'Maps', icon: 'mdi:map-outline', color: '#B5D3E7' },
    PLUGIN: { label: 'Plugins', icon: 'mdi:puzzle-outline', color: '#9ED9CC' },
    CONCEPT_ART: { label: 'Concept Art', icon: 'mdi:palette-outline', color: '#C5B8D9' },
    ANIMATION: { label: 'Animations', icon: 'mdi:animation-play-outline', color: '#A9C8E8' },
    MUSIC_SOUND: { label: 'Music & Sound', icon: 'mdi:music-note-outline', color: '#D4E0A8' },
    OTHER: { label: 'Other', icon: 'mdi:dots-horizontal-circle-outline', color: '#B8C5CC' },
};

// API Functions

/**
 * Fetch showcase posts with filters
 */
export async function fetchShowcasePosts(
    filters: FilterShowcasePostsDto = {}
): Promise<PaginatedResponse<ShowcasePost>> {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.authorUsername) params.append('authorUsername', filters.authorUsername);
    if (filters.featured) params.append('featured', 'true');
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_URL}/showcase?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch showcase posts');
    }
    return response.json();
}

/**
 * Fetch featured showcase posts
 */
export async function fetchFeaturedShowcase(limit = 10): Promise<ShowcasePost[]> {
    const response = await fetch(`${API_URL}/showcase/featured?limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch featured showcase');
    }
    return response.json();
}

/**
 * Fetch showcase categories with counts
 */
export async function fetchShowcaseCategories(): Promise<ShowcaseCategoryInfo[]> {
    const response = await fetch(`${API_URL}/showcase/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch showcase categories');
    }
    return response.json();
}

/**
 * Fetch a single showcase post by ID
 */
export async function fetchShowcasePost(id: string): Promise<ShowcasePost> {
    const response = await fetch(`${API_URL}/showcase/${id}`, {
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to fetch showcase post');
    }
    return response.json();
}

/**
 * Fetch comments for a showcase post
 */
export async function fetchShowcaseComments(
    postId: string,
    page = 1,
    limit = 20
): Promise<PaginatedResponse<ShowcaseComment>> {
    const response = await fetch(
        `${API_URL}/showcase/${postId}/comments?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch comments');
    }
    return response.json();
}

/**
 * Like a showcase post (requires auth)
 */
export async function likeShowcasePost(postId: string): Promise<{ message: string; liked: boolean }> {
    const response = await fetch(`${API_URL}/showcase/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to like post');
    }
    return response.json();
}

/**
 * Unlike a showcase post (requires auth)
 */
export async function unlikeShowcasePost(postId: string): Promise<{ message: string; liked: boolean }> {
    const response = await fetch(`${API_URL}/showcase/${postId}/like`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to unlike post');
    }
    return response.json();
}

/**
 * Create a comment on a showcase post (requires auth)
 */
export async function createShowcaseComment(
    postId: string,
    content: string,
    parentId?: string
): Promise<ShowcaseComment> {
    const response = await fetch(`${API_URL}/showcase/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, parentId }),
    });
    if (!response.ok) {
        throw new Error('Failed to create comment');
    }
    return response.json();
}
