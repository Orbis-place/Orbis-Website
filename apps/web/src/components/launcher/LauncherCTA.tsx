'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

export function LauncherCTA() {
    return (
        <section id="download" className="w-full py-24 px-4 md:px-8 bg-[#032125] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#109EB1]/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative">
                {/* Icon */}
                <div className="w-20 h-20 bg-[#109EB1]/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <Icon icon="mdi:rocket-launch" className="w-10 h-10 text-[#109EB1]" />
                </div>

                {/* Title */}
                <h2 className="font-hebden font-bold text-4xl md:text-5xl text-[#C7F4FA] mb-6">
                    Ready to Launch?
                </h2>

                <p className="font-nunito text-lg text-[#C7F4FA]/70 max-w-2xl mx-auto mb-10">
                    Download the Orbis Launcher and take full control of your Hytale servers.
                    Free, open-source, and powered by the community.
                </p>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-8 py-4 bg-[#109EB1] hover:bg-[#0d8a9a] text-[#C7F4FA] font-hebden font-semibold rounded-full transition-all shadow-lg shadow-[#109EB1]/30 hover:shadow-[#109EB1]/50 hover:scale-105 min-w-[220px] justify-center"
                    >
                        <Icon icon="mdi:microsoft-windows" className="w-6 h-6" />
                        Download for Windows
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-8 py-4 bg-[#06363D] border border-[#084B54] hover:border-[#109EB1] text-[#C7F4FA] font-hebden font-semibold rounded-full transition-all min-w-[220px] justify-center"
                    >
                        <Icon icon="mdi:apple" className="w-6 h-6" />
                        Download for macOS
                    </Link>
                </div>

                {/* Linux Option */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-[#C7F4FA]/60 hover:text-[#109EB1] transition-colors text-sm font-nunito"
                    >
                        <Icon icon="mdi:linux" className="w-5 h-5" />
                        Linux (.AppImage)
                    </Link>
                    <span className="text-[#C7F4FA]/30">|</span>
                    <Link
                        href="https://github.com/Orbis-place"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#C7F4FA]/60 hover:text-[#109EB1] transition-colors text-sm font-nunito"
                    >
                        <Icon icon="mdi:github" className="w-5 h-5" />
                        View Source Code
                    </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-8 pt-8 border-t border-[#084B54]">
                    <div className="text-center">
                        <div className="font-hebden text-2xl text-[#109EB1]">v1.0</div>
                        <div className="text-xs text-[#C7F4FA]/50">Current Version</div>
                    </div>
                    <div className="w-px h-10 bg-[#084B54]" />
                    <div className="text-center">
                        <div className="font-hebden text-2xl text-[#109EB1]">~50MB</div>
                        <div className="text-xs text-[#C7F4FA]/50">Download Size</div>
                    </div>
                    <div className="w-px h-10 bg-[#084B54]" />
                    <div className="text-center">
                        <div className="font-hebden text-2xl text-[#109EB1]">Open Source</div>
                        <div className="text-xs text-[#C7F4FA]/50">MIT License</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
