'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { EntityAvatar } from '@/components/EntityAvatar';
import { fetchServers, fetchServerCategories, ServerCategory, Server } from '@/lib/api/servers';

interface ServerData {
    id: string;
    name: string;
    slug: string;
    description?: string;
    shortDesc?: string;
    logoUrl?: string;
    bannerUrl?: string;
    status: 'online' | 'offline';
    currentPlayers: number;
    maxPlayers: number;
    voteCount: number;
    tags: string[];
}

interface ServerListingPreviewProps {
    initialServers?: ServerData[];
    initialCategories?: { id: string; name: string; slug: string }[];
}

// Transform API server to component format
function transformServer(server: Server): ServerData {
    return {
        id: server.id,
        name: server.name,
        slug: server.slug,
        description: server.description || undefined,
        shortDesc: server.shortDesc || undefined,
        logoUrl: server.logoUrl || undefined,
        bannerUrl: server.bannerUrl || undefined,
        status: server.onlineStatus ? 'online' : 'offline',
        currentPlayers: server.currentPlayers || 0,
        maxPlayers: server.maxPlayers || 0,
        voteCount: server.voteCount || 0,
        tags: server.tags?.map(t => t.tag.name) || [],
    };
}

export function ServerListingPreview({ initialServers = [], initialCategories = [] }: ServerListingPreviewProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [servers, setServers] = useState<ServerData[]>(initialServers);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch categories on mount if not provided
    useEffect(() => {
        if (initialCategories.length === 0) {
            fetchServerCategories()
                .then((cats) => {
                    setCategories(cats.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
                })
                .catch(console.error);
        }
    }, [initialCategories.length]);

    // Fetch servers when category changes
    useEffect(() => {
        const loadServers = async () => {
            setIsLoading(true);
            try {
                const response = await fetchServers({
                    category: selectedCategory || undefined,
                    limit: 3,
                });
                setServers(response.data.map(transformServer));
            } catch (error) {
                console.error('Failed to fetch servers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadServers();
    }, [selectedCategory]);

    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#042a2f]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Find Your Server
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Discover the perfect Hytale server for your playstyle. Survival, PvP, Roleplay, Creative — your adventure awaits.
                    </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full font-nunito text-sm transition-colors ${selectedCategory === null
                            ? 'bg-[#109EB1] text-[#C7F4FA]'
                            : 'bg-[#06363D] border border-[#084B54] text-[#C7F4FA]/70 hover:border-[#109EB1]'
                            }`}
                    >
                        All
                    </button>
                    {categories.slice(0, 6).map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.slug)}
                            className={`px-4 py-2 rounded-full font-nunito text-sm transition-colors ${selectedCategory === category.slug
                                ? 'bg-[#109EB1] text-[#C7F4FA]'
                                : 'bg-[#06363D] border border-[#084B54] text-[#C7F4FA]/70 hover:border-[#109EB1]'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Server Cards Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-28 bg-[#109EB1]/10" />
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-[#109EB1]/10 rounded w-3/4" />
                                    <div className="h-4 bg-[#109EB1]/10 rounded w-full" />
                                    <div className="h-4 bg-[#109EB1]/10 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : servers.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        {servers.map((server) => (
                            <Link
                                key={server.id}
                                href={`/servers/${server.slug}`}
                                className="bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden hover:border-[#109EB1]/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Banner */}
                                <div className="h-28 bg-gradient-to-br from-[#109EB1]/30 to-[#032125] relative">
                                    {server.bannerUrl && (
                                        <img
                                            src={server.bannerUrl}
                                            alt={`${server.name} banner`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute bottom-3 left-3 w-12 h-12 bg-[#06363D] border-2 border-[#084B54] rounded-xl overflow-hidden">
                                        <EntityAvatar
                                            src={server.logoUrl}
                                            name={server.name}
                                            variant="server"
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-hebden font-semibold text-lg text-[#C7F4FA] mb-1">
                                        {server.name}
                                    </h3>
                                    <p className="font-nunito text-sm text-[#C7F4FA]/60 mb-4 line-clamp-2">
                                        {server.shortDesc || server.description}
                                    </p>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 mb-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-[#10b981] animate-pulse' : 'bg-[#C7F4FA]/30'}`}></span>
                                            <span className="font-nunito text-[#C7F4FA]/70">
                                                {server.status === 'online' ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon ssr={true} icon="mdi:account-group" className="w-4 h-4 text-[#C7F4FA]/50" />
                                            <span className="font-nunito text-[#C7F4FA]/70">
                                                {server.currentPlayers}/{server.maxPlayers}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon ssr={true} icon="mdi:thumb-up" className="w-4 h-4 text-[#109EB1]" />
                                            <span className="font-nunito text-[#C7F4FA]/70">{server.voteCount}</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {server.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 bg-[#032125] rounded-full text-xs font-nunito text-[#C7F4FA]/60"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 mb-10">
                        <Icon ssr={true} icon="mdi:server-off" className="w-16 h-16 text-[#C7F4FA]/30 mx-auto mb-4" />
                        <p className="font-nunito text-lg text-[#C7F4FA]/60">
                            No servers available yet. Be the first to add yours!
                        </p>
                    </div>
                )}

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/servers"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] rounded-full font-hebden font-semibold text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                    >
                        Browse All Servers
                        <Icon ssr={true} icon="mdi:arrow-right" className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
