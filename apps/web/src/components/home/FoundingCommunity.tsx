'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

const valueProps = [
    {
        icon: 'mdi:rocket-launch',
        title: 'Early Adopter Advantage',
        description: 'Creators who join now get prime visibility when hundreds of players arrive on launch day.',
    },
    {
        icon: 'mdi:hammer-wrench',
        title: 'Shape the Platform',
        description: 'Your feedback matters. Help us build the features you actually need.',
    },
    {
        icon: 'mdi:trophy',
        title: 'Founding Member Recognition',
        description: 'Early supporters get a special badge on their profile. Forever.',
    },
];

export function FoundingCommunity() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Be Part of Something New
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Orbis is launching alongside Hytale. Join the founding community of creators and players shaping the future of Hytale content.
                    </p>
                </div>

                {/* Value Props */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {valueProps.map((prop, index) => (
                        <div
                            key={index}
                            className="bg-[#06363D] border border-[#084B54] rounded-2xl p-6 text-center hover:border-[#109EB1]/50 transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-[#109EB1]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Icon ssr={true} icon={prop.icon} className="w-8 h-8 text-[#109EB1]" />
                            </div>
                            <h3 className="font-hebden font-semibold text-xl text-[#C7F4FA] mb-3">
                                {prop.title}
                            </h3>
                            <p className="font-nunito text-[#C7F4FA]/70 leading-relaxed">
                                {prop.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Badge Preview */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#06363D] border border-[#084B54] rounded-full">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#109EB1] to-[#15C8E0] rounded-full flex items-center justify-center">
                            <Icon ssr={true} icon="mdi:star-four-points" className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-hebden text-[#C7F4FA]">Founding Member</span>
                        <span className="px-2 py-0.5 bg-[#109EB1]/20 rounded text-xs font-nunito text-[#109EB1]">
                            Exclusive
                        </span>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#109EB1] rounded-full font-hebden font-semibold text-lg text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                    >
                        Join the Founding Community
                        <Icon ssr={true} icon="mdi:arrow-right" className="w-5 h-5" />
                    </Link>
                    <p className="font-nunito text-sm text-[#C7F4FA]/50 mt-4">
                        Launching January 13, 2025 with Hytale
                    </p>
                </div>
            </div>
        </section>
    );
}
