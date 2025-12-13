import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://orbis.place'
    const currentDate = new Date()

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
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
        'plugins',
        'asset-packs',
        'prefabs',
        'data-packs',
        'tools-scripts',
    ]

    const resourceTypeRoutes: MetadataRoute.Sitemap = resourceTypes.map((type) => ({
        url: `${baseUrl}/${type}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.8,
    }))

    // TODO: Add dynamic routes when connected to database
    // - Blog posts: /blog/[slug]
    // - Resources: /[type]/[slug]
    // - User profiles: /users/[username]
    // - Teams: /team/[teamName]

    // Example of how to add blog posts dynamically:
    // const blogPosts = await fetchBlogPosts()
    // const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    //   url: `${baseUrl}/blog/${post.slug}`,
    //   lastModified: post.updatedAt,
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // }))

    return [...staticRoutes, ...resourceTypeRoutes]
}
