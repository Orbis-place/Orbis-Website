'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:chart-line',
        title: 'Real Analytics',
        description: 'Track downloads, likes, and engagement. Know exactly how your creations perform.',
    },
    {
        icon: 'mdi:cash',
        title: 'Fair Monetization',
        description: 'Accept donations directly from fans. No platform cut on tips — you keep everything.',
    },
    {
        icon: 'mdi:target',
        title: 'Get Discovered',
        description: 'Featured spots, "Hidden Gems" section, creator spotlights. Quality rises to the top.',
    },
    {
        icon: 'mdi:account-group',
        title: 'Team Collaboration',
        description: 'Build together. Add contributors, manage permissions, share the credit.',
    },
    {
        icon: 'mdi:source-branch',
        title: 'Version Control',
        description: 'Manage releases properly. Changelogs, multiple files, Hytale version compatibility.',
    },
    {
        icon: 'mdi:shield-check',
        title: 'You Own Your Work',
        description: 'Your content, your rules. Export anytime. No vendor lock-in.',
    },
];

const mockStats = [
    { label: 'Downloads', value: '12.5K', trend: '+24%' },
    { label: 'Likes', value: '847', trend: '+12%' },
    { label: 'Followers', value: '234', trend: '+8%' },
];

const mockActivity = [
    { text: 'New download from Germany', time: '2m ago' },
    { text: 'Someone liked your mod', time: '15m ago' },
    { text: 'New follower: CraftMaster', time: '1h ago' },
];

export function BuiltForCreators() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#042a2f]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Built for Creators
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Your work deserves visibility — not buried by algorithms or hidden behind someone else's paywall.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
                    {/* Left: Features List */}
                    <div className="space-y-5">
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

                    {/* Right: Dashboard Mockup */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl p-6">
                        {/* Dashboard Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-hebden font-bold text-lg text-[#C7F4FA]">Creator Dashboard</h3>
                            <div className="w-8 h-8 bg-[#109EB1]/20 rounded-full flex items-center justify-center">
                                <Icon icon="mdi:account" className="w-4 h-4 text-[#109EB1]" />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {mockStats.map((stat, index) => (
                                <div key={index} className="bg-[#032125] rounded-xl p-3 text-center">
                                    <p className="font-hebden font-bold text-xl text-[#C7F4FA]">{stat.value}</p>
                                    <p className="font-nunito text-xs text-[#C7F4FA]/60 mb-1">{stat.label}</p>
                                    <span className="inline-flex items-center gap-0.5 text-xs text-[#10b981]">
                                        <Icon icon="mdi:trending-up" className="w-3 h-3" />
                                        {stat.trend}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="mb-6">
                            <h4 className="font-hebden text-sm text-[#C7F4FA]/80 mb-3">Recent Activity</h4>
                            <div className="space-y-2">
                                {mockActivity.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-[#084B54] last:border-0">
                                        <span className="font-nunito text-sm text-[#C7F4FA]/80">{item.text}</span>
                                        <span className="font-nunito text-xs text-[#C7F4FA]/50">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 bg-[#109EB1] rounded-xl font-hebden text-sm text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors">
                                Upload New
                            </button>
                            <button className="flex-1 py-2.5 bg-[#032125] border border-[#084B54] rounded-xl font-hebden text-sm text-[#C7F4FA] hover:border-[#109EB1] transition-colors">
                                View Analytics
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#109EB1] rounded-full font-hebden font-semibold text-lg text-[#C7F4FA] hover:bg-[#0d8a9b] transition-colors"
                    >
                        Start Publishing
                        <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                    </Link>
                    <p className="font-nunito text-sm text-[#C7F4FA]/50 mt-3">It's free, obviously.</p>
                </div>
            </div>
        </section>
    );
}
