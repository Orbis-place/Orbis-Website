'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { FilterOption, ViewMode, MarketplaceItem } from '@/components/marketplace';
import {
    FilterSidebar,
    MarketplaceHeader,
    MarketplaceSearch,
    FilterSortButton,
    ViewSwitcher,
    Pagination,
    MarketplaceCard,
    SkeletonCard,
    FilterCard,
    TagFilter,
    CategoryFilter,
    VersionFilter,
} from '@/components/marketplace';
import { getResourceType, isValidResourceType } from '@/config/resource-types';
import { fetchResources, mapTypeToBackendEnum, ResourceSortOption, type Resource } from '@/lib/api/resources';
import { useDebounce } from '@/hooks/useDebounce';

export default function MarketplacePage({ params }: { params: Promise<{ type: string }> }) {
    // Unwrap params using React.use()
    const { type } = use(params);

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [resources, setResources] = useState<Resource[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<ResourceSortOption>(ResourceSortOption.DATE);

    // New filter states
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Validate resource type
    if (!isValidResourceType(type)) {
        notFound();
    }

    const typeConfig = getResourceType(type);
    const backendType = mapTypeToBackendEnum(type);

    const filterOptions: FilterOption[] = [
        { id: 'all', label: 'All' },
        { id: 'gaia-selection', label: "Gaia's Selection" },
        { id: 'favorites', label: 'Favorites' },
        { id: 'featured', label: 'Featured' },
        { id: 'trending', label: 'Trending' },
        { id: 'new', label: 'New' },
        { id: 'updated', label: 'Updated' },
    ];

    // Fetch resources from API
    useEffect(() => {
        const loadResources = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetchResources({
                    type: backendType,
                    search: debouncedSearchQuery || undefined,
                    sortBy,
                    page: currentPage,
                    limit: 12,
                });

                setResources(response.data);
                setTotalPages(response.meta.totalPages);
                setTotalCount(response.meta.total);
            } catch (err) {
                console.error('Failed to fetch resources:', err);
                setError(err instanceof Error ? err.message : 'Failed to load resources');
                setResources([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadResources();
    }, [backendType, debouncedSearchQuery, sortBy, currentPage]);

    // Map backend resource to MarketplaceItem
    const mapToMarketplaceItem = (resource: Resource): MarketplaceItem => {
        const author = resource.team?.name || resource.owner.username;
        const authorDisplay = resource.team?.displayName || resource.owner.displayName;

        // Get tags (no limit, we'll show all)
        const tagNames = resource.tags
            ?.map(t => t.tag.name) || [];

        // Get categories
        const categoryNames = resource.categories
            ?.map(c => c.category.name) || [];

        return {
            id: resource.id,
            title: resource.name,
            author,
            authorDisplay,
            description: resource.tagline || resource.description || '',
            image: resource.iconUrl || resource.bannerUrl || '',
            rating: 4.5, // TODO: Add rating system
            likes: formatNumber(resource.likeCount),
            downloads: formatNumber(resource.downloadCount),
            date: formatDate(resource.publishedAt || resource.createdAt),
            updatedAt: formatRelativeTime(resource.updatedAt || resource.createdAt),
            tags: tagNames,
            categories: categoryNames,
            type: typeConfig.labelSingular,
        };
    };

    // Format numbers (e.g., 1399 -> 1.4k)
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).replace(/\//g, '-');
    };

    // Format relative time (e.g., "Updated 2 weeks ago")
    const formatRelativeTime = (dateString: string): string => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffYears > 0) {
            return `Updated ${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        } else if (diffMonths > 0) {
            return `Updated ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else if (diffWeeks > 0) {
            return `Updated ${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        } else if (diffDays > 0) {
            return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `Updated ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Updated just now';
        }
    };

    const items: MarketplaceItem[] = resources.map(mapToMarketplaceItem);

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8 relative overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-11">
                {/* Filter Sidebar with new filter cards */}
                <aside className="hidden lg:block w-full lg:w-[273px] flex-shrink-0">
                    <div className="space-y-4 sticky top-4">
                        {/* Browse / Quick Filters */}
                        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-2.5">
                            <h3 className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 uppercase">
                                Browse
                            </h3>
                            <div className="flex flex-col gap-2.5">
                                {filterOptions.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`
                                            flex items-center px-[15px] py-2.5 rounded-full transition-all
                                            ${activeFilter === filter.id
                                                ? 'bg-[#032125] text-[#109EB1]'
                                                : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                                            }
                                        `}
                                    >
                                        <span className="font-abeezee text-[15.16px] leading-[18px]">
                                            {filter.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Cards */}
                        <FilterCard title="Tags" defaultExpanded={true}>
                            <TagFilter
                                selectedTags={selectedTags}
                                onTagsChange={setSelectedTags}
                                resourceType={backendType}
                            />
                        </FilterCard>

                        <FilterCard title="Categories" defaultExpanded={true}>
                            <CategoryFilter
                                selectedCategories={selectedCategories}
                                onCategoriesChange={setSelectedCategories}
                                resourceType={backendType}
                            />
                        </FilterCard>

                        <FilterCard title="Hytale Version" defaultExpanded={true}>
                            <VersionFilter
                                selectedVersions={selectedVersions}
                                onVersionsChange={setSelectedVersions}
                            />
                        </FilterCard>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Title and Count */}
                    <MarketplaceHeader title={typeConfig.label} count={isLoading ? 0 : totalCount} />

                    {/* Search Bar */}
                    <div className="mb-4 sm:mb-6">
                        <MarketplaceSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={`Search ${typeConfig.plural}...`}
                        />
                    </div>

                    {/* Filters, View Switcher and Pagination Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                        <div className="flex flex-wrap gap-2 sm:gap-[15px]">
                            {/* Sort Button */}
                            <FilterSortButton
                                label={sortBy === ResourceSortOption.DOWNLOADS ? 'Downloads' : sortBy === ResourceSortOption.LIKES ? 'Likes' : 'Date'}
                                onClick={() => {
                                    // Cycle through sort options
                                    const options = [ResourceSortOption.DOWNLOADS, ResourceSortOption.LIKES, ResourceSortOption.DATE];
                                    const currentIndex = options.indexOf(sortBy);
                                    const nextIndex = (currentIndex + 1) % options.length;
                                    setSortBy(options[nextIndex] ?? ResourceSortOption.DATE);
                                }}
                                icon={
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 8H16M6 12H18M4 16H20" stroke="#C7F4FA" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                }
                            />

                            {/* View Switcher */}
                            <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                    {/* Loading State - Skeleton Cards */}
                    {isLoading && (
                        <div
                            className={`mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden ${viewMode === 'row'
                                ? 'flex flex-col gap-3 sm:gap-4'
                                : viewMode === 'gallery'
                                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
                                    : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5'
                                }`}
                        >
                            {Array(12).fill(null).map((_, i) => (
                                <SkeletonCard key={i} viewMode={viewMode} />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-red-400">Error: {error}</div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && items.length === 0 && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-white/60">No resources found</div>
                        </div>
                    )}

                    {/* Items Grid */}
                    {!isLoading && !error && items.length > 0 && (
                        <div
                            className={`mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden ${viewMode === 'row'
                                ? 'flex flex-col gap-3 sm:gap-4'
                                : viewMode === 'gallery'
                                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
                                    : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5'
                                }`}
                        >
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/${typeConfig.singular}/${item.title.toLowerCase().replace(/ /g, '-')}`}
                                    className="cursor-pointer"
                                >
                                    <MarketplaceCard item={item} viewMode={viewMode} />
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Bottom Pagination */}
                    {!isLoading && !error && items.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
