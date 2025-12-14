"use client";

import { useState } from 'react';
import { Download, Calendar, FileText, ChevronDown } from 'lucide-react';
import { useResource } from '@/contexts/ResourceContext';

// Channel badge component
const ChannelBadge = ({ channel }: { channel: 'release' | 'beta' | 'alpha' }) => {
    const colors = {
        release: { bg: 'bg-[#0D7A3D]', text: 'text-[#5EE59C]' },
        beta: { bg: 'bg-[#7A4D0D]', text: 'text-[#FFA94D]' },
        alpha: { bg: 'bg-[#7A0D0D]', text: 'text-[#FF7979]' }
    };

    const color = colors[channel];
    const label = channel.charAt(0).toUpperCase();

    return (
        <div className={`w-9 h-9 ${color.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className={`font-hebden font-bold text-sm ${color.text}`}>{label}</span>
        </div>
    );
};

// Version type with changelog
interface Version {
    version: string;
    date: string;
    downloads: number;
    gameVersions: string[];
    fileSize: string;
    fileName: string;
    channel: 'release' | 'beta' | 'alpha';
    changelog: string[];
}

// Individual version item with accordion
const VersionItem = ({ version }: { version: Version }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden hover:border-[#109EB1] transition-colors">
            {/* Version Header - Clickable to toggle accordion */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <ChannelBadge channel={version.channel} />
                            <h3 className="font-hebden font-bold text-xl text-[#C7F4FA]">
                                {version.version}
                            </h3>
                            <span className="flex items-center gap-1.5 font-nunito text-sm text-[#C7F4FA]/60">
                                <Calendar className="w-4 h-4" />
                                {version.date}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm mb-3">
                            <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                <Download className="w-4 h-4" />
                                {version.downloads.toLocaleString()} downloads
                            </span>
                            <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                <FileText className="w-4 h-4" />
                                {version.fileSize}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {version.gameVersions.map((gameVer, j) => (
                                <span
                                    key={j}
                                    className="px-3 py-1 bg-[#032125] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA]/70"
                                >
                                    {gameVer}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Download logic here
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all shadow-lg whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" />
                            Download
                        </button>
                        <ChevronDown
                            className={`w-6 h-6 text-[#C7F4FA]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </div>
            </button>

            {/* Changelog - Accordion Content */}
            <div
                className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="px-6 pb-6 pt-2 border-t border-[#084B54]">
                    <h4 className="font-hebden font-bold text-lg text-[#109EB1] mb-3">
                        Changelog
                    </h4>
                    <ul className="space-y-2">
                        {version.changelog.map((change, i) => (
                            <li key={i} className="flex items-start gap-3 font-nunito text-base text-[#C7F4FA]">
                                <span className="text-[#109EB1] mt-1">•</span>
                                <span>{change}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function VersionsPage() {
    const { resource } = useResource();
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['release', 'beta', 'alpha']);
    const [selectedGameVersions, setSelectedGameVersions] = useState<string[]>([]);

    if (!resource) return null;

    // Mock versions data with changelog - will be replaced with real data from backend
    const allVersions: Version[] = [

    ];

    // Get unique game versions for filter
    const allGameVersions = Array.from(
        new Set(allVersions.flatMap(v => v.gameVersions))
    );

    // Filter versions based on selected filters
    const filteredVersions = allVersions.filter(version => {
        const channelMatch = selectedChannels.length === 0 || selectedChannels.includes(version.channel);
        const gameVersionMatch = selectedGameVersions.length === 0 ||
            version.gameVersions.some(gv => selectedGameVersions.includes(gv));
        return channelMatch && gameVersionMatch;
    });

    // Toggle channel filter
    const toggleChannel = (channel: string) => {
        setSelectedChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    // Toggle game version filter
    const toggleGameVersion = (gameVersion: string) => {
        setSelectedGameVersions(prev =>
            prev.includes(gameVersion)
                ? prev.filter(gv => gv !== gameVersion)
                : [...prev, gameVersion]
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {/* Channel Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleChannel('release')}
                        className={`px-4 py-2 rounded-full font-hebden font-semibold text-sm transition-all ${selectedChannels.includes('release')
                            ? 'bg-[#0D7A3D] text-[#5EE59C]'
                            : 'bg-[#06363D] text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                            } border border-[#084B54]`}
                    >
                        Release
                    </button>
                    <button
                        onClick={() => toggleChannel('beta')}
                        className={`px-4 py-2 rounded-full font-hebden font-semibold text-sm transition-all ${selectedChannels.includes('beta')
                            ? 'bg-[#7A4D0D] text-[#FFA94D]'
                            : 'bg-[#06363D] text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                            } border border-[#084B54]`}
                    >
                        Beta
                    </button>
                    <button
                        onClick={() => toggleChannel('alpha')}
                        className={`px-4 py-2 rounded-full font-hebden font-semibold text-sm transition-all ${selectedChannels.includes('alpha')
                            ? 'bg-[#7A0D0D] text-[#FF7979]'
                            : 'bg-[#06363D] text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                            } border border-[#084B54]`}
                    >
                        Alpha
                    </button>
                </div>

                {/* Game Version Filters */}
                <div className="flex gap-2">
                    {allGameVersions.map(gameVersion => (
                        <button
                            key={gameVersion}
                            onClick={() => toggleGameVersion(gameVersion)}
                            className={`px-4 py-2 rounded-full font-hebden font-semibold text-sm transition-all ${selectedGameVersions.includes(gameVersion)
                                ? 'bg-[#109EB1] text-[#C7F4FA]'
                                : 'bg-[#06363D] text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                                } border border-[#084B54]`}
                        >
                            {gameVersion}
                        </button>
                    ))}
                </div>
            </div>

            {/* Versions List */}
            <div className="flex flex-col gap-4">
                {filteredVersions.length > 0 ? (
                    filteredVersions.map((version, i) => (
                        <VersionItem key={i} version={version} />
                    ))
                ) : (
                    <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-12 text-center">
                        <p className="font-nunito text-lg text-[#C7F4FA]/60">
                            No versions found matching your filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
