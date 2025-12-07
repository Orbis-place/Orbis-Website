'use client';

import { Search, Bell, Clock, Heart } from 'lucide-react';

export function FeatureBlobs() {
    return (
        <div className="w-full">
            {/* Feature 1: Search - Slightly lighter background */}
            <div className="w-full py-20 px-4 bg-[#042a2f]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-5">
                            <h3 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                                Find your next favorite
                            </h3>
                            <p className="font-nunito text-lg text-[#C7F4FA]/80 leading-relaxed">
                                Our intelligent search guides you to creations that match your style. Filter by category, popularity, or let yourself be surprised by community gems.
                            </p>
                        </div>

                        <div className="relative bg-gradient-to-br from-[#109EB1]/30 to-[#15C8E0]/20 p-[2px] rounded-[25px]">
                            <div className="bg-[#06363D] rounded-[25px] p-6 space-y-4">
                                {/* Search Bar */}
                                <div className="flex items-center gap-3 bg-[#032125] border border-[#084B54] rounded-full px-4 py-3">
                                    <Search className="w-5 h-5 text-[#C7F4FA]/50" />
                                    <input
                                        type="text"
                                        value="magic"
                                        readOnly
                                        className="bg-transparent font-nunito text-[#C7F4FA] outline-none w-full"
                                    />
                                </div>

                                {/* Sort */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-nunito text-[#C7F4FA]/70">Sort by</span>
                                    <div className="px-3 py-1.5 bg-[#032125] border border-[#084B54] rounded-lg">
                                        <span className="font-hebden text-[#C7F4FA]">Relevance</span>
                                    </div>
                                </div>

                                {/* Mock Results */}
                                <div className="space-y-2">
                                    {['Magic System', 'Arcane Spells', 'Wizard Tools'].map((title, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-[#032125]/50 border border-[#084B54] rounded-[15px] hover:border-[#109EB1]/50 transition-colors">
                                            <div className="w-12 h-12 bg-[#109EB1]/30 rounded-lg" />
                                            <div>
                                                <h4 className="font-hebden font-semibold text-sm text-[#C7F4FA]">{title}</h4>
                                                <p className="font-nunito text-xs text-[#C7F4FA]/60">by MagicMaster</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 2: Notifications - Back to base color */}
            <div className="w-full py-20 px-4 bg-[#032125]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="md:order-2 space-y-5">
                            <h3 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                                Stay connected to your favorite creators
                            </h3>
                            <p className="font-nunito text-lg text-[#C7F4FA]/80 leading-relaxed">
                                Be the first to know about updates. Follow your favorite projects and build your personal collection of Hytale content.
                            </p>
                        </div>

                        <div className="md:order-1 relative bg-gradient-to-br from-[#109EB1]/30 to-[#15C8E0]/20 p-[2px] rounded-[25px]">
                            <div className="bg-[#06363D] rounded-[25px] p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-hebden font-bold text-xl text-[#C7F4FA]">Notifications</h3>
                                    <Bell className="w-5 h-5 text-[#109EB1]" />
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { title: 'Epic Dungeons', update: 'Version 2.0 available!', time: 'yesterday' },
                                        { title: 'Magic System', update: 'New spell added', time: '2 days ago' },
                                        { title: 'Enhanced UI', update: 'Bug fixes', time: '3 days ago' }
                                    ].map((notif, i) => (
                                        <div key={i} className="flex gap-3 p-3 bg-[#032125]/50 border border-[#084B54] rounded-[15px] hover:border-[#109EB1]/50 transition-colors">
                                            <div className="w-12 h-12 bg-[#109EB1]/30 rounded-lg flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-hebden font-semibold text-sm text-[#C7F4FA]">
                                                    {notif.title} has been updated!
                                                </h4>
                                                <p className="font-nunito text-xs text-[#C7F4FA]/70">
                                                    {notif.update}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Clock className="w-3 h-3 text-[#C7F4FA]/50" />
                                                    <span className="font-nunito text-xs text-[#C7F4FA]/50">
                                                        Received {notif.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 3: Platform - Slightly lighter again */}
            <div className="w-full py-20 px-4 bg-[#042a2f]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-5">
                            <h3 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                                100% dedicated to Hytale
                            </h3>
                            <p className="font-nunito text-lg text-[#C7F4FA]/80 leading-relaxed">
                                Orbis was born from passion for Hytale. Every feature is designed for the players and creators of this unique community. No compromises, just the essentials.
                            </p>
                        </div>

                        <div className="relative bg-gradient-to-br from-[#109EB1]/30 to-[#15C8E0]/20 p-[2px] rounded-[25px]">
                            <div className="bg-[#06363D] rounded-[25px] p-8 text-center">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-[#109EB1]/30 rounded-2xl mb-4">
                                    <Heart className="w-14 h-14 text-[#C7F4FA]" />
                                </div>
                                <h4 className="font-hebden font-bold text-2xl text-[#C7F4FA] mb-2">
                                    Hytale Compatible
                                </h4>
                                <p className="font-nunito text-[#C7F4FA]/70 mb-6">
                                    All content is verified and optimized for Hytale
                                </p>

                                <div className="flex flex-wrap justify-center gap-3">
                                    {['Mods', 'Modpacks', 'Worlds', 'Plugins', 'Asset Packs', 'Prefab', 'Data Packs', 'Tools & Scripts'].map((cat) => (
                                        <span
                                            key={cat}
                                            className="px-4 py-2 bg-[#109EB1]/20 border border-[#109EB1] rounded-full font-hebden text-sm text-[#C7F4FA] hover:bg-[#109EB1]/30 transition-colors"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

