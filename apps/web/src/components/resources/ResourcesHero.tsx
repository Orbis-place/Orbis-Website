'use client';

import Link from 'next/link';
import { ArrowRight, Star, Download, Heart } from 'lucide-react';
import { Creator } from '../creators/mockData';
import { MarketplaceItem } from '../marketplace/MarketplaceCard';

interface ResourcesHeroProps {
    title: string;
    description: string;
    featuredResource: MarketplaceItem;
    featuredCreator: Creator;
}

export default function ResourcesHero({ title, description, featuredResource, featuredCreator }: ResourcesHeroProps) {
    return (
        <div className="relative w-full overflow-hidden rounded-[24px] border border-[#084B54] bg-[#06363D]">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54]/50 to-[#109EB1]/20" />

            {/* Content Container */}
            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">

                {/* Left Side: Text & Creator */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#109EB1]/20 border border-[#109EB1]/30 text-[#109EB1] text-[10px] font-hebden tracking-wider">
                            <Star className="w-3 h-3 fill-current" />
                            SELECTION OF THE WEEK
                        </div>
                        <h1 className="font-hebden text-3xl md:text-4xl text-[#C7F4FA] leading-tight">
                            {title}
                        </h1>
                        <p className="text-[#C7F4FA]/70 text-base max-w-lg font-nunito">
                            {description}
                        </p>
                    </div>

                    {/* Featured Creator Mini-Card */}
                    <div className="bg-[#032125]/50 backdrop-blur-sm border border-[#084B54] rounded-[16px] p-3 max-w-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-hebden text-[#109EB1] tracking-wider">FEATURED CREATOR</span>
                            <Link href={`/users/${featuredCreator.username}`} className="text-[10px] text-[#C7F4FA]/50 hover:text-[#C7F4FA] transition-colors flex items-center gap-1">
                                View Profile <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#109EB1]">
                                {featuredCreator.image ? (
                                    <img src={featuredCreator.image} alt={featuredCreator.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#084B54] flex items-center justify-center text-[#C7F4FA] font-hebden text-sm">
                                        {featuredCreator.displayName[0]}
                                    </div>
                                )}
                                {featuredCreator.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#032125]" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-hebden text-[#C7F4FA] text-base">{featuredCreator.displayName}</h3>
                                <p className="text-[#C7F4FA]/50 text-[10px]">@{featuredCreator.username}</p>
                            </div>
                            <button className="ml-auto px-3 py-1 bg-[#109EB1] hover:bg-[#0d8a9a] text-[#C7F4FA] text-[10px] font-hebden rounded-full transition-colors">
                                FOLLOW
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Featured Resource Card */}
                <div className="flex-1 w-full max-w-sm">
                    <Link href={`/resources/${featuredResource.slug}`} className="block group">
                        <div className="bg-[#032125] border border-[#084B54] rounded-[20px] overflow-hidden hover:border-[#109EB1] transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
                            {/* Image */}
                            <div className="relative aspect-video w-full overflow-hidden">
                                <img
                                    src={featuredResource.image}
                                    alt={featuredResource.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#032125]/80 backdrop-blur-md rounded-full border border-[#084B54]">
                                    <span className="text-[10px] font-hebden text-[#C7F4FA]">{featuredResource.type}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-hebden text-xl text-[#C7F4FA] mb-0.5 group-hover:text-[#109EB1] transition-colors">
                                        {featuredResource.title}
                                    </h3>
                                    <p className="text-[#C7F4FA]/50 text-xs">by {featuredResource.authorDisplay}</p>
                                </div>

                                <p className="text-[#C7F4FA]/70 text-xs line-clamp-2">
                                    {featuredResource.description}
                                </p>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {featuredResource.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded-md bg-[#109EB1]/10 border border-[#109EB1]/20 text-[#109EB1] text-[10px]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-3 border-t border-[#084B54] flex items-center justify-between text-[#C7F4FA]/50 text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Download className="w-3.5 h-3.5" />
                                            {featuredResource.downloads}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5" />
                                            {featuredResource.likes}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[#109EB1]">
                                        View Details <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
