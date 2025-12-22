'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

export function LauncherHero() {
    return (
        <section className="relative -mt-[100px] overflow-hidden min-h-[600px] flex items-center">
            {/* Background */}
            <div className="absolute inset-0 bg-[#032125]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#109EB1]/10 via-[#032125] to-[#06363D]/30" />
                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(16, 158, 177, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16, 158, 177, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />
                {/* Bottom fade effect */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#032125] to-transparent" />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-40 right-[15%] w-96 h-96 bg-[#109EB1]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-[5%] w-64 h-64 bg-[#15C8E0]/5 rounded-full blur-2xl" />

            {/* Content */}
            <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between pt-[140px] pb-16 gap-12">
                <div className="max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#109EB1]/10 border border-[#109EB1]/20 text-[#109EB1] text-xs font-hebden tracking-wider">
                        <Icon icon="mdi:rocket-launch" className="text-sm" />
                        DESKTOP APPLICATION
                    </div>
                    <h1 className="font-hebden text-4xl md:text-5xl lg:text-6xl text-[#C7F4FA] leading-tight">
                        Orbis Launcher
                    </h1>
                    <p className="text-[#C7F4FA]/70 text-lg font-nunito leading-relaxed max-w-xl">
                        The ultimate companion for Hytale server management. Create, configure, and launch servers with ease. Browse Orbis content, manage mods, and monitor everything in real-time.
                    </p>

                    {/* Quick stats */}
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:server" className="w-5 h-5 text-[#109EB1]" />
                            <span className="font-hebden text-[#C7F4FA]">Multi-Server</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:package-variant" className="w-5 h-5 text-[#109EB1]" />
                            <span className="font-hebden text-[#C7F4FA]">One-Click Install</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:chart-line" className="w-5 h-5 text-[#109EB1]" />
                            <span className="font-hebden text-[#C7F4FA]">Real-Time Monitoring</span>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Link
                            href="#download"
                            className="px-8 py-4 bg-[#109EB1] hover:bg-[#0d8a9a] text-[#C7F4FA] font-hebden font-semibold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-[#109EB1]/30 hover:shadow-[#109EB1]/50 hover:scale-105"
                        >
                            <Icon icon="mdi:download" className="w-5 h-5" />
                            Download Now
                        </Link>
                        <Link
                            href="https://github.com/Orbis-place"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3.5 bg-[#06363D] border border-[#084B54] hover:border-[#109EB1] text-[#C7F4FA] font-hebden rounded-full transition-all flex items-center gap-2"
                        >
                            <Icon icon="mdi:github" className="w-5 h-5" />
                            View on GitHub
                        </Link>
                    </div>

                    {/* Platform badges */}
                    <div className="flex items-center gap-3 pt-2 text-[#C7F4FA]/50 text-sm font-nunito">
                        <span>Available for:</span>
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:microsoft-windows" className="w-5 h-5" />
                            <Icon icon="mdi:apple" className="w-5 h-5" />
                            <Icon icon="mdi:linux" className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Launcher Preview Mockup */}
                <div className="lg:w-[500px] relative">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-[#109EB1]/20 to-[#15C8E0]/10 rounded-[32px] blur-2xl opacity-60" />

                    {/* Mockup Window */}
                    <div className="relative bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden shadow-2xl">
                        {/* Title Bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#032125] border-b border-[#084B54]">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                            </div>
                            <span className="font-hebden text-sm text-[#C7F4FA]/60">Orbis Launcher</span>
                            <div className="w-16" />
                        </div>

                        {/* Sidebar + Content Preview */}
                        <div className="flex">
                            {/* Mini Sidebar */}
                            <div className="w-16 bg-[#032125] border-r border-[#084B54] p-2 space-y-2">
                                <div className="w-full aspect-square bg-[#109EB1] rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:home" className="w-5 h-5 text-[#C7F4FA]" />
                                </div>
                                <div className="w-full aspect-square bg-[#06363D] rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:server" className="w-5 h-5 text-[#C7F4FA]/60" />
                                </div>
                                <div className="w-full aspect-square bg-[#06363D] rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:magnify" className="w-5 h-5 text-[#C7F4FA]/60" />
                                </div>
                                <div className="w-full aspect-square bg-[#06363D] rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:folder" className="w-5 h-5 text-[#C7F4FA]/60" />
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-4 space-y-3">
                                {/* Server Card Preview */}
                                <div className="bg-[#032125] rounded-xl p-3 border border-[#084B54]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#109EB1]/20 rounded-lg flex items-center justify-center">
                                            <Icon icon="mdi:server" className="w-5 h-5 text-[#109EB1]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-hebden text-sm text-[#C7F4FA]">My Server</div>
                                            <div className="flex items-center gap-2 text-xs text-[#C7F4FA]/50">
                                                <span className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                                    Online
                                                </span>
                                                <span>12 players</span>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1 bg-[#109EB1] rounded-lg text-xs font-hebden text-[#C7F4FA]">
                                            Manage
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-[#032125] rounded-lg p-2 text-center border border-[#084B54]">
                                        <div className="font-hebden text-lg text-[#109EB1]">24%</div>
                                        <div className="text-[10px] text-[#C7F4FA]/50">CPU</div>
                                    </div>
                                    <div className="bg-[#032125] rounded-lg p-2 text-center border border-[#084B54]">
                                        <div className="font-hebden text-lg text-[#109EB1]">4.2GB</div>
                                        <div className="text-[10px] text-[#C7F4FA]/50">RAM</div>
                                    </div>
                                    <div className="bg-[#032125] rounded-lg p-2 text-center border border-[#084B54]">
                                        <div className="font-hebden text-lg text-[#109EB1]">99.9%</div>
                                        <div className="text-[10px] text-[#C7F4FA]/50">Uptime</div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-[#109EB1] rounded-lg text-xs font-hebden text-[#C7F4FA] flex items-center justify-center gap-1">
                                        <Icon icon="mdi:plus" className="w-4 h-4" />
                                        New Server
                                    </button>
                                    <button className="flex-1 py-2 bg-[#032125] border border-[#084B54] rounded-lg text-xs font-hebden text-[#C7F4FA] flex items-center justify-center gap-1">
                                        <Icon icon="mdi:download" className="w-4 h-4" />
                                        Browse Mods
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
