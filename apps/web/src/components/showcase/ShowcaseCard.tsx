'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { SHOWCASE_CATEGORIES, type ShowcasePost } from '@/lib/api/showcase';

interface ShowcaseCardProps {
    post: ShowcasePost;
}

export default function ShowcaseCard({ post }: ShowcaseCardProps) {
    const categoryInfo = SHOWCASE_CATEGORIES[post.category];
    const thumbnailUrl = post.thumbnailUrl || post.media?.[0]?.url;

    return (
        <Link
            href={`/showcase/${post.id}`}
            className="group block bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl overflow-hidden hover:border-[#109EB1]/30 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#109EB1]/5"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-[#032125] overflow-hidden">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon ssr={true} icon={categoryInfo.icon} className="text-5xl text-[#C7F4FA]/20" />
                    </div>
                )}

                {/* Category Badge */}
                <div
                    className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-nunito font-semibold flex items-center gap-1"
                    style={{ backgroundColor: categoryInfo.color, color: 'white' }}
                >
                    <Icon ssr={true} icon={categoryInfo.icon} className="text-xs" />
                    {categoryInfo.label}
                </div>

                {/* Featured Badge */}
                {post.featured && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-nunito font-semibold bg-[#F5A623] text-white flex items-center gap-1">
                        <Icon ssr={true} icon="mdi:star" className="text-xs" />
                        Featured
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#032125] to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-hebden text-lg text-[#C7F4FA] line-clamp-1 group-hover:text-[#109EB1] transition-colors">
                    {post.title}
                </h3>

                {/* Author */}
                <div className="flex items-center gap-2">
                    {post.author.image ? (
                        <img
                            src={post.author.image}
                            alt={post.author.displayName || post.author.username}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                            <span className="text-xs font-hebden text-[#109EB1]">
                                {(post.author.displayName || post.author.username).slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <span className="text-sm text-[#C7F4FA]/70 font-nunito truncate">
                        {post.author.displayName || post.author.username}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-[#C7F4FA]/50">
                    <div className="flex items-center gap-1">
                        <Icon ssr={true} icon="mdi:heart-outline" />
                        <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon ssr={true} icon="mdi:comment-outline" />
                        <span>{post.commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Icon ssr={true} icon="mdi:eye-outline" />
                        <span>{post.viewCount}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
