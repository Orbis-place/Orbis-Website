'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:gamepad-variant',
        title: '100% Free Downloads',
        description: 'Every mod, plugin, world, and server listing. No "premium" content. No early access paywalls. If it\'s on Orbis, it\'s free.',
    },
    {
        icon: 'mdi:heart',
        title: 'Support Creators Directly',
        description: 'Love a creation? Send a tip straight to the creator. No middleman fees. They keep what they earn.',
    },
    {
        icon: 'mdi:lock-open-variant',
        title: 'Open Source, Always',
        description: 'Our code is public on GitHub. See exactly how we work. Suggest features. Contribute if you want. True transparency.',
    },
];

export function FreeForever() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Free Forever. No Exceptions.
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Hytale was built on the belief that creativity should be accessible to everyone. Orbis carries that torch forward.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-[#06363D] border border-[#084B54] rounded-2xl p-6 hover:border-[#109EB1]/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 bg-[#109EB1]/20 rounded-xl flex items-center justify-center mb-4">
                                <Icon ssr={true} icon={feature.icon} className="w-7 h-7 text-[#109EB1]" />
                            </div>
                            <h3 className="font-hebden font-semibold text-xl text-[#C7F4FA] mb-3">
                                {feature.title}
                            </h3>
                            <p className="font-nunito text-[#C7F4FA]/70 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quote */}
                <div className="text-center mb-8">
                    <blockquote className="relative">
                        <span className="font-nunito text-2xl md:text-3xl text-[#C7F4FA]/90 italic">
                            "Mods should be free. That's not a feature — it's a principle."
                        </span>
                    </blockquote>
                </div>

                {/* GitHub Badge */}
                <div className="flex justify-center">
                    <Link
                        href="https://github.com/Orbis-place/Orbis-Website"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06363D] border border-[#084B54] rounded-full hover:border-[#109EB1] transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:star" className="w-5 h-5 text-[#109EB1]" />
                        <span className="font-nunito text-sm text-[#C7F4FA]">Star us on GitHub</span>
                        <Icon ssr={true} icon="mdi:arrow-right" className="w-4 h-4 text-[#C7F4FA]/70" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
