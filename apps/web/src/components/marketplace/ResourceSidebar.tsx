'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, RefreshCw, BookText, ExternalLink } from 'lucide-react';
import { EntityAvatar } from '@/components/EntityAvatar';

interface Creator {
    username: string;
    avatar: string;
    role: 'Owner' | 'Contributor';
    isTeam?: boolean;
}

interface ResourceLink {
    label: string;
    url: string;
    icon: React.ReactNode;
}

export interface ResourceSidebarProps {
    compatibility: {
        platform: string;
        versions: string[];
    };
    links?: ResourceLink[];
    creators: Creator[];
    license: string;
    publishedAt: string;
    updatedAt: string;
}

export default function ResourceSidebar({
    compatibility,
    links = [],
    creators,
    license,
    publishedAt,
    updatedAt
}: ResourceSidebarProps) {
    return (
        <div className="flex flex-col gap-4 w-full lg:w-[320px]">
            {/* Compatibility */}
            {/* <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                <h2 className="font-hebden font-semibold text-lg text-[#C7F4FA] m-0">
                    Compatibility
                </h2>
                <div className="flex flex-col gap-3">
                    <h3 className="font-hebden font-semibold text-base text-[#109EB1] m-0">
                        {compatibility.platform}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {compatibility.versions.map((version, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-[#032125] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA]/70"
                            >
                                {version}
                            </span>
                        ))}
                    </div>
                </div>
            </div> */}

            {/* Links */}
            {links.length > 0 && (
                <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                    <h2 className="font-hebden font-semibold text-lg text-[#C7F4FA] m-0">
                        Links
                    </h2>
                    <div className="flex flex-col gap-3">
                        {links.map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-[#109EB1] hover:underline font-hebden font-semibold text-sm group"
                            >
                                <span className="text-[#109EB1]">{link.icon}</span>
                                <span className="flex-1">{link.label}</span>
                                <ExternalLink className="w-4 h-4 text-[#C7F4FA]/50 group-hover:text-[#C7F4FA]" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Creators */}
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                <h2 className="font-hebden font-semibold text-lg text-[#C7F4FA] m-0">
                    Creators
                </h2>
                <div className="flex flex-col gap-3">
                    {creators.map((creator, i) => (
                        <Link
                            key={i}
                            href={creator.isTeam ? `/team/${creator.username.toLowerCase()}` : `/users/${creator.username.toLowerCase()}`}
                            className="flex items-center gap-3 group hover:bg-[#032125] p-2 -m-2 rounded-xl transition-colors"
                        >
                            <EntityAvatar
                                src={creator.avatar}
                                name={creator.username}
                                variant={creator.isTeam ? "team" : "user"}
                                className="w-8 h-8 border-2 border-[#084B54] flex-shrink-0"
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-hebden font-semibold text-sm text-[#C7F4FA] group-hover:underline truncate">
                                    {creator.username}
                                </span>
                                <span className="font-nunito text-xs text-[#C7F4FA]/50">
                                    {creator.role}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-4">
                <h2 className="font-hebden font-semibold text-lg text-[#C7F4FA] m-0">
                    Details
                </h2>
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <BookText className="w-5 h-5 text-[#C7F4FA]/50 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <span className="font-nunito text-sm text-[#C7F4FA]">Licensed</span>
                            <span className="font-hebden text-sm font-semibold text-[#C7F4FA]/70">
                                {license}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#C7F4FA]/50 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <span className="font-nunito text-sm text-[#C7F4FA]">Published {publishedAt}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 text-[#C7F4FA]/50 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <span className="font-nunito text-sm text-[#C7F4FA]">Updated {updatedAt}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
