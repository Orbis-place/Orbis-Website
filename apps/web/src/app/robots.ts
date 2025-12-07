import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://orbis.place'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/*',
                    '/api/*',
                    '/manage/*',
                    '/login',
                    '/signup',
                    '/verify-email',
                    '/forgot-password',
                    '/reset-password',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
