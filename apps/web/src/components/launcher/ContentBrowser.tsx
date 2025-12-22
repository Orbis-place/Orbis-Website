'use client';

import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:magnify',
        title: 'Browse Orbis Content',
        description: 'Access the entire Orbis library directly from the launcher. Mods, plugins, worlds — all at your fingertips.',
    },
    {
        icon: 'mdi:filter',
        title: 'Smart Search & Filters',
        description: 'Find exactly what you need with categories, popularity rankings, and version compatibility filters.',
    },
    {
        icon: 'mdi:download',
        title: 'One-Click Install',
        description: 'Select a mod, click install, done. Automatically added to your selected server.',
    },
    {
        icon: 'mdi:view-list',
        title: 'Installed Mods View',
        description: 'See all mods installed on each server. Enable, disable, or remove with a single click.',
    },
    {
        icon: 'mdi:sync',
        title: 'Auto Updates',
        description: 'Get notified when mods have updates. Update all with one click or review changes first.',
    },
    {
        icon: 'mdi:puzzle',
        title: 'Dependency Management',
        description: 'Required mods install automatically. No more hunting for dependencies or compatibility issues.',
    },
];

const mockMods = [
    { name: 'Enhanced Combat', author: 'ModMaster', downloads: '12.5K', icon: 'mdi:sword' },
    { name: 'Better Worlds', author: 'WorldBuilder', downloads: '8.2K', icon: 'mdi:earth' },
    { name: 'UI Overhaul', author: 'DesignPro', downloads: '15.1K', icon: 'mdi:palette' },
];

export function ContentBrowser() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#042a2f]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:package-variant" className="w-6 h-6 text-[#109EB1]" />
                    </div>
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                        Orbis Content Browser
                    </h2>
                </div>
                <p className="font-nunito text-lg text-[#C7F4FA]/70 max-w-2xl mb-12">
                    The entire Orbis marketplace integrated directly into your launcher. Browse, install, and manage content seamlessly.
                </p>

                {/* Two Column Layout - Reversed */}
                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
                    {/* Left: Browser Mockup */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden order-2 lg:order-1">
                        {/* Browser Header */}
                        <div className="px-4 py-3 bg-[#032125] border-b border-[#084B54]">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:magnify" className="w-5 h-5 text-[#C7F4FA]/50" />
                                <div className="flex-1 bg-[#06363D] rounded-lg px-4 py-2 text-sm text-[#C7F4FA]/50 border border-[#084B54]">
                                    Search mods, plugins, worlds...
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#084B54] overflow-x-auto">
                            <button className="px-3 py-1.5 bg-[#109EB1] rounded-lg text-xs font-hebden text-[#C7F4FA]">
                                All
                            </button>
                            <button className="px-3 py-1.5 bg-[#032125] rounded-lg text-xs font-hebden text-[#C7F4FA]/60 hover:text-[#C7F4FA]">
                                Mods
                            </button>
                            <button className="px-3 py-1.5 bg-[#032125] rounded-lg text-xs font-hebden text-[#C7F4FA]/60 hover:text-[#C7F4FA]">
                                Plugins
                            </button>
                            <button className="px-3 py-1.5 bg-[#032125] rounded-lg text-xs font-hebden text-[#C7F4FA]/60 hover:text-[#C7F4FA]">
                                Worlds
                            </button>
                            <button className="px-3 py-1.5 bg-[#032125] rounded-lg text-xs font-hebden text-[#C7F4FA]/60 hover:text-[#C7F4FA]">
                                Modpacks
                            </button>
                        </div>

                        {/* Mod List */}
                        <div className="p-4 space-y-3">
                            {mockMods.map((mod, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-[#032125] rounded-xl border border-[#084B54] hover:border-[#109EB1]/50 transition-colors">
                                    <div className="w-12 h-12 bg-[#109EB1]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon icon={mod.icon} className="w-6 h-6 text-[#109EB1]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-hebden text-sm text-[#C7F4FA] truncate">{mod.name}</h4>
                                        <p className="text-xs text-[#C7F4FA]/50">by {mod.author}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-[#C7F4FA]/40">
                                        <Icon icon="mdi:download" className="w-3 h-3" />
                                        {mod.downloads}
                                    </div>
                                    <button className="px-4 py-2 bg-[#109EB1] hover:bg-[#0d8a9a] rounded-lg text-xs font-hebden text-[#C7F4FA] transition-colors flex items-center gap-1">
                                        <Icon icon="mdi:plus" className="w-4 h-4" />
                                        Install
                                    </button>
                                </div>
                            ))}

                            {/* Loading more indicator */}
                            <div className="flex items-center justify-center py-4 text-[#C7F4FA]/40 text-sm">
                                <Icon icon="mdi:dots-horizontal" className="w-6 h-6 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Features List */}
                    <div className="space-y-4 order-1 lg:order-2">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex gap-4 p-4 rounded-xl hover:bg-[#06363D]/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon icon={feature.icon} className="w-6 h-6 text-[#109EB1]" />
                                </div>
                                <div>
                                    <h3 className="font-hebden font-semibold text-lg text-[#C7F4FA] mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="font-nunito text-sm text-[#C7F4FA]/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
