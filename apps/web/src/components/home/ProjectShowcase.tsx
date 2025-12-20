'use client';

import Link from 'next/link';
import MarketplaceCard, { MarketplaceItem } from '@/components/marketplace/MarketplaceCard';

interface ProjectShowcaseProps {
    resources?: MarketplaceItem[];
}

export function ProjectShowcase({ resources = [] }: ProjectShowcaseProps) {
    // Duplicate the array for seamless infinite scroll
    const doubledProjects = [...resources, ...resources];

    // If no resources provided, show placeholder
    if (resources.length === 0) {
        return (
            <div className="w-full overflow-hidden relative py-16 bg-[#032125]">
                <div className="text-center mb-10 px-4">
                    <div className="inline-block px-4 py-2 bg-[#109EB1]/20 border border-[#109EB1] rounded-full mb-4">
                        <span className="font-hebden font-semibold text-sm text-[#C7F4FA]">By the community, for the community</span>
                    </div>
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA] mb-4">
                        Creations with heart
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto mb-6">
                        Explore projects from passionate players like you. Each mod, each world tells a unique story.
                    </p>
                    <Link
                        href="/resources"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] rounded-full font-hebden font-semibold text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                    >
                        Browse All Resources
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
                <p className="text-center font-nunito text-[#C7F4FA]/50">
                    Be the first to create and share your projects!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden relative py-16 bg-[#032125]">
            {/* Section Header */}
            <div className="text-center mb-10 px-4">
                <div className="inline-block px-4 py-2 bg-[#109EB1]/20 border border-[#109EB1] rounded-full mb-4">
                    <span className="font-hebden font-semibold text-sm text-[#C7F4FA]">By the community, for the community</span>
                </div>
                <h2 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA] mb-4">
                    Creations with heart
                </h2>
                <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto mb-6">
                    Explore projects from passionate players like you. Each mod, each world tells a unique story.
                </p>
                <Link
                    href="/resources"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#109EB1] rounded-full font-hebden font-semibold text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                >
                    Browse All Resources
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>

            {/* Scrolling Rows */}
            <div className="flex flex-col gap-4">
                {/* First Row */}
                <div className="flex animate-scroll-left">
                    {doubledProjects.map((project, index) => (
                        <Link
                            key={`row1-${index}`}
                            href={`/${project.type?.toLowerCase().replace(/ /g, '-')}/${project.slug}`}
                            className="flex-shrink-0 w-[500px] px-2"
                        >
                            <MarketplaceCard item={project} viewMode="grid" />
                        </Link>
                    ))}
                </div>

                {/* Second Row - scrolling right */}
                <div className="flex animate-scroll-right">
                    {doubledProjects.map((project, index) => (
                        <Link
                            key={`row2-${index}`}
                            href={`/${project.type?.toLowerCase().replace(/ /g, '-')}/${project.slug}`}
                            className="flex-shrink-0 w-[500px] px-2"
                        >
                            <MarketplaceCard item={project} viewMode="grid" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Gradient Fade on edges */}
            <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#032125] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#032125] to-transparent pointer-events-none" />
        </div>
    );
}

