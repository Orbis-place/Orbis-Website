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

        const resource = await response.json();
        const description = resource.tagline || resource.description || `Download ${resource.name}, a ${resourceTypeName.toLowerCase()} for Hytale.`;
        const stats = `${resource.downloadCount || 0} downloads • ${resource.likeCount || 0} likes`;

        return {
            title: resource.name,
            description: `${description} ${stats}`,
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
                images: resource.iconUrl ? [
                    {
                        url: resource.iconUrl,
                        width: 512,
                        height: 512,
                        alt: `${resource.name} icon`,
                    }
                ] : [],
            },
            twitter: {
                card: 'summary',
                title: `${resource.name} - ${resourceTypeName}`,
                description: description,
                images: resource.iconUrl ? [resource.iconUrl] : [],
            },
        };
    } catch (error) {
        return {
            title: slug,
            description: `Download ${slug}, a ${resourceTypeName.toLowerCase()} for Hytale on Orbis marketplace.`,
        };
    }
}
