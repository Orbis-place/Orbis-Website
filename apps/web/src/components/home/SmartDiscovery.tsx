'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { EntityAvatar } from '@/components/EntityAvatar';
import { fetchResources, ResourceSortOption, ResourceType, Resource } from '@/lib/api/resources';

const features = [
    {
        icon: 'mdi:magnify',
        title: 'Powerful Search',
        description: 'Find exactly what you need. Filter by type, category, tags, Hytale version, and more.',
    },
    {
        icon: 'mdi:star-shooting',
        title: 'Curated Collections',
        description: 'Selection of the Week, Hidden Gems, Starter Packs — discover quality content hand-picked by the community.',
    },
    {
        icon: 'mdi:dice-multiple',
        title: 'Surprise Me',
        description: 'Feeling adventurous? Let us recommend something unexpected.',
    },
];

const resourceTypes = [
    { label: 'Mods', type: ResourceType.MOD },
    { label: 'Worlds', type: ResourceType.WORLD },
    { label: 'Plugins', type: ResourceType.PLUGIN },
    { label: 'Modpacks', type: ResourceType.MODPACK },
    { label: 'Assets', type: ResourceType.ASSET_PACK },
];

interface ResourceResult {
    id: string;
    slug: string;
    title: string;
    author: string;
    type: string;
    downloads: string;
    iconUrl?: string;
}

// Helper function to format download count
function formatCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

// Transform API resource to display format
function transformResource(resource: Resource): ResourceResult {
    return {
        id: resource.id,
        slug: resource.slug,
        title: resource.name,
        author: resource.ownerTeam?.displayName || resource.ownerTeam?.name || resource.ownerUser?.displayName || resource.ownerUser?.username || 'Unknown',
        type: resource.type.replace(/_/g, ' ').split(' ').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join(' '),
        downloads: formatCount(resource.downloadCount || 0),
        iconUrl: resource.iconUrl,
    };
}

interface SmartDiscoveryProps {
    initialResources?: ResourceResult[];
}

export function SmartDiscovery({ initialResources = [] }: SmartDiscoveryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
    const [resources, setResources] = useState<ResourceResult[]>(initialResources);
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search function
    const searchResources = useCallback(async (query: string, type: ResourceType | null) => {
        setIsLoading(true);
        try {
            const response = await fetchResources({
                search: query || undefined,
                type: type || undefined,
                sortBy: ResourceSortOption.DOWNLOADS,
                limit: 3,
            });
            setResources(response.data.map(transformResource));
        } catch (error) {
            console.error('Failed to search resources:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            searchResources(searchQuery, selectedType);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedType, searchResources]);

    // Handle type selection
    const handleTypeClick = (type: ResourceType) => {
        setSelectedType(prev => prev === type ? null : type);
    };

    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Find Your Next Favorite
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Our intelligent search guides you to creations that match your style. Filter by category, popularity, or let yourself be surprised.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Features */}
                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon icon={feature.icon} className="w-6 h-6 text-[#109EB1]" />
                                </div>
                                <div>
                                    <h3 className="font-hebden font-semibold text-xl text-[#C7F4FA] mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="font-nunito text-[#C7F4FA]/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* CTA */}
                        <div className="pt-4">
                            <Link
                                href="/resources"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] rounded-full font-hebden font-semibold text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                            >
                                Explore the Marketplace
                                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Search Interface */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl p-6">
                        {/* Search Bar */}
                        <div className="flex items-center gap-3 bg-[#032125] border border-[#084B54] rounded-full px-4 py-3 mb-4">
                            <Icon icon="mdi:magnify" className="w-5 h-5 text-[#C7F4FA]/50" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search resources..."
                                className="bg-transparent border-none outline-none font-nunito text-[#C7F4FA] placeholder:text-[#C7F4FA]/50 w-full"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-[#C7F4FA]/50 hover:text-[#C7F4FA]"
                                >
                                    <Icon icon="mdi:close" className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {resourceTypes.map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => handleTypeClick(item.type)}
                                    className={`px-4 py-2 rounded-full font-nunito text-sm transition-colors ${selectedType === item.type
                                            ? 'bg-[#109EB1] text-[#C7F4FA]'
                                            : 'bg-[#032125] border border-[#084B54] text-[#C7F4FA]/70 hover:border-[#109EB1]'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Results */}
                        <div className="space-y-3">
                            {isLoading ? (
                                // Loading state
                                <>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-[#032125] border border-[#084B54] rounded-xl">
                                            <div className="w-12 h-12 bg-[#109EB1]/20 rounded-lg flex-shrink-0 animate-pulse" />
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="h-4 bg-[#109EB1]/20 rounded w-3/4 animate-pulse" />
                                                <div className="h-3 bg-[#109EB1]/10 rounded w-1/2 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : resources.length > 0 ? (
                                resources.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={`/${result.type.toLowerCase().replace(/ /g, '-')}/${result.slug}`}
                                        className="flex items-center gap-3 p-3 bg-[#032125] border border-[#084B54] rounded-xl hover:border-[#109EB1]/50 transition-colors cursor-pointer"
                                    >
                                        <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                                            <EntityAvatar
                                                src={result.iconUrl}
                                                name={result.title}
                                                variant="resource"
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-hebden font-semibold text-sm text-[#C7F4FA]">{result.title}</h4>
                                            <p className="font-nunito text-xs text-[#C7F4FA]/60">by {result.author}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-[#C7F4FA]/50">
                                            <Icon icon="mdi:download" className="w-3.5 h-3.5" />
                                            {result.downloads}
                                        </div>
                                        <span className="px-2 py-1 bg-[#109EB1]/20 rounded text-xs font-nunito text-[#109EB1]">
                                            {result.type}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Icon icon="mdi:magnify" className="w-12 h-12 text-[#C7F4FA]/20 mx-auto mb-2" />
                                    <p className="font-nunito text-sm text-[#C7F4FA]/50">
                                        {searchQuery ? 'No resources found' : 'Start searching to discover resources'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
