'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
    fetchShowcasePosts,
    fetchShowcaseCategories,
    SHOWCASE_CATEGORIES,
    type ShowcasePost,
    type ShowcaseCategory,
    type ShowcaseCategoryInfo,
} from '@/lib/api/showcase';
import ShowcaseCard from '@/components/showcase/ShowcaseCard';
import { useSessionStore } from '@/stores/useSessionStore';
import { MarketplaceSearch } from '@/components/marketplace';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function ShowcasePage() {
    const { session } = useSessionStore();
    const [posts, setPosts] = useState<ShowcasePost[]>([]);
    const [categories, setCategories] = useState<ShowcaseCategoryInfo[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ShowcaseCategory | null>(null);
    const [sortBy, setSortBy] = useState<'createdAt' | 'likeCount' | 'viewCount'>('createdAt');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetchShowcasePosts({
                category: selectedCategory || undefined,
                sortBy,
                search: search || undefined,
                page,
                limit: 24,
            });
            setPosts(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error('Failed to load showcase posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, sortBy, search, page]);

    const loadCategories = useCallback(async () => {
        try {
            const cats = await fetchShowcaseCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, sortBy, search]);

    const allCategories = Object.keys(SHOWCASE_CATEGORIES) as ShowcaseCategory[];

    return (
        <>
            {/* Hero Section */}
            <section className="relative -mt-[100px] overflow-hidden min-h-[400px] flex items-center">
                {/* Background */}
                <div className="absolute inset-0 bg-[#032125]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#109EB1]/20 via-transparent to-[#109EB1]/5" />
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 158, 177, 0.15) 0%, transparent 50%),
                                          radial-gradient(circle at 80% 70%, rgba(16, 158, 177, 0.08) 0%, transparent 50%)`
                    }} />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#032125] to-transparent" />
                </div>

                {/* Content */}
                <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-12">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="max-w-2xl space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#109EB1]/10 border border-[#109EB1]/20 text-[#109EB1] text-xs font-hebden tracking-wider">
                                <Icon icon="mdi:image-multiple" className="text-sm" />
                                COMMUNITY GALLERY
                            </div>
                            <h1 className="font-hebden text-4xl md:text-5xl text-[#C7F4FA] leading-tight">
                                Showcase
                            </h1>
                            <p className="text-[#C7F4FA]/70 text-lg font-nunito leading-relaxed max-w-xl">
                                Discover amazing work-in-progress, concepts, and finished projects from the Hytale creator community. Get inspired, share feedback, and connect with fellow creators.
                            </p>
                        </div>

                        {/* Create Post Button */}
                        {session && (
                            <Link
                                href="/showcase/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#109EB1]/80 text-white rounded-xl font-nunito font-semibold transition-all"
                            >
                                <Icon icon="mdi:plus" className="text-xl" />
                                Create Post
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
                {/* Search Bar */}
                <div className="w-full max-w-2xl">
                    <MarketplaceSearch
                        value={search}
                        onChange={setSearch}
                        placeholder="Search showcase posts..."
                    />
                </div>

                {/* Categories & Sort Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-nunito font-medium transition-all ${selectedCategory === null
                                ? 'bg-[#109EB1] text-white'
                                : 'bg-[#06363D] border border-[#084B54] text-[#C7F4FA]/70 hover:text-[#C7F4FA] hover:border-[#109EB1]/40'
                                }`}
                        >
                            All
                        </button>
                        {allCategories.map((cat) => {
                            const info = SHOWCASE_CATEGORIES[cat];
                            const count = categories.find(c => c.category === cat)?.count || 0;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-nunito font-medium transition-all ${selectedCategory === cat
                                        ? 'text-[#032125]'
                                        : 'bg-[#06363D] border border-[#084B54] text-[#C7F4FA]/70 hover:text-[#C7F4FA] hover:border-[#109EB1]/40'
                                        }`}
                                    style={selectedCategory === cat ? { backgroundColor: info.color } : {}}
                                >
                                    <Icon icon={info.icon} className="text-base" />
                                    {info.label}
                                    {count > 0 && <span className="opacity-70 text-xs">({count})</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort Select */}
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                        <SelectTrigger className="w-[180px] bg-[#06363D] border-[#084B54] hover:border-[#109EB1]/40">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:sort" className="text-[#C7F4FA]/50" />
                                <SelectValue placeholder="Sort by" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Newest</SelectItem>
                            <SelectItem value="likeCount">Most Liked</SelectItem>
                            <SelectItem value="viewCount">Most Viewed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Posts Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-[#06363D]/50 rounded-xl aspect-[4/3] animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <Icon icon="mdi:image-off-outline" className="text-6xl text-[#C7F4FA]/30 mx-auto mb-4" />
                        <h3 className="font-hebden text-xl text-[#C7F4FA]/70 mb-2">No posts found</h3>
                        <p className="text-[#C7F4FA]/50 font-nunito">
                            {search || selectedCategory
                                ? 'Try adjusting your filters or search query'
                                : 'Be the first to share your creation!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {posts.map((post) => (
                            <ShowcaseCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-[#06363D] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06363D]/80 transition-colors"
                        >
                            <Icon icon="mdi:chevron-left" />
                        </button>
                        <span className="px-4 py-2 text-[#C7F4FA]/70 font-nunito">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-[#06363D] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06363D]/80 transition-colors"
                        >
                            <Icon icon="mdi:chevron-right" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
