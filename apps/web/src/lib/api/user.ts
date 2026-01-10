/**
 * API client for user-related endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Download history types
export interface DownloadHistoryItem {
    id: string;
    downloadedAt: string;
    resource: {
        id: string;
        name: string;
        slug: string;
        type: string;
        iconUrl?: string;
        ownerUser: {
            id: string;
            username: string;
            displayName: string;
            image?: string;
        } | null;
        ownerTeam: {
            id: string;
            name: string;
            logo?: string;
        } | null;
    };
    version: {
        id: string;
        versionNumber: string;
        channel: string;
    } | null;
}

export interface DownloadHistoryResponse {
    downloads: DownloadHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Get download history for the current user
 */
export async function getUserDownloadHistory(
    page: number = 1,
    limit: number = 20
): Promise<DownloadHistoryResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/users/me/downloads?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch download history',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}
