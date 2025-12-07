"use client";

import { Download, Calendar, FileText } from 'lucide-react';
import { useResource } from '@/contexts/ResourceContext';

export default function VersionsPage() {
    const { resource } = useResource();

    if (!resource) return null;

    // Mock versions data - will be replaced with real data from backend
    const versions = [
        {
            version: '2.1.0',
            date: '1 week ago',
            downloads: 15234,
            gameVersions: ['Beta 2.x'],
            fileSize: '2.4 MB',
            fileName: `${resource.slug}-2.1.0.jar`
        },
        {
            version: '2.0.0',
            date: '1 month ago',
            downloads: 45891,
            gameVersions: ['Beta 2.x', 'Beta 1.x'],
            fileSize: '2.3 MB',
            fileName: `${resource.slug}-2.0.0.jar`
        },
        {
            version: '1.5.2',
            date: '2 months ago',
            downloads: 32456,
            gameVersions: ['Beta 1.x', 'Alpha 1.x'],
            fileSize: '2.1 MB',
            fileName: `${resource.slug}-1.5.2.jar`
        }
    ];

    return (
        <div className="flex flex-col gap-4">
            {versions.map((version, i) => (
                <div key={i} className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-6 hover:border-[#109EB1] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-hebden font-bold text-xl text-[#C7F4FA]">
                                    {version.version}
                                </h3>
                                <span className="flex items-center gap-1.5 font-nunito text-sm text-[#C7F4FA]/60">
                                    <Calendar className="w-4 h-4" />
                                    {version.date}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                    <Download className="w-4 h-4" />
                                    {version.downloads.toLocaleString()} downloads
                                </span>
                                <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                    <FileText className="w-4 h-4" />
                                    {version.fileSize}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
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

                        <button className="flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all shadow-lg whitespace-nowrap">
                            <Download className="w-5 h-5" />
                            Download
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
