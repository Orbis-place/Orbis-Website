'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useSessionStore } from '@/stores/useSessionStore';
import { SHOWCASE_CATEGORIES, type ShowcasePost, type ShowcaseCategory } from '@/lib/api/showcase';
import { OrbisDialog } from '@/components/OrbisDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MyShowcasePost extends ShowcasePost {
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export default function ShowcaseDashboardPage() {
    const { session } = useSessionStore();
    const [posts, setPosts] = useState<MyShowcasePost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const loadPosts = useCallback(async () => {
        if (!session) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/showcase/my?limit=100`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setPosts(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleDelete = async (postId: string) => {
        try {
            const response = await fetch(`${API_URL}/showcase/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
        setDeleteConfirmId(null);
    };

    const handleStatusChange = async (postId: string, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
        try {
            const response = await fetch(`${API_URL}/showcase/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, status: newStatus } : p
                ));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-nunito">Published</span>;
            case 'DRAFT':
                return <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-nunito">Draft</span>;
            case 'ARCHIVED':
                return <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs font-nunito">Archived</span>;
            default:
                return null;
        }
    };

    if (!session) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-20">
                    <Icon ssr={true} icon="mdi:lock-outline" className="text-6xl text-[#C7F4FA]/30 mx-auto mb-4" />
                    <h2 className="font-hebden text-xl text-[#C7F4FA] mb-2">Sign in required</h2>
                    <p className="text-[#C7F4FA]/50 font-nunito mb-6">
                        You need to sign in to manage your showcase posts.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold hover:bg-[#109EB1]/80 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:login" />
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-hebden text-2xl text-[#C7F4FA]">My Showcase Posts</h1>
                    <p className="text-[#C7F4FA]/60 font-nunito text-sm mt-1">
                        Manage your showcase posts and track their performance
                    </p>
                </div>
                <Link
                    href="/showcase/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold hover:bg-[#109EB1]/80 transition-colors"
                >
                    <Icon ssr={true} icon="mdi:plus" />
                    Create New
                </Link>
            </div>

            {/* Posts List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[#06363D]/50 rounded-xl h-24 animate-pulse" />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-[#06363D]/50 rounded-xl border border-[#109EB1]/10">
                    <Icon ssr={true} icon="mdi:image-plus-outline" className="text-6xl text-[#C7F4FA]/30 mx-auto mb-4" />
                    <h3 className="font-hebden text-xl text-[#C7F4FA]/70 mb-2">No posts yet</h3>
                    <p className="text-[#C7F4FA]/50 font-nunito mb-6">
                        Share your first creation with the community!
                    </p>
                    <Link
                        href="/showcase/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold hover:bg-[#109EB1]/80 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:plus" />
                        Create Post
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => {
                        const categoryInfo = SHOWCASE_CATEGORIES[post.category];
                        return (
                            <div
                                key={post.id}
                                className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-4 hover:border-[#109EB1]/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <Link href={`/showcase/${post.id}`} className="flex-shrink-0">
                                        {post.thumbnailUrl ? (
                                            <img
                                                src={post.thumbnailUrl}
                                                alt={post.title}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-lg bg-[#032125] flex items-center justify-center">
                                                <Icon ssr={true} icon={categoryInfo.icon} className="text-2xl text-[#C7F4FA]/30" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link
                                                href={`/showcase/${post.id}`}
                                                className="font-hebden text-lg text-[#C7F4FA] hover:text-[#109EB1] transition-colors truncate"
                                            >
                                                {post.title}
                                            </Link>
                                            {getStatusBadge(post.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-[#C7F4FA]/50 font-nunito">
                                            <span
                                                className="inline-flex items-center gap-1"
                                                style={{ color: categoryInfo.color }}
                                            >
                                                <Icon ssr={true} icon={categoryInfo.icon} />
                                                {categoryInfo.label}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:heart-outline" />
                                                {post.likeCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:eye-outline" />
                                                {post.viewCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:comment-outline" />
                                                {post.commentCount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {post.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                                                className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-nunito hover:bg-green-500/30 transition-colors"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        {post.status === 'PUBLISHED' && (
                                            <button
                                                onClick={() => handleStatusChange(post.id, 'ARCHIVED')}
                                                className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg text-sm font-nunito hover:bg-gray-500/30 transition-colors"
                                            >
                                                Archive
                                            </button>
                                        )}
                                        {post.status === 'ARCHIVED' && (
                                            <button
                                                onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                                                className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-nunito hover:bg-green-500/30 transition-colors"
                                            >
                                                Republish
                                            </button>
                                        )}
                                        <Link
                                            href={`/showcase/${post.id}/edit`}
                                            className="p-2 text-[#C7F4FA]/60 hover:text-[#109EB1] transition-colors"
                                            title="Edit"
                                        >
                                            <Icon ssr={true} icon="mdi:pencil-outline" className="text-xl" />
                                        </Link>
                                        <Link
                                            href={`/showcase/${post.id}`}
                                            className="p-2 text-[#C7F4FA]/60 hover:text-[#C7F4FA] transition-colors"
                                            title="View"
                                        >
                                            <Icon ssr={true} icon="mdi:eye-outline" className="text-xl" />
                                        </Link>
                                        <OrbisDialog
                                            open={deleteConfirmId === post.id}
                                            onOpenChange={(open) => setDeleteConfirmId(open ? post.id : null)}
                                            title="Delete Post"
                                            description={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
                                            trigger={
                                                <button
                                                    className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Icon ssr={true} icon="mdi:delete-outline" className="text-xl" />
                                                </button>
                                            }
                                            footer={
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="px-4 py-2 bg-[#032125] text-[#C7F4FA]/70 rounded-lg font-nunito hover:text-[#C7F4FA] transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-nunito font-semibold hover:bg-red-600 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            }
                                        >
                                            <></>
                                        </OrbisDialog>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
