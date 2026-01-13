'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

export function FinalCTA() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA]">
                        Ready to Dive In?
                    </h2>
                </div>

                {/* Two CTA Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {/* For Players */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl p-8 text-center hover:border-[#109EB1]/50 transition-all duration-300">
                        <div className="w-16 h-16 bg-[#109EB1]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon ssr={true} icon="mdi:gamepad-variant" className="w-8 h-8 text-[#109EB1]" />
                        </div>
                        <h3 className="font-hebden font-bold text-2xl text-[#C7F4FA] mb-2">
                            For Players
                        </h3>
                        <p className="font-nunito text-[#C7F4FA]/70 mb-6">
                            Discover amazing community content
                        </p>
                        <Link
                            href="/resources"
                            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-[#109EB1] rounded-full font-hebden font-semibold text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                        >
                            Browse Marketplace
                            <Icon ssr={true} icon="mdi:arrow-right" className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* For Creators */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl p-8 text-center hover:border-[#109EB1]/50 transition-all duration-300">
                        <div className="w-16 h-16 bg-[#109EB1]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon ssr={true} icon="mdi:palette" className="w-8 h-8 text-[#109EB1]" />
                        </div>
                        <h3 className="font-hebden font-bold text-2xl text-[#C7F4FA] mb-2">
                            For Creators
                        </h3>
                        <p className="font-nunito text-[#C7F4FA]/70 mb-6">
                            Share your work with the world
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-[#109EB1] rounded-full font-hebden font-semibold text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                        >
                            Start Creating
                            <Icon ssr={true} icon="mdi:arrow-right" className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Discord Link */}
                <div className="text-center">
                    <a
                        href="https://discord.gg/6h2eVhntPf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-nunito text-[#C7F4FA]/70 hover:text-[#109EB1] transition-colors"
                    >
                        <span>Questions? Join our Discord</span>
                        <Icon ssr={true} icon="mdi:arrow-right" className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
