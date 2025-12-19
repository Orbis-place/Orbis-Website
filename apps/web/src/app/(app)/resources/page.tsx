import type { Metadata } from 'next';
import { Icon } from '@iconify/react';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import ScrollableSection from '@/components/resources/ScrollableSection';
import ThemeOfMonthSection from '@/components/resources/ThemeOfMonthSection';
import Link from 'next/link';
import {
    fetchSelectionOfWeek,
    fetchHiddenGems,
    fetchStarterPack,
    fetchThemeOfMonth,
    fetchMostDownloaded
} from '@/lib/api/discovery';
import { convertResourceToMarketplaceItem } from '@/lib/utils/resourceConverters';
import { MarketplaceItem } from '@/components/marketplace/MarketplaceCard';

export const metadata: Metadata = {
    title: 'Discover Resources',
    description: 'Discover mods, plugins, worlds and more created by the Hytale community on Orbis.',
};

export default async function ResourcesPage() {
    // Fetch all collections from the API with error handling
    let selectionOfWeek: MarketplaceItem | null = null;
    let hiddenGems: MarketplaceItem[] = [];
    let starterPack: MarketplaceItem[] = [];
    let themeOfMonth: { collection: any; resources: MarketplaceItem[] } | null = null;
    let mostDownloaded: MarketplaceItem[] = [];

    try {
        const selectionData = await fetchSelectionOfWeek();
        if (selectionData.resources && selectionData.resources.length > 0) {
            selectionOfWeek = convertResourceToMarketplaceItem(selectionData.resources[0]!);
        }
    } catch (error) {
        console.error('Failed to fetch Selection of the Week:', error);
    }

    try {
        const hiddenGemsData = await fetchHiddenGems();
        hiddenGems = hiddenGemsData.resources.map(convertResourceToMarketplaceItem);
    } catch (error) {
        console.error('Failed to fetch Hidden Gems:', error);
    }

    try {
        const starterPackData = await fetchStarterPack();
        starterPack = starterPackData.resources.map(convertResourceToMarketplaceItem);
    } catch (error) {
        console.error('Failed to fetch Starter Pack:', error);
    }

    try {
        const themeData = await fetchThemeOfMonth();
        themeOfMonth = {
            collection: themeData.collection,
            resources: themeData.resources.map(convertResourceToMarketplaceItem)
        };
    } catch (error) {
        console.error('Failed to fetch Theme of the Month:', error);
    }

    try {
        const mostDownloadedData = await fetchMostDownloaded(4);
        mostDownloaded = mostDownloadedData.resources.map(convertResourceToMarketplaceItem);
    } catch (error) {
        console.error('Failed to fetch Most Downloaded:', error);
    }

    // If no Selection of the Week, don't render that section
    if (!selectionOfWeek) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <p className="text-[#C7F4FA]/70 text-center">
                    No featured content available at this time. Please check back later.
                </p>
            </div>
        );
    }

    const featuredResource = selectionOfWeek;

    return (
        <div className="space-y-16">
            {/* Selection of the Week - Full width banner that extends behind navbar */}
            <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-[100px] overflow-hidden min-h-[600px]">
                {/* Background Image - using banner */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale"
                    style={{
                        backgroundImage: `url(${(featuredResource as any).banner || featuredResource.image})`,

                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#032125] via-[#032125]/85 to-[#032125]/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#032125] via-transparent to-[#032125]/70" />

                {/* Decorative elements */}
                <div className="absolute top-20 right-[20%] w-64 h-64 bg-[#109EB1]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-[10%] w-48 h-48 bg-[#15C8E0]/5 rounded-full blur-2xl" />

                <div className="relative max-w-[1400px] mx-auto px-6 sm:px-6 lg:px-8 pt-[140px] pb-16 md:pt-[160px] md:pb-20">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                        {/* Left: Text Content */}
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#109EB1] text-[#032125] text-xs font-hebden tracking-wider shadow-lg shadow-[#109EB1]/30">
                                <Icon icon="mdi:star" className="text-sm" />
                                SELECTION OF THE WEEK
                            </div>

                            <div>
                                <p className="text-sm text-[#109EB1] font-hebden mb-2 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-[#109EB1]/20 rounded-md">{featuredResource.type}</span>
                                    <span className="text-[#C7F4FA]/50">by</span>
                                    <span className="text-[#C7F4FA]">{featuredResource.authorDisplay}</span>
                                </p>
                                <h1 className="font-hebden text-4xl md:text-5xl lg:text-6xl text-[#C7F4FA] leading-tight mb-4">
                                    {featuredResource.title}
                                </h1>
                                <p className="text-[#C7F4FA]/70 text-base md:text-lg max-w-xl font-nunito leading-relaxed">
                                    {featuredResource.description}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                                <span className="flex items-center gap-2 px-3 py-1.5 bg-[#06363D]/60 border border-[#084B54] rounded-full">
                                    <Icon icon="mdi:download" className="w-4 h-4 text-[#109EB1]" />
                                    <span className="font-hebden text-[#C7F4FA]">{featuredResource.downloads}</span>
                                    <span className="text-[#C7F4FA]/50 hidden sm:inline">downloads</span>
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1.5 bg-[#06363D]/60 border border-[#084B54] rounded-full">
                                    <Icon icon="mdi:heart" className="w-4 h-4 text-[#109EB1]" />
                                    <span className="font-hebden text-[#C7F4FA]">{featuredResource.likes}</span>
                                    <span className="text-[#C7F4FA]/50 hidden sm:inline">likes</span>
                                </span>
                                {featuredResource.updatedAt && (
                                    <span className="flex items-center gap-2 text-[#C7F4FA]/50">
                                        <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                                        {featuredResource.updatedAt}
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {featuredResource.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-[#C7F4FA]/5 border border-[#C7F4FA]/10 text-[#C7F4FA]/70 text-xs font-nunito hover:border-[#109EB1]/50 hover:text-[#C7F4FA] transition-colors cursor-pointer">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-4 pt-4">
                                <Link
                                    href={`/${featuredResource.type.toLowerCase()}/${featuredResource.slug}`}
                                    className="px-8 py-3.5 bg-[#109EB1] hover:bg-[#0d8a9a] text-[#C7F4FA] font-hebden rounded-full transition-all flex items-center gap-2 shadow-lg shadow-[#109EB1]/30 hover:shadow-[#109EB1]/50 hover:scale-105"
                                >
                                    Discover this {featuredResource.type?.toLowerCase()} <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: Resource Preview Card with Logo + Banner */}
                        <div className="lg:w-[400px] relative">
                            {/* Glow effect behind */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-[#109EB1]/20 to-[#15C8E0]/10 rounded-[32px] blur-xl opacity-60" />

                            {/* Card */}
                            <Link href={`/${featuredResource.type?.toLowerCase()}/${featuredResource.slug}`} className="relative block">
                                <div className="relative rounded-[24px] overflow-hidden border-2 border-[#109EB1]/30 shadow-2xl bg-[#032125]">
                                    {/* Banner Image */}
                                    <div className="aspect-video w-full relative">
                                        <img
                                            src={(featuredResource as any).banner || featuredResource.image}
                                            alt={featuredResource.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#032125] via-[#032125]/20 to-transparent" />
                                    </div>

                                    {/* Logo + Info overlay at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
                                        {/* Logo */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#109EB1]/50 shadow-lg flex-shrink-0">
                                            <img
                                                src={featuredResource.image}
                                                alt={`${featuredResource.title} logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Title */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-hebden text-lg text-[#C7F4FA] truncate">{featuredResource.title}</h3>
                                            <p className="text-xs text-[#C7F4FA]/60">by {featuredResource.authorDisplay}</p>
                                        </div>
                                    </div>

                                    {/* Type badge */}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#032125]/80 backdrop-blur-md rounded-full border border-[#084B54]">
                                        <span className="text-xs font-hebden text-[#C7F4FA]">{featuredResource.type}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content with max-width */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Hidden Gems Section */}
                {hiddenGems.length > 0 && (
                    <ScrollableSection title="Hidden Gems" iconName="sparkles" link="/mods">
                        {hiddenGems.map((item: MarketplaceItem) => (
                            <div key={item.id} className="min-w-[360px] sm:min-w-[420px]">
                                <Link href={`/${item.type?.toLowerCase() || 'mods'}/${item.slug}`} className="block">
                                    <MarketplaceCard item={item} viewMode="grid" />
                                </Link>
                            </div>
                        ))}
                    </ScrollableSection>
                )}

                {/* Starter Pack Section */}
                {starterPack.length > 0 && (
                    <ScrollableSection title="Starter Pack: Essentials" iconName="package" link="/modpacks">
                        {starterPack.map((item: MarketplaceItem) => (
                            <div key={item.id} className="min-w-[360px] sm:w-[420px]">
                                <Link href={`/${item.type?.toLowerCase() || 'mods'}/${item.slug}`} className="block">
                                    <MarketplaceCard item={item} viewMode="grid" />
                                </Link>
                            </div>
                        ))}
                    </ScrollableSection>
                )}

                {/* Theme of the Month Section - Full width banner */}
                {themeOfMonth && themeOfMonth.resources.length > 0 && (
                    <ThemeOfMonthSection themeOfMonth={themeOfMonth} />
                )}

                {/* Most Downloaded Section */}
                {mostDownloaded.length > 0 && (
                    <ScrollableSection title="Most Downloaded This Week" iconName="download" link="/mods">
                        {mostDownloaded.map((item: MarketplaceItem) => (
                            <div key={item.id} className="min-w-[360px] sm:min-w-[420px]">
                                <Link href={`/${item.type?.toLowerCase() || 'mods'}/${item.slug}`} className="block">
                                    <MarketplaceCard item={item} viewMode="grid" />
                                </Link>
                            </div>
                        ))}
                    </ScrollableSection>
                )}

                {/* Call to Action */}
                <section className="flex flex-col items-center justify-center text-center py-16 bg-gradient-to-b from-transparent to-[#06363D]/20 rounded-[32px]">
                    <div className="p-4 rounded-full bg-[#109EB1]/10 border border-[#109EB1]/20 mb-6">
                        <Icon icon="mdi:compass" className="w-8 h-8 text-[#109EB1]" />
                    </div>
                    <h2 className="font-hebden text-3xl text-[#C7F4FA] mb-4">Explore the Full Marketplace</h2>
                    <p className="text-[#C7F4FA]/60 max-w-lg mb-8">
                        Dive into thousands of mods, plugins, and worlds created by the community.
                    </p>
                    <Link
                        href="/mods"
                        className="px-8 py-3 bg-[#109EB1] hover:bg-[#0d8a9a] text-[#C7F4FA] font-hebden rounded-full transition-all transform hover:scale-105 shadow-lg shadow-[#109EB1]/20"
                    >
                        BROWSE EVERYTHING
                    </Link>
                </section>
            </div>
        </div>
    );
}
