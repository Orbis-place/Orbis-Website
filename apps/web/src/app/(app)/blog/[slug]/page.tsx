import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

// Mock data - same as blog page
const MOCK_POSTS = [
    {
        id: '1',
        slug: 'hytale-beta-announcement',
        title: 'Hytale Beta: Everything You Need to Know',
        description: 'The long-awaited Hytale beta is finally approaching! Discover all the new features, gameplay mechanics, and what to expect from this revolutionary blocky adventure game.',
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200',
        author: 'hypixelstudios',
        authorDisplay: 'Hypixel Studios',
        date: 'Dec 5, 2025',
        readTime: '5 min read',
        category: 'Announcements',
        content: `
The moment we've all been waiting for is finally here! After years of development and anticipation, the Hytale beta is approaching, bringing with it a revolutionary gaming experience that promises to redefine what we expect from block-based adventure games.

## What Makes Hytale Special?

Hytale isn't just another voxel game. It's a carefully crafted experience that combines the best elements of sandbox creativity with deep RPG mechanics, challenging combat, and a vast world to explore.

### Key Features

**Dynamic World Generation**: Every world in Hytale is unique, featuring diverse biomes, dungeons, and structures that make exploration endlessly rewarding.

**Advanced Building Tools**: The in-game model maker and powerful building tools give creators unprecedented freedom to bring their visions to life.

**Rich Combat System**: Engage in tactical combat with various weapons, abilities, and strategies. Fight monsters, bosses, and even other players in competitive modes.

**Deep Customization**: From character creation to mod support, Hytale embraces player creativity at every level.

## What to Expect in Beta

The beta will include:

- Access to Zone 1 (Emerald Grove) and Zone 2 (Howling Sands)
- Full creative mode with all building tools
- Adventure mode with quests and dungeons
- Multiplayer support for both creative and adventure
- Early access to the modding API

## Getting Ready

Make sure your system meets the minimum requirements and stay tuned to official channels for beta access announcements. The journey is about to begin!
        `
    }
];

// Generate metadata for SEO
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const post = MOCK_POSTS.find(p => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found',
            description: 'The requested blog post could not be found.'
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://orbis.place';
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const authorUrl = `${siteUrl}/user/${post.author}`;

    return {
        title: `${post.title} | Orbis Blog`,
        description: post.description,
        authors: [{ name: post.authorDisplay, url: authorUrl }],
        keywords: [
            'Hytale',
            'Orbis',
            post.category || 'Blog',
            'Gaming',
            'Hytale Community',
            'Hytale News'
        ],
        openGraph: {
            type: 'article',
            url: postUrl,
            title: post.title,
            description: post.description,
            images: [
                {
                    url: post.image,
                    width: 1200,
                    height: 630,
                    alt: post.title
                }
            ],
            publishedTime: new Date(post.date).toISOString(),
            authors: [post.authorDisplay],
            siteName: 'Orbis',
            locale: 'en_US'
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: [post.image],
            creator: `@${post.author}`
        },
        alternates: {
            canonical: postUrl
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        }
    };
}

export default async function BlogPostPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const post = MOCK_POSTS.find(p => p.slug === slug);

    if (!post) {
        notFound();
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://orbis.place';
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const authorUrl = `${siteUrl}/user/${post.author}`;

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                '@id': `${postUrl}#article`,
                headline: post.title,
                description: post.description,
                image: {
                    '@type': 'ImageObject',
                    url: post.image,
                    width: 1200,
                    height: 630
                },
                datePublished: new Date(post.date).toISOString(),
                dateModified: new Date(post.date).toISOString(),
                author: {
                    '@type': 'Person',
                    '@id': `${authorUrl}#person`,
                    name: post.authorDisplay,
                    url: authorUrl
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': `${siteUrl}#organization`,
                    name: 'Orbis',
                    logo: {
                        '@type': 'ImageObject',
                        url: `${siteUrl}/logo.png`
                    }
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': postUrl
                },
                articleSection: post.category,
                inLanguage: 'en-US',
                isAccessibleForFree: true
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${postUrl}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: siteUrl
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Blog',
                        item: `${siteUrl}/blog`
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: post.title,
                        item: postUrl
                    }
                ]
            }
        ]
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen">
                {/* Back Button */}
                <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-8">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 font-hebden text-sm text-[#109EB1] hover:text-[#C7F4FA] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative w-full aspect-[21/9] rounded-[25px] overflow-hidden border border-[#084B54]">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            {post.category && (
                                <div className="absolute top-6 left-6 px-3 py-1.5 bg-[#109EB1] rounded-[36px] z-10">
                                    <span className="font-hebden font-semibold text-sm leading-[14px] text-[#C7F4FA]">
                                        {post.category}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <article className="px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="mb-8">
                            <h1 className="font-hebden font-semibold text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#C7F4FA] mb-6">
                                {post.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-[#084B54]">
                                <Link
                                    href={`/user/${post.author}`}
                                    className="flex items-center gap-2 hover:text-[#109EB1] transition-colors"
                                >
                                    <User className="w-5 h-5 text-[#C7F4FA]/50" />
                                    <span className="font-hebden font-semibold text-base text-[#109EB1]">
                                        {post.authorDisplay}
                                    </span>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#C7F4FA]/50" />
                                    <span className="font-nunito text-base text-[#C7F4FA]/70">{post.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#C7F4FA]/50" />
                                    <span className="font-nunito text-base text-[#C7F4FA]/70">{post.readTime}</span>
                                </div>
                            </div>
                        </header>

                        {/* Article Body */}
                        <div className="prose prose-invert max-w-none">
                            <div className="font-nunito text-base sm:text-lg leading-relaxed text-[#C7F4FA]/80 space-y-6">
                                {post.content.split('\n\n').map((paragraph, index) => {
                                    // Handle markdown headers
                                    if (paragraph.startsWith('## ')) {
                                        return (
                                            <h2 key={index} className="font-hebden font-semibold text-2xl sm:text-3xl text-[#C7F4FA] mt-8 mb-4">
                                                {paragraph.replace('## ', '')}
                                            </h2>
                                        );
                                    }
                                    if (paragraph.startsWith('### ')) {
                                        return (
                                            <h3 key={index} className="font-hebden font-semibold text-xl sm:text-2xl text-[#C7F4FA] mt-6 mb-3">
                                                {paragraph.replace('### ', '')}
                                            </h3>
                                        );
                                    }
                                    // Handle bold text
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                        return (
                                            <p key={index} className="font-hebden font-semibold text-[#C7F4FA]">
                                                {paragraph.replace(/\*\*/g, '')}
                                            </p>
                                        );
                                    }
                                    // Regular paragraph
                                    return paragraph.trim() && (
                                        <p key={index} className="leading-relaxed">
                                            {paragraph}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="mt-12 pt-8 border-t border-[#084B54]">
                            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-6 sm:p-8 text-center">
                                <h3 className="font-hebden font-semibold text-2xl text-[#C7F4FA] mb-3">
                                    Join the Orbis Community
                                </h3>
                                <p className="font-nunito text-base text-[#C7F4FA]/70 mb-6 max-w-2xl mx-auto">
                                    Stay updated with the latest news, connect with other players, and discover amazing creations on Orbis.
                                </p>
                                <Link
                                    href="/signup"
                                    className="inline-block px-6 py-3 bg-[#109EB1] hover:bg-[#109EB1]/90 rounded-full font-hebden font-semibold text-base text-[#C7F4FA] transition-colors"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </>
    );
}
