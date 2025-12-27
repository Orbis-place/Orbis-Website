"use client";

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { SHOWCASE_CATEGORIES, type ShowcasePost, type ShowcaseCategory } from '@/lib/api/showcase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function UserShowcasePage() {
    const { user } = useUser();
    const [posts, setPosts] = useState<ShowcasePost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            if (!user) return;

            try {
                const response = await fetch(`${API_URL}/showcase?authorUsername=${user.username}&limit=50`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.data || []);
                }
            } catch (error) {
                console.error('Failed to load showcase posts:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadPosts();
    }, [user]);

    if (!user) return null;

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-[#109EB1] text-4xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post) => {
                        const categoryInfo = SHOWCASE_CATEGORIES[post.category];
                        return (
                            <Link
                                key={post.id}
                                href={`/showcase/${post.id}`}
                                className="group bg-[#06363D]/50 border border-[#084B54] rounded-[15px] overflow-hidden hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-[#032125] relative overflow-hidden">
                                    {post.thumbnailUrl ? (
                                        <img
                                            src={post.thumbnailUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon icon={categoryInfo.icon} className="text-4xl text-[#C7F4FA]/20" />
                                        </div>
                                    )}
                                    {/* Category Badge */}
                                    <div
                                        className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-nunito font-semibold flex items-center gap-1"
                                        style={{ backgroundColor: categoryInfo.color, color: '#032125' }}
                                    >
                                        <Icon icon={categoryInfo.icon} className="text-sm" />
                                        {categoryInfo.label}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-hebden font-bold text-[#C7F4FA] truncate mb-2 group-hover:text-[#109EB1] transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-[#C7F4FA]/60 font-nunito">
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:heart-outline" />
                                            {post.likeCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:eye-outline" />
                                            {post.viewCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:comment-outline" />
                                            {post.commentCount}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                    <Icon icon="mdi:palette-outline" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                    <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No showcase posts yet</h3>
                    <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                        This user hasn't published any showcase posts.
                    </p>
                </div>
            )}
        </div>
    );
}
