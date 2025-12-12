'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { FilterOption } from '@/components/marketplace';
import {
    MarketplaceHeader,
    MarketplaceSearch,
    FilterSortButton,
    Pagination,
    SkeletonCard,
} from '@/components/marketplace';
import { ServerCard, type ServerItem } from '@/components/servers';
import { fetchServers, ServerSortOption, type Server } from '@/lib/api/servers';
import { useDebounce } from '@/hooks/useDebounce';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CheckIcon, ArrowDown, ArrowUp } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ServersPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [servers, setServers] = useState<Server[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sort field and direction management
    type SortField = 'votes' | 'players' | 'date' | 'name';
    const [sortField, setSortField] = useState<SortField>('votes');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc'); // desc = high to low, asc = low to high

    // Filter states
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const filterOptions: FilterOption[] = [
        { id: 'all', label: 'All Servers' },
        { id: 'featured', label: 'Featured' },
        { id: 'trending', label: 'Trending' },
        { id: 'new', label: 'New' },
    ];

    // Convert sort field + direction to ServerSortOption
    const getSortOption = (): ServerSortOption => {
        if (sortField === 'votes') {
            // Votes uses VOTES enum which is always descending in the backend
            // We'll just use VOTES for now since there's no VOTES_ASC option
            return ServerSortOption.VOTES;
        } else if (sortField === 'players') {
            // Players uses PLAYERS enum which is always descending in the backend
            return ServerSortOption.PLAYERS;
        } else if (sortField === 'date') {
            return sortDirection === 'desc' ? ServerSortOption.NEWEST : ServerSortOption.OLDEST;
        } else { // name
            return sortDirection === 'asc' ? ServerSortOption.NAME_ASC : ServerSortOption.NAME_DESC;
        }
    };

    // Handle sort selection with toggle
    const handleSortChange = (field: SortField) => {
        if (field === sortField) {
            // Same field - toggle direction
            setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            // Different field - set to descending by default
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Fetch servers from API
    useEffect(() => {
        const loadServers = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Apply quick filters
                let featured = featuredOnly;
                let verified = verifiedOnly;
                let online = onlineOnly;

                if (activeFilter === 'featured') {
                    featured = true;
                } else if (activeFilter === 'verified') {
                    verified = true;
                } else if (activeFilter === 'online') {
                    online = true;
                }

                const response = await fetchServers({
                    search: debouncedSearchQuery || undefined,
                    sortBy: getSortOption(),
                    page: currentPage,
                    limit: 20,
                    online: online || undefined,
                    featured: featured || undefined,
                    verified: verified || undefined,
                });

                setServers(response.data);
                setTotalPages(response.meta.totalPages);
                setTotalCount(response.meta.total);
            } catch (err) {
                console.error('Failed to fetch servers:', err);
                setError(err instanceof Error ? err.message : 'Failed to load servers');
                setServers([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadServers();
    }, [debouncedSearchQuery, sortField, sortDirection, currentPage, activeFilter, onlineOnly, featuredOnly, verifiedOnly]);

    // Map backend server to ServerItem
    const mapToServerItem = (server: Server, index: number): ServerItem => {
        const owner = server.owner.username;
        const ownerDisplay = server.owner.displayName;

        // Get tags
        const tagNames = server.tags?.map(t => t.tag.name) || [];

        // Get categories
        const categoryNames = server.categories?.map(c => c.category.name) || [];

        return {
            id: server.id,
            rank: (currentPage - 1) * 20 + index + 1,
            name: server.name,
            owner,
            ownerDisplay,
            logoUrl: server.logoUrl,
            bannerUrl: server.bannerUrl,
            serverIp: server.serverIp,
            onlineStatus: server.onlineStatus,
            currentPlayers: server.currentPlayers,
            maxPlayers: server.maxPlayers,
            voteCount: server.voteCount,
            tags: tagNames,
            categories: categoryNames,
            verified: server.verified,
            featured: server.featured,
            description: server.description,
        };
    };

    const items: ServerItem[] = servers.map(mapToServerItem);

    return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8 relative overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-11">
                {/* Filter Sidebar */}
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

                        {/* Status Filters */}
                        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-2.5">
                            <h3 className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 uppercase mb-1">
                                Status
                            </h3>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setOnlineOnly(!onlineOnly)}
                                    className={`
                                        flex items-center justify-between px-[15px] py-2.5 rounded-full transition-all cursor-pointer
                                        ${onlineOnly
                                            ? 'bg-[#032125] text-[#109EB1]'
                                            : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                                        }
                                    `}
                                >
                                    <span className="font-abeezee text-[15.16px] leading-[18px]">
                                        Online Only
                                    </span>
                                    {onlineOnly && (
                                        <CheckIcon className="w-4 h-4 text-[#109EB1]" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setFeaturedOnly(!featuredOnly)}
                                    className={`
                                        flex items-center justify-between px-[15px] py-2.5 rounded-full transition-all cursor-pointer
                                        ${featuredOnly
                                            ? 'bg-[#032125] text-[#109EB1]'
                                            : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                                        }
                                    `}
                                >
                                    <span className="font-abeezee text-[15.16px] leading-[18px]">
                                        Featured
                                    </span>
                                    {featuredOnly && (
                                        <CheckIcon className="w-4 h-4 text-[#109EB1]" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                                    className={`
                                        flex items-center justify-between px-[15px] py-2.5 rounded-full transition-all cursor-pointer
                                        ${verifiedOnly
                                            ? 'bg-[#032125] text-[#109EB1]'
                                            : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                                        }
                                    `}
                                >
                                    <span className="font-abeezee text-[15.16px] leading-[18px]">
                                        Verified
                                    </span>
                                    {verifiedOnly && (
                                        <CheckIcon className="w-4 h-4 text-[#109EB1]" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Header */}
                    <div className="mb-4 sm:mb-6">
                        <h1 className="font-hebden font-semibold text-3xl sm:text-4xl leading-tight text-[#C7F4FA] mb-2">
                            Hytale Server List
                        </h1>
                        <p className="font-nunito text-base text-[#C7F4FA]/70">
                            Welcome to our Hytale Server List! Discover and join Hytale communities.
                        </p>
                        <p className="font-hebden text-sm text-[#C7F4FA]/50 mt-2">
                            Tracking <strong className="text-[#109EB1]">{totalCount}</strong> Hytale Server{totalCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4 sm:mb-6">
                        <MarketplaceSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search servers..."
                        />
                    </div>

                    {/* Filters, Sort Dropdown and Pagination Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                        <div className="flex flex-wrap gap-2 sm:gap-[15px]">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="inline-flex items-center justify-between gap-2 w-[180px] px-4 py-2.5 rounded-lg border-2 border-[#084B54] bg-[#06363D] text-[#C7F4FA] text-sm font-nunito hover:border-[#109EB1] focus:border-[#109EB1] focus:outline-none transition-colors duration-200">
                                        <div className="flex items-center gap-2">
                                            {/* Show ArrowDown for descending (high to low), ArrowUp for ascending (low to high) */}
                                            {sortDirection === 'desc' ? (
                                                <ArrowDown className="w-4 h-4 text-[#109EB1]" />
                                            ) : (
                                                <ArrowUp className="w-4 h-4 text-[#109EB1]" />
                                            )}
                                            <span>
                                                {sortField === 'votes' ? 'Votes' :
                                                    sortField === 'players' ? 'Players' :
                                                        sortField === 'date' ? 'Date' :
                                                            'Name'}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-[180px] bg-[#06363D] border-2 border-[#084B54] rounded-lg p-1"
                                >
                                    <DropdownMenuItem
                                        onClick={() => handleSortChange('votes')}
                                        className="text-[#C7F4FA] font-nunito text-sm cursor-pointer rounded-md hover:bg-[#109EB1]/10 focus:bg-[#109EB1]/10 focus:text-[#C7F4FA]"
                                    >
                                        Votes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleSortChange('players')}
                                        className="text-[#C7F4FA] font-nunito text-sm cursor-pointer rounded-md hover:bg-[#109EB1]/10 focus:bg-[#109EB1]/10 focus:text-[#C7F4FA]"
                                    >
                                        Players
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleSortChange('date')}
                                        className="text-[#C7F4FA] font-nunito text-sm cursor-pointer rounded-md hover:bg-[#109EB1]/10 focus:bg-[#109EB1]/10 focus:text-[#C7F4FA]"
                                    >
                                        Date
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleSortChange('name')}
                                        className="text-[#C7F4FA] font-nunito text-sm cursor-pointer rounded-md hover:bg-[#109EB1]/10 focus:bg-[#109EB1]/10 focus:text-[#C7F4FA]"
                                    >
                                        Name
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                        <div className="mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden flex flex-col gap-3 sm:gap-4">
                            {Array(12).fill(null).map((_, i) => (
                                <SkeletonCard key={i} viewMode="row" />
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
                            <div className="text-white/60">No servers found</div>
                        </div>
                    )}

                    {/* Servers Grid */}
                    {!isLoading && !error && items.length > 0 && (
                        <div className="mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden flex flex-col gap-3 sm:gap-4">
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/servers/${item.name.toLowerCase().replace(/ /g, '-')}`}
                                    className="cursor-pointer"
                                >
                                    <ServerCard item={item} viewMode="row" />
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
