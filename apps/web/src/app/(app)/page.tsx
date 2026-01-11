import Image from 'next/image';
import type { Metadata } from 'next';
import styles from './page.module.css';
import { Rotater } from '@/components/home/Rotater';
import { ProjectShowcase } from '@/components/home/ProjectShowcase';
import { FreeForever } from '@/components/home/FreeForever';
import { BuiltForCreators } from '@/components/home/BuiltForCreators';
import { SmartDiscovery } from '@/components/home/SmartDiscovery';
import { HowDonationsWork } from '@/components/home/HowDonationsWork';
import { StayConnected } from '@/components/home/StayConnected';
import { ServerListingPreview } from '@/components/home/ServerListingPreview';
import { FoundingCommunity } from '@/components/home/FoundingCommunity';
import { HytaleDedicated } from '@/components/home/HytaleDedicated';
import { FinalCTA } from '@/components/home/FinalCTA';
import Link from "next/link";
import { fetchResources, ResourceSortOption, Resource } from '@/lib/api/resources';
import { fetchServers, Server } from '@/lib/api/servers';
import { MarketplaceItem } from '@/components/marketplace/MarketplaceCard';
import { formatRelativeTime } from '@/lib/utils/resourceConverters';

export const metadata: Metadata = {
    title: 'Home',
    description: 'Discover, create and connect with the best Hytale mods, worlds, plugins and servers. Join the Hytale community hub for players and creators.',
    openGraph: {
        title: 'Orbis - Your Hytale Modding & Server Hub',
        description: 'Discover, create and connect with the best Hytale mods, worlds, plugins and servers.',
        type: 'website',
        url: '/',
    },
    twitter: {
        title: 'Orbis - Your Hytale Modding & Server Hub',
        description: 'Discover, create and connect with the best Hytale mods, worlds, plugins and servers.',
    },
};

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

// Transform API resource to MarketplaceItem format
function transformResourceToMarketplaceItem(resource: Resource): MarketplaceItem {
    const owner = resource.ownerTeam || resource.ownerUser;
    const isTeam = !!resource.ownerTeam;

    return {
        id: resource.id,
        slug: resource.slug,
        title: resource.name,
        author: isTeam ? resource.ownerTeam?.slug || '' : resource.ownerUser?.username || '',
        authorDisplay: isTeam
            ? resource.ownerTeam?.displayName || resource.ownerTeam?.name || 'Unknown Team'
            : resource.ownerUser?.displayName || resource.ownerUser?.username || 'Unknown User',
        isOwnedByTeam: isTeam,
        description: resource.tagline || resource.description || '',
        image: resource.iconUrl || '',
        rating: 0, // Resources don't have ratings yet
        likes: formatCount(resource.likeCount || 0),
        downloads: formatCount(resource.downloadCount || 0),
        date: resource.createdAt,
        updatedAt: resource.updatedAt ? `Updated ${formatRelativeTime(resource.updatedAt)}` : undefined,
        tags: resource.tags?.map(t => t.tag.name) || [],
        categories: resource.categories?.map(c => c.category.name) || [],
        type: resource.type.replace(/_/g, ' ').split(' ').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join(' '),
    };
}

// Transform API server to component format
function transformServer(server: Server) {
    return {
        id: server.id,
        name: server.name,
        slug: server.slug,
        description: server.description || undefined,
        shortDesc: server.shortDesc || undefined,
        logoUrl: server.logoUrl || undefined,
        bannerUrl: server.bannerUrl || undefined,
        status: server.onlineStatus ? 'online' as const : 'offline' as const,
        currentPlayers: server.currentPlayers || 0,
        maxPlayers: server.maxPlayers || 0,
        voteCount: server.voteCount || 0,
        tags: server.tags?.map(t => t.tag.name) || [],
    };
}

// Fetch landing page data
async function getLandingPageData() {
    try {
        // Fetch resources and servers in parallel
        const [resourcesResponse, serversResponse] = await Promise.all([
            fetchResources({
                sortBy: ResourceSortOption.DOWNLOADS,
                limit: 14,
            }).catch(() => ({ data: [] as Resource[], meta: { total: 0, page: 1, limit: 14, totalPages: 0, hasNextPage: false, hasPreviousPage: false } })),
            fetchServers({
                limit: 3,
            }).catch(() => ({ data: [] as Server[], meta: { total: 0, page: 1, limit: 3, totalPages: 0, hasNextPage: false, hasPreviousPage: false } })),
        ]);

        // Transform resources for ProjectShowcase
        const showcaseResources = resourcesResponse.data.map(transformResourceToMarketplaceItem);

        // Transform servers for ServerListingPreview
        const previewServers = serversResponse.data.map(transformServer);

        // Get top 3 resources for SmartDiscovery preview
        const popularResources = resourcesResponse.data.slice(0, 3).map(resource => ({
            id: resource.id,
            slug: resource.slug,
            title: resource.name,
            author: resource.ownerTeam?.displayName || resource.ownerTeam?.name || resource.ownerUser?.displayName || resource.ownerUser?.username || 'Unknown',
            type: resource.type.replace(/_/g, ' ').split(' ').map(w =>
                w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            ).join(' '),
            downloads: formatCount(resource.downloadCount || 0),
            iconUrl: resource.iconUrl,
        }));

        return {
            showcaseResources,
            previewServers,
            popularResources,
        };
    } catch (error) {
        console.error('Error fetching landing page data:', error);
        return {
            showcaseResources: [],
            previewServers: [],
            popularResources: [],
        };
    }
}

export default async function Home() {
    const { showcaseResources, previewServers, popularResources } = await getLandingPageData();

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className="min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-80px)] pb-12 md:pb-28 flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-8 relative gap-8 md:gap-0">
                <div className="flex flex-col items-start gap-6 md:gap-[30px] w-full max-w-full md:max-w-[590px] md:ml-[151px] ml-0 mt-8 md:mt-0">
                    {/* Text Content */}
                    <div className="flex flex-col items-start gap-4 md:gap-[18px] w-full">
                        {/* Title Group */}
                        <div className="w-full">
                            <h1 className="font-hebden font-semibold text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] text-[#C7F4FA]">
                                Welcome to Orbis: Hytale&apos;s #1
                            </h1>
                            <Rotater
                                cellClassName="font-hebden font-semibold text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] text-[#15C8E0]"
                                className="text-3xl h-8 sm:h-[32px] md:h-12"
                                names={[
                                    'Server Listing',
                                    'Marketplace',
                                    'Community Hub',
                                ]}
                            />
                        </div>

                        {/* Subtitle */}
                        <p className="font-nunito text-base sm:text-lg leading-[24px] md:leading-[26px] text-[#C7F4FA] max-w-full md:max-w-[420px]">
                            Discover, Create and Connect with best mods, worlds, and servers.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-5 w-full sm:w-auto">
                        <Link
                            href="/login"
                            prefetch={false}
                            className="flex items-center justify-center px-[18px] py-[14px] md:py-[16px] gap-2.5 bg-[#109EB1] rounded-full w-full sm:w-auto sm:min-w-[158px] h-[48px] md:h-[52px] hover:bg-[#0d8a9b] transition-all cursor-pointer"
                        >
                            <span className="font-hebden font-semibold text-base md:text-[17px] leading-[20px] text-[#C7F4FA]">
                                Get Started
                            </span>
                        </Link>

                        <Link
                            href="/plugins"
                            prefetch={false}
                            className="flex items-center justify-center px-[18px] py-[14px] md:py-[16px] gap-2.5 bg-[rgba(152,234,245,0.25)] border-2 border-[rgba(152,234,245,0.25)] rounded-full w-full sm:w-auto sm:min-w-[198px] h-[48px] md:h-[52px] hover:bg-[rgba(152,234,245,0.35)] transition-all cursor-pointer"
                        >
                            <span className="font-hebden font-semibold text-base md:text-[17px] leading-[20px] text-[#C7F4FA]">
                                Browse Content
                            </span>
                        </Link>
                    </div>

                    {/* Platform Stats */}
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 pt-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#109EB1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="font-hebden font-semibold text-lg text-[#C7F4FA]">250+</span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/60">Resources</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#109EB1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-hebden font-semibold text-lg text-[#C7F4FA]">110+</span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/60">Creators</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#109EB1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="font-hebden font-semibold text-lg text-[#C7F4FA]">12K+</span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/60">Downloads</span>
                        </div>
                    </div>
                </div>

                {/* Floating Kweebec Image */}
                <div className="relative md:mr-[151px] mr-0 animate-float w-full md:w-auto flex justify-center md:block">
                    <Image
                        src="/kweebec.webp"
                        alt="Kweebec character"
                        width={300}
                        height={300}
                        style={{
                            transform: 'scaleX(-1)',
                            filter: 'drop-shadow(0 0 15px rgba(199, 244, 250, 0.3)) drop-shadow(0 0 30px rgba(21, 200, 224, 0.2))',
                        }}
                        className="object-contain drop-shadow-2xl md:w-[400px] md:h-[400px] w-[250px] h-[250px]"
                        priority
                    />
                </div>
            </section>

            {/* Section 2: Resource Showcase */}
            <ProjectShowcase resources={showcaseResources} />

            {/* Section 3: Free Forever */}
            <FreeForever />

            {/* Section 4: Built for Creators */}
            <BuiltForCreators />

            {/* Section 5: Smart Discovery */}
            <SmartDiscovery initialResources={popularResources} />

            {/* Section 6: How Donations Work */}
            <HowDonationsWork />

            {/* Section 7: Stay Connected */}
            <StayConnected />

            {/* Section 8: Server Listing Preview */}
            <ServerListingPreview initialServers={previewServers} />

            {/* Section 9: Founding Community */}
            <FoundingCommunity />

            {/* Section 10: 100% Hytale */}
            <HytaleDedicated />

            {/* Section 11: Final CTA */}
            <FinalCTA />
        </div>
    );
}