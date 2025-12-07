'use client';

import MarketplaceCard, { MarketplaceItem } from '@/components/marketplace/MarketplaceCard';

// Mock data for demonstration
const sampleProjects: MarketplaceItem[] = [
    {
        id: 1,
        title: 'Epic Dungeons',
        author: 'BuilderPro',
        authorDisplay: 'BuilderPro',
        description: 'Explore challenging dungeons filled with unique mobs, treasures, and epic boss fights.',
        image: '/kweebec.webp',
        rating: 4.8,
        likes: '2.5K',
        downloads: '125K',
        date: '2024-01-15',
        updatedAt: 'Updated 2 weeks ago',
        tags: ['Adventure', 'PvE', 'Exploration'],
        categories: ['World'],
        type: 'World'
    },
    {
        id: 2,
        title: 'Enhanced UI',
        author: 'UIDesigner',
        authorDisplay: 'UIDesigner',
        description: 'A complete UI overhaul with modern design and improved user experience.',
        image: '/kweebec.webp',
        rating: 4.9,
        likes: '5.2K',
        downloads: '250K',
        date: '2024-02-01',
        updatedAt: 'Updated 1 week ago',
        tags: ['Interface', 'Quality of Life'],
        categories: ['Mod'],
        type: 'Mod'
    },
    {
        id: 3,
        title: 'Magic System',
        author: 'MagicMaster',
        authorDisplay: 'MagicMaster',
        description: 'Adds a comprehensive magic system with spells, wands, and magical creatures.',
        image: '/kweebec.webp',
        rating: 4.7,
        likes: '3.8K',
        downloads: '180K',
        date: '2024-01-20',
        updatedAt: 'Updated 3 days ago',
        tags: ['Magic', 'Combat', 'RPG'],
        categories: ['Mod'],
        type: 'Mod'
    },
    {
        id: 4,
        title: 'Farming Plus',
        author: 'FarmLife',
        authorDisplay: 'FarmLife',
        description: 'Expand your farming experience with new crops, animals, and farming tools.',
        image: '/kweebec.webp',
        rating: 4.6,
        likes: '1.9K',
        downloads: '95K',
        date: '2024-02-10',
        updatedAt: 'Updated yesterday',
        tags: ['Farming', 'Economy'],
        categories: ['Plugin'],
        type: 'Plugin'
    },
    {
        id: 5,
        title: 'Medieval Towns',
        author: 'CityBuilder',
        authorDisplay: 'CityBuilder',
        description: 'Beautiful medieval town generation with castles, markets, and NPCs.',
        image: '/kweebec.webp',
        rating: 4.9,
        likes: '4.1K',
        downloads: '200K',
        date: '2024-01-05',
        updatedAt: 'Updated 5 days ago',
        tags: ['Building', 'Generation'],
        categories: ['World'],
        type: 'World'
    },
    {
        id: 6,
        title: 'Performance Boost',
        author: 'OptimizePro',
        authorDisplay: 'OptimizePro',
        description: 'Optimize your game performance with advanced rendering techniques.',
        image: '/kweebec.webp',
        rating: 4.8,
        likes: '6.5K',
        downloads: '320K',
        date: '2024-02-15',
        updatedAt: 'Updated today',
        tags: ['Optimization', 'Performance'],
        categories: ['Mod'],
        type: 'Mod'
    },
    {
        id: 7,
        title: 'Creatures Expanded',
        author: 'BeastMaster',
        authorDisplay: 'BeastMaster',
        description: 'Add over 100 new creatures to your world with unique behaviors and drops.',
        image: '/kweebec.webp',
        rating: 4.7,
        likes: '3.2K',
        downloads: '150K',
        date: '2024-01-25',
        updatedAt: 'Updated 1 week ago',
        tags: ['Mobs', 'Animals', 'Content'],
        categories: ['Mod'],
        type: 'Mod'
    }
];

export function ProjectShowcase() {
    // Duplicate the array for seamless infinite scroll
    const doubledProjects = [...sampleProjects, ...sampleProjects];

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
                <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                    Explore projects from passionate players like you. Each mod, each world tells a unique story.
                </p>
            </div>

            {/* Scrolling Rows */}
            <div className="flex flex-col gap-4">
                {/* First Row */}
                <div className="flex animate-scroll-left">
                    {doubledProjects.map((project, index) => (
                        <div key={`row1-${index}`} className="flex-shrink-0 w-[500px] px-2">
                            <MarketplaceCard item={project} viewMode="grid" />
                        </div>
                    ))}
                </div>

                {/* Second Row - scrolling right */}
                <div className="flex animate-scroll-right">
                    {doubledProjects.map((project, index) => (
                        <div key={`row2-${index}`} className="flex-shrink-0 w-[500px] px-2">
                            <MarketplaceCard item={project} viewMode="grid" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Gradient Fade on edges */}
            <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#032125] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#032125] to-transparent pointer-events-none" />
        </div>
    );
}

