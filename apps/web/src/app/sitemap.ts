import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Map resource types to URL paths
const resourceTypeToPath: Record<string, string> = {
    'MOD': 'mod',
    'MODPACK': 'modpack',
    'WORLD': 'world',
    'PREFAB': 'prefab',
    'ASSET_PACK': 'asset-pack',
    'DATA_PACK': 'data-pack',
    'TOOLS_SCRIPTS': 'tool',
}

interface SitemapResource {
    slug: string
    type: string
    updatedAt: string
}

interface SitemapServer {
    slug: string
    updatedAt: string
}

interface SitemapUser {
    username: string
    updatedAt: string
}

interface SitemapShowcase {
    id: string
    updatedAt: string
}

async function fetchResources(): Promise<SitemapResource[]> {
    try {
        const response = await fetch(`${API_URL}/resources/sitemap`, {
            next: { revalidate: 3600 },
        })
        if (!response.ok) return []
        return response.json()
    } catch {
        return []
    }
}

async function fetchServers(): Promise<SitemapServer[]> {
    try {
        const response = await fetch(`${API_URL}/servers/sitemap`, {
            next: { revalidate: 3600 },
        })
        if (!response.ok) return []
        return response.json()
    } catch {
        return []
    }
}

async function fetchCreators(): Promise<SitemapUser[]> {
    try {
        const response = await fetch(`${API_URL}/users/sitemap`, {
            next: { revalidate: 3600 },
        })
        if (!response.ok) return []
        return response.json()
    } catch {
        return []
    }
}

async function fetchShowcase(): Promise<SitemapShowcase[]> {
    try {
        const response = await fetch(`${API_URL}/showcase/sitemap`, {
            next: { revalidate: 3600 },
        })
        if (!response.ok) return []
        return response.json()
    } catch {
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://orbis.place'
    const currentDate = new Date()

    // Fetch all dynamic data in parallel (limited to MAX_ITEMS each)
    const [resources, servers, creators, showcase] = await Promise.all([
        fetchResources(),
        fetchServers(),
        fetchCreators(),
        fetchShowcase(),
    ])

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/resources`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/servers`,
            lastModified: currentDate,
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/showcase`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/creators`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/guidelines`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ]

    // Resource type routes (marketplace categories)
    const resourceTypes = [
        'mods',
        'modpacks',
        'worlds',
        'asset-packs',
        'prefabs',
        'data-packs'
    ]

    const resourceTypeRoutes: MetadataRoute.Sitemap = resourceTypes.map((type) => ({
        url: `${baseUrl}/${type}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    // Individual resource pages (max 1000)
    const resourceRoutes: MetadataRoute.Sitemap = resources.map((resource) => {
        const typePath = resourceTypeToPath[resource.type] || resource.type.toLowerCase()
        return {
            url: `${baseUrl}/${typePath}/${resource.slug}`,
            lastModified: new Date(resource.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }
    })

    // Individual server pages (max 1000)
    const serverRoutes: MetadataRoute.Sitemap = servers.map((server) => ({
        url: `${baseUrl}/servers/${server.slug}`,
        lastModified: new Date(server.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }))

    // Creator profile pages (max 1000)
    const creatorRoutes: MetadataRoute.Sitemap = creators.map((creator) => ({
        url: `${baseUrl}/user/${creator.username}`,
        lastModified: new Date(creator.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // Individual showcase posts (max 1000)
    const showcaseRoutes: MetadataRoute.Sitemap = showcase.map((post) => ({
        url: `${baseUrl}/showcase/${post.id}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [
        ...staticRoutes,
        ...resourceTypeRoutes,
        ...resourceRoutes,
        ...serverRoutes,
        ...creatorRoutes,
        ...showcaseRoutes,
    ]
}

