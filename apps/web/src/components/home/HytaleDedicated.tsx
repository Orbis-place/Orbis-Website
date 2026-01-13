'use client';

import { Icon } from '@iconify/react';

const contentTypes = [
    { name: 'Mods', icon: 'mdi:puzzle' },
    { name: 'Modpacks', icon: 'mdi:package-variant' },
    { name: 'Worlds', icon: 'mdi:earth' },
    { name: 'Plugins', icon: 'mdi:power-plug' },
    { name: 'Asset Packs', icon: 'mdi:palette' },
    { name: 'Prefabs', icon: 'mdi:cube-outline' },
    { name: 'Data Packs', icon: 'mdi:database' },

];

export function HytaleDedicated() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#042a2f]">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        100% Dedicated to Hytale
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Orbis was born from passion for Hytale. Every feature is designed for this community. No compromises, just the essentials.
                    </p>
                </div>

                {/* Content Types Grid */}
                <div className="bg-[#06363D] border border-[#084B54] rounded-2xl p-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Icon ssr={true} icon="mdi:gamepad-variant" className="w-6 h-6 text-[#109EB1]" />
                        <span className="font-hebden font-semibold text-lg text-[#C7F4FA]">Hytale Compatible</span>
                    </div>
                    <p className="font-nunito text-[#C7F4FA]/70 mb-8">
                        All content is verified and optimized for Hytale
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {contentTypes.map((type) => (
                            <div
                                key={type.name}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#032125] border border-[#084B54] rounded-full hover:border-[#109EB1] transition-colors"
                            >
                                <Icon ssr={true} icon={type.icon} className="w-4 h-4 text-[#109EB1]" />
                                <span className="font-nunito text-sm text-[#C7F4FA]">{type.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
