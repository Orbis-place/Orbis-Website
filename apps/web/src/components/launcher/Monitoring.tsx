'use client';

import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:chart-box',
        title: 'Real-Time Stats',
        description: 'Monitor RAM, CPU usage, and uptime at a glance. Know exactly how your server is performing.',
    },
    {
        icon: 'mdi:account-multiple',
        title: 'Player List',
        description: 'See who\'s online, their playtime, and manage players directly from the dashboard.',
    },
    {
        icon: 'mdi:history',
        title: 'Session History',
        description: 'Track server sessions, uptime records, and performance trends over time.',
    },
    {
        icon: 'mdi:bell',
        title: 'Smart Notifications',
        description: 'Get alerts for server crashes, mod updates, high resource usage, and more.',
    },
];

const mockPlayers = [
    { name: 'Player_One', playtime: '2h 34m', status: 'online' },
    { name: 'CraftMaster', playtime: '1h 12m', status: 'online' },
    { name: 'WorldExplorer', playtime: '45m', status: '?mdi:account-check' },
];

const mockNotifications = [
    { icon: 'mdi:update', text: 'Enhanced Combat has an update', time: '5m ago', type: 'info' },
    { icon: 'mdi:alert-circle', text: 'High memory usage (85%)', time: '12m ago', type: 'warn' },
    { icon: 'mdi:account-plus', text: 'New player joined: Builder42', time: '1h ago', type: 'success' },
];

export function Monitoring() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#042a2f]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:monitor-dashboard" className="w-6 h-6 text-[#109EB1]" />
                    </div>
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                        Monitoring & Notifications
                    </h2>
                </div>
                <p className="font-nunito text-lg text-[#C7F4FA]/70 max-w-2xl mb-12">
                    Stay informed about your server's health. Real-time stats, player activity, and smart alerts keep you in control.
                </p>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
                    {/* Left: Features */}
                    <div className="space-y-4">
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
                    <div className="space-y-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-[#06363D] border border-[#084B54] rounded-xl p-4 text-center">
                                <div className="w-8 h-8 bg-[#10b981]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Icon icon="mdi:check-circle" className="w-4 h-4 text-[#10b981]" />
                                </div>
                                <div className="font-hebden text-xl text-[#C7F4FA]">Online</div>
                                <div className="text-xs text-[#C7F4FA]/50">Status</div>
                            </div>
                            <div className="bg-[#06363D] border border-[#084B54] rounded-xl p-4 text-center">
                                <div className="font-hebden text-2xl text-[#109EB1]">24%</div>
                                <div className="text-xs text-[#C7F4FA]/50">CPU</div>
                                <div className="w-full h-1 bg-[#032125] rounded-full mt-2">
                                    <div className="h-full w-1/4 bg-[#109EB1] rounded-full" />
                                </div>
                            </div>
                            <div className="bg-[#06363D] border border-[#084B54] rounded-xl p-4 text-center">
                                <div className="font-hebden text-2xl text-[#109EB1]">4.2GB</div>
                                <div className="text-xs text-[#C7F4FA]/50">RAM</div>
                                <div className="w-full h-1 bg-[#032125] rounded-full mt-2">
                                    <div className="h-full w-3/5 bg-[#109EB1] rounded-full" />
                                </div>
                            </div>
                            <div className="bg-[#06363D] border border-[#084B54] rounded-xl p-4 text-center">
                                <div className="font-hebden text-2xl text-[#109EB1]">48h</div>
                                <div className="text-xs text-[#C7F4FA]/50">Uptime</div>
                            </div>
                        </div>

                        {/* Player List */}
                        <div className="bg-[#06363D] border border-[#084B54] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#084B54]">
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:account-multiple" className="w-5 h-5 text-[#109EB1]" />
                                    <span className="font-hebden text-sm text-[#C7F4FA]">Online Players</span>
                                </div>
                                <span className="font-hebden text-sm text-[#109EB1]">3/20</span>
                            </div>
                            <div className="divide-y divide-[#084B54]">
                                {mockPlayers.map((player, index) => (
                                    <div key={index} className="flex items-center gap-3 px-4 py-3">
                                        <div className="w-8 h-8 bg-[#032125] rounded-lg flex items-center justify-center">
                                            <Icon icon="mdi:account" className="w-4 h-4 text-[#C7F4FA]/50" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-hebden text-sm text-[#C7F4FA]">{player.name}</div>
                                            <div className="text-xs text-[#C7F4FA]/50">{player.playtime}</div>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-[#06363D] border border-[#084B54] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#084B54]">
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:bell" className="w-5 h-5 text-[#109EB1]" />
                                    <span className="font-hebden text-sm text-[#C7F4FA]">Recent Notifications</span>
                                </div>
                                <button className="text-xs text-[#109EB1] hover:underline">View All</button>
                            </div>
                            <div className="divide-y divide-[#084B54]">
                                {mockNotifications.map((notif, index) => (
                                    <div key={index} className="flex items-start gap-3 px-4 py-3">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                            ${notif.type === 'warn' ? 'bg-[#f59e0b]/20' : ''}
                                            ${notif.type === 'info' ? 'bg-[#109EB1]/20' : ''}
                                            ${notif.type === 'success' ? 'bg-[#10b981]/20' : ''}
                                        `}>
                                            <Icon
                                                icon={notif.icon}
                                                className={`w-4 h-4
                                                    ${notif.type === 'warn' ? 'text-[#f59e0b]' : ''}
                                                    ${notif.type === 'info' ? 'text-[#109EB1]' : ''}
                                                    ${notif.type === 'success' ? 'text-[#10b981]' : ''}
                                                `}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-nunito text-sm text-[#C7F4FA] truncate">{notif.text}</div>
                                            <div className="text-xs text-[#C7F4FA]/40">{notif.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
