import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateResourceMetadata(
    slug: string,
    resourceType: string,
    resourceTypeName: string
): Promise<Metadata> {
    try {
        const response = await fetch(`${API_URL}/resources/slug/${slug}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: `${resourceTypeName} Not Found`,
                description: `The requested ${resourceTypeName.toLowerCase()} could not be found on Orbis.`,
            };
        }

        const data = await response.json();
        const resource = data.resource;
        const description = resource.tagline || resource.description || `Download ${resource.name}, a ${resourceTypeName.toLowerCase()} for Hytale.`;

        // Format stats for rich preview
        const downloadCount = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(resource.downloadCount || 0);
        const likeCount = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(resource.likeCount || 0);
        const stats = `Downloads: ${downloadCount} • Likes: ${likeCount}`;

        const fullDescription = `${description}\n\n${stats}`;

        return {
            title: resource.name,
            description: fullDescription,
            keywords: [
                'Hytale',
                resourceTypeName,
                resource.name,
                'download',
                'Hytale mods',
                ...(resource.tags || [])
            ],
            openGraph: {
                title: `${resource.name} - ${resourceTypeName}`,
                description: description,
                type: 'website',
                url: `/${resourceType}/${slug}`,
                siteName: 'Orbis',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${resource.name} - ${resourceTypeName}`,
                description: fullDescription,
            },
        };
    } catch (error) {
        return {
            title: slug,
            description: `Download ${slug}, a ${resourceTypeName.toLowerCase()} for Hytale on Orbis marketplace.`,
        };
    }
}

export async function generateTeamMetadata(teamName: string): Promise<Metadata> {
    try {
        const response = await fetch(`${API_URL}/teams/${teamName}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Team Not Found',
                description: 'The requested team could not be found on Orbis.',
            };
        }

        const team = await response.json();
        const description = team.description || `Check out ${team.name}'s profile on Orbis.`;

        const memberCount = team._count?.members || team.members?.length || 0;
        const resourceCount = team._count?.resources || 0;
        const stats = `${memberCount} Members • ${resourceCount} Resources`;

        return {
            title: team.name,
            description: `${description}\n\n${stats}`,
            openGraph: {
                title: `${team.name} - Orbis Team`,
                description: description,
                type: 'profile',
                url: `/team/${teamName}`,
                siteName: 'Orbis',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${team.name} - Orbis Team`,
                description: `${description}\n\n${stats}`,
            },
        };
    } catch (error) {
        return {
            title: teamName,
            description: `Check out ${teamName}'s profile on Orbis.`,
        };
    }
}

export async function generateUserMetadata(username: string): Promise<Metadata> {
    try {
        const response = await fetch(`${API_URL}/users/username/${username}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'User Not Found',
                description: 'The requested user could not be found on Orbis.',
            };
        }

        const user = await response.json();
        const displayName = user.displayName || user.username;
        const description = user.bio || `Check out ${displayName}'s profile on Orbis.`;

        const followerCount = user._count?.followers || 0;
        const resourceCount = user._count?.ownedResources || 0;
        const stats = `${followerCount} Followers • ${resourceCount} Resources`;

        return {
            title: displayName,
            description: `${description}\n\n${stats}`,
            openGraph: {
                title: `${displayName} (@${user.username}) - Orbis User`,
                description: description,
                type: 'profile',
                url: `/user/${username}`,
                siteName: 'Orbis',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${displayName} (@${user.username}) - Orbis User`,
                description: `${description}\n\n${stats}`,
            },
        };
    } catch (error) {
        return {
            title: username,
            description: `Check out ${username}'s profile on Orbis.`,
        };
    }
}

const SHOWCASE_CATEGORY_LABELS: Record<string, string> = {
    'THREE_D_MODEL': '3D Model',
    'SCREENSHOT': 'Screenshot',
    'VIDEO': 'Video',
    'ARTWORK': 'Artwork',
    'ANIMATION': 'Animation',
    'CONCEPT_ART': 'Concept Art',
    'FAN_ART': 'Fan Art',
    'TUTORIAL': 'Tutorial',
    'DEVLOG': 'Dev Log',
    'OTHER': 'Other',
};

export async function generateShowcaseMetadata(postId: string): Promise<Metadata> {
    try {
        const response = await fetch(`${API_URL}/showcase/${postId}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Showcase Not Found',
                description: 'The requested showcase post could not be found on Orbis.',
            };
        }

        const post = await response.json();
        const categoryLabel = SHOWCASE_CATEGORY_LABELS[post.category] || post.category;
        const ownerName = post.ownerTeam?.name || post.author?.displayName || post.author?.username || 'Unknown';

        // Strip HTML from description
        const cleanDescription = post.description?.replace(/<[^>]*>/g, '') || '';
        const description = cleanDescription.slice(0, 160) || `${post.title} - A ${categoryLabel.toLowerCase()} by ${ownerName} on Orbis.`;

        // Format stats
        const viewCount = new Intl.NumberFormat('en-US', { notation: "compact" }).format(post.viewCount || 0);
        const likeCount = new Intl.NumberFormat('en-US', { notation: "compact" }).format(post._count?.likes || 0);
        const stats = `Views: ${viewCount} • Likes: ${likeCount}`;

        return {
            title: post.title,
            description: `${description}\n\n${stats}`,
            keywords: [
                'Hytale',
                'Showcase',
                categoryLabel,
                post.title,
                ownerName,
            ],
            openGraph: {
                title: `${post.title} - ${categoryLabel}`,
                description: description,
                type: 'article',
                url: `/showcase/${postId}`,
                siteName: 'Orbis',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${post.title} - ${categoryLabel}`,
                description: `${description}\n\n${stats}`,
            },
        };
    } catch (error) {
        return {
            title: 'Showcase',
            description: 'View this showcase post on Orbis.',
        };
    }
}
