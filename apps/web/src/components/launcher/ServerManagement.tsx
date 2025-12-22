'use client';

import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:plus-circle',
        title: 'Create & Delete Instances',
        description: 'Spin up new server instances in seconds. Clone configurations or start fresh. Delete when done.',
    },
    {
        icon: 'mdi:cog',
        title: 'Full Configuration',
        description: 'Customize server name, port, slots, MOTD, and all properties. Everything in one intuitive panel.',
    },
    {
        icon: 'mdi:play-pause',
        title: 'Server Controls',
        description: 'Start, stop, or restart your server with one click. No command line required.',
    },
    {
        icon: 'mdi:console',
        title: 'Integrated Console',
        description: 'Real-time logs with syntax highlighting. Execute commands directly from the launcher.',
    },
    {
        icon: 'mdi:download',
        title: 'Version Management',
        description: 'Download any Hytale version instantly. Switch versions per-server. Automatic updates.',
    },
    {
        icon: 'mdi:content-copy',
        title: 'Server Profiles',
        description: 'Save and duplicate server configurations. Share profiles with your team effortlessly.',
    },
];

const mockConsoleLines = [
    { time: '12:34:01', type: 'info', text: '[Server] Starting Hytale Server v1.0...' },
    { time: '12:34:02', type: 'info', text: '[Server] Loading world "MyWorld"...' },
    { time: '12:34:03', type: 'success', text: '[Server] Done! Server is ready.' },
    { time: '12:34:15', type: 'info', text: '[Server] Player_One joined the game' },
    { time: '12:35:42', type: 'warn', text: '[Warning] High memory usage detected' },
];

export function ServerManagement() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:server" className="w-6 h-6 text-[#109EB1]" />
                    </div>
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                        Server Management
                    </h2>
                </div>
                <p className="font-nunito text-lg text-[#C7F4FA]/70 max-w-2xl mb-12">
                    Complete control over your Hytale servers. From creation to configuration, everything you need in one place.
                </p>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
                    {/* Left: Features Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-[#06363D] border border-[#084B54] rounded-xl p-5 hover:border-[#109EB1]/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-10 h-10 bg-[#109EB1]/20 rounded-lg flex items-center justify-center mb-3">
                                    <Icon icon={feature.icon} className="w-5 h-5 text-[#109EB1]" />
                                </div>
                                <h3 className="font-hebden font-semibold text-lg text-[#C7F4FA] mb-2">
                                    {feature.title}
                                </h3>
                                <p className="font-nunito text-sm text-[#C7F4FA]/60 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right: Console Mockup */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden">
                        {/* Console Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#032125] border-b border-[#084B54]">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:console" className="w-5 h-5 text-[#109EB1]" />
                                <span className="font-hebden text-sm text-[#C7F4FA]">Server Console</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-[#10b981]/20 rounded text-xs text-[#10b981]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                    Online
                                </div>
                            </div>
                        </div>

                        {/* Console Content */}
                        <div className="p-4 font-mono text-sm space-y-1 bg-[#032125] min-h-[200px]">
                            {mockConsoleLines.map((line, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <span className="text-[#C7F4FA]/40">{line.time}</span>
                                    <span className={`
                                        ${line.type === 'success' ? 'text-[#10b981]' : ''}
                                        ${line.type === 'warn' ? 'text-[#f59e0b]' : ''}
                                        ${line.type === 'info' ? 'text-[#C7F4FA]/70' : ''}
                                    `}>
                                        {line.text}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 pt-2 border-t border-[#084B54] mt-3">
                                <span className="text-[#109EB1]">&gt;</span>
                                <span className="text-[#C7F4FA]/50">Type a command...</span>
                                <span className="w-2 h-4 bg-[#109EB1] animate-pulse" />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 p-4 border-t border-[#084B54]">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg text-sm font-hebden text-[#C7F4FA] transition-colors">
                                <Icon icon="mdi:stop" className="w-4 h-4" />
                                Stop
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#109EB1] hover:bg-[#0d8a9a] rounded-lg text-sm font-hebden text-[#C7F4FA] transition-colors">
                                <Icon icon="mdi:restart" className="w-4 h-4" />
                                Restart
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#032125] border border-[#084B54] hover:border-[#109EB1] rounded-lg text-sm font-hebden text-[#C7F4FA] transition-colors ml-auto">
                                <Icon icon="mdi:cog" className="w-4 h-4" />
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
