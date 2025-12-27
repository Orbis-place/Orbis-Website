"use client";

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTeam } from '@/contexts/TeamContext';
import { SHOWCASE_CATEGORIES, type ShowcaseCategory } from '@/lib/api/showcase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ShowcasePost {
    id: string;
    title: string;
    category: ShowcaseCategory;
    viewCount: number;
    createdAt: string;
    author: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
    media: {
        id: string;
        url: string;
        type: string;
    }[];
    _count: {
        likes: number;
        comments: number;
    };
}

export default function TeamShowcasePage() {
    const { team } = useTeam();
    const [posts, setPosts] = useState<ShowcasePost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!team?.id) return;

        async function fetchShowcase() {
            try {
                const response = await fetch(`${API_URL}/teams/${team?.id}/showcase`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error('Failed to fetch showcase:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchShowcase();
    }, [team?.id]);

    if (!team) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Icon icon="mdi:loading" className="animate-spin text-[#109EB1]" width="40" height="40" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.length > 0 ? (
                    posts.map((post) => {
                        const categoryInfo = SHOWCASE_CATEGORIES[post.category];
                        const thumbnail = post.media[0]?.url;

                        return (
                            <Link
                                key={post.id}
                                href={`/showcase/${post.id}`}
                                className="group bg-[#06363D]/50 border border-[#084B54] rounded-[15px] overflow-hidden hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video relative bg-[#032125]">
                                    {thumbnail ? (
                                        <img
                                            src={thumbnail}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon icon="mdi:image-off-outline" className="text-[#C7F4FA]/30" width="48" height="48" />
                                        </div>
                                    )}
                                    {/* Category badge */}
                                    <div
                                        className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-nunito font-semibold flex items-center gap-1"
                                        style={{ backgroundColor: categoryInfo.color, color: '#032125' }}
                                    >
                                        <Icon icon={categoryInfo.icon} width="12" height="12" />
                                        {categoryInfo.label}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-hebden font-bold text-[#C7F4FA] line-clamp-1 mb-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-[#C7F4FA]/60 font-nunito">
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:heart" width="14" height="14" />
                                            {post._count.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:eye" width="14" height="14" />
                                            {post.viewCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:comment" width="14" height="14" />
                                            {post._count.comments}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                        <Icon icon="mdi:image-multiple-outline" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No showcase posts yet</h3>
                        <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                            This team hasn't published any showcase posts.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
