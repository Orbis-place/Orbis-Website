'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Download, Heart, MoreVertical, Tag, Calendar, Flag, Copy } from 'lucide-react';
import { Icon } from '@iconify/react';
import { EntityAvatar } from '@/components/EntityAvatar';
import { getResourceTypeBySingular } from '@/config/resource-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { DownloadVersionModal } from '@/components/marketplace/DownloadVersionModal';
import { SaveToCollectionPopover } from '@/components/marketplace/SaveToCollectionPopover';
import { ReportResourceDialog } from '@/components/ReportResourceDialog';

export interface ResourceHeaderProps {
    title: string;
    description: string;
    image: string;
    bannerImage?: string;
    downloads: string;
    likes: number;
    tags: string[];
    categories: string[];
    type: string;
    slug: string;
    author: string;
    team?: { name: string; displayName?: string; slug?: string } | null;
    owner?: { username: string; displayName?: string } | null;
    updatedAt: string;
    isOwner?: boolean;
    isLiked?: boolean;
    onToggleLike?: () => void;
    isLiking?: boolean;
    resourceId?: string;
    isLoggedIn?: boolean;
    onLoginRequired?: () => void;
    donationLink?: string;
}


export default function ResourceHeader({
    title,
    description,
    image,
    bannerImage,
    downloads,
    likes,
    tags,
    categories,
    type,
    slug,
    author,
    team,
    owner,
    updatedAt,
    isOwner = false,
    isLiked = false,
    onToggleLike,
    isLiking = false,
    resourceId,
    isLoggedIn = false,
    onLoginRequired,
    donationLink,
}: ResourceHeaderProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

    const handleCopyId = () => {
        if (resourceId) {
            navigator.clipboard.writeText(resourceId);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <div className="mb-4 relative">
            {/* Banner and Avatar Container */}
            <div className="relative mb-20">
                {/* Banner Section */}
                <div className="relative w-full h-48 rounded-[25px] overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]" />

                    {/* Banner Image or Gradient */}
                    {bannerImage && (
                        <Image
                            src={bannerImage}
                            alt={`${title} banner`}
                            fill
                            className="object-cover"
                        />
                    )}

                    {/* Type Badge on Banner */}
                    <div className="absolute top-6 left-6">
                        <span className="px-4 py-2 bg-[#109EB1] rounded-full font-hebden font-bold text-sm text-[#C7F4FA]">
                            {type}
                        </span>
                    </div>
                </div>

                {/* Avatar - Overlapping Banner */}
                <div className="absolute -bottom-16 left-8">
                    <div className="relative w-32 h-32 rounded-[25px] overflow-hidden border-4 border-[#032125] shadow-2xl bg-[#032125]">
                        <EntityAvatar
                            src={image}
                            name={title}
                            variant="resource"
                            className="h-full w-full rounded-none"
                            fallbackClassName="text-4xl rounded-none"
                        />
                    </div>
                </div>

                {/* Action Buttons - Below banner */}
                <div className="absolute -bottom-16 right-2 flex gap-3">
                    {/* Primary buttons - Desktop only */}
                    <div className="hidden sm:flex gap-3">
                        <button
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-extrabold text-base text-[#C7F4FA] transition-all shadow-lg">
                            <Download className="w-5 h-5" />
                            <span>Download</span>
                        </button>

                        {isOwner && (
                            <Link
                                href={`/${type}/${slug}/manage`}
                                className="flex items-center justify-center gap-3 px-6 py-3 bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all"
                            >
                                <Icon ssr={true} icon="mdi:cog" width="20" height="20" />
                                <span>Manage</span>
                            </Link>
                        )}
                    </div>

                    {/* Secondary buttons */}
                    <button
                        onClick={onToggleLike}
                        disabled={isLiking}
                        className={`group flex items-center justify-center w-12 h-12 border rounded-full transition-all duration-200 ${isLiked
                            ? 'bg-[#109EB1] border-[#109EB1]'
                            : 'bg-[#06363D] hover:bg-[#084B54] border-[#084B54]'
                            } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <Heart
                            className={`w-5 h-5 transition-all duration-200 ${isLiked
                                ? 'text-white fill-white scale-110'
                                : 'text-[#C7F4FA] group-hover:scale-110'
                                } ${isLiking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`}
                        />
                    </button>

                    {resourceId && (
                        <SaveToCollectionPopover
                            resourceId={resourceId}
                            isLoggedIn={isLoggedIn}
                            onLoginRequired={onLoginRequired}
                        />
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center w-12 h-12 hover:bg-[#06363D] border border-transparent hover:border-[#084B54] rounded-full transition-all">
                                <MoreVertical className="w-5 h-5 text-[#C7F4FA]" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-accent border border-border font-hebden">
                            <DropdownMenuItem
                                onClick={() => setIsReportDialogOpen(true)}
                                className="text-destructive cursor-pointer flex items-center gap-2 data-[highlighted]:text-destructive"
                            >
                                <Flag className="w-4 h-4 text-destructive" />
                                Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#084B54]" />
                            <DropdownMenuItem onClick={handleCopyId} className="text-foreground cursor-pointer flex items-center gap-2">
                                <Copy className="w-4 h-4" />
                                {copySuccess ? 'Copied!' : 'Copy ID'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Info Section */}
            <div className="px-2">
                {/* Title and Description */}
                <div className="mb-4">
                    <h1 className="font-hebden font-extrabold text-3xl sm:text-4xl leading-tight text-[#C7F4FA] mb-2">
                        {title}
                    </h1>
                    <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#C7F4FA]/60 font-nunito mb-4">
                    <span>by <Link href={team?.slug ? `/team/${team.slug.toLowerCase()}` : owner ? `/user/${owner.username.toLowerCase()}` : '#'} className="text-[#109EB1] font-semibold hover:underline">{author}</Link></span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Updated {updatedAt}
                    </span>
                </div>

                {/* Stats and Tags */}
                <div className="flex flex-wrap items-center gap-6 pb-6">
                    {/* Stats */}
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                {downloads}
                            </span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                Downloads
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="font-hebden font-extrabold text-2xl text-[#C7F4FA]">
                                {likes?.toLocaleString() || '0'}
                            </span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                Likes
                            </span>
                        </div>
                    </div>

                    {/* Tags and Categories */}
                    {(tags.length > 0 || categories.length > 0) && (
                        <div className="flex items-center gap-2 flex-1">
                            <Tag className="w-5 h-5 text-[#C7F4FA]/50" />
                            <div className="flex flex-wrap gap-2">
                                {/* Categories - displayed with cyan accent */}
                                {categories.slice(0, 5).map((category, i) => {
                                    const typeConfig = getResourceTypeBySingular(type);
                                    const pluralPath = typeConfig?.plural || type;
                                    return (
                                        <Link
                                            key={`category-${i}`}
                                            href={`/${pluralPath}?categories=${encodeURIComponent(category.toLowerCase())}`}
                                            className="px-3 py-1.5 bg-[#06363D] border border-[#084B54] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA] hover:bg-[#084B54] transition-colors cursor-pointer"
                                        >
                                            {category}
                                        </Link>
                                    );
                                })}
                                {/* Tags - displayed with cyan accent */}
                                {tags.slice(0, 5).map((tag, i) => {
                                    const typeConfig = getResourceTypeBySingular(type);
                                    const pluralPath = typeConfig?.plural || type;
                                    return (
                                        <Link
                                            key={`tag-${i}`}
                                            href={`/${pluralPath}?tags=${encodeURIComponent(tag.toLowerCase())}`}
                                            className="px-3 py-1.5 bg-[#06363D] border border-[#084B54] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA] hover:bg-[#084B54] transition-colors cursor-pointer"
                                        >
                                            {tag}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary action buttons - Mobile only */}
                <div className="flex flex-col gap-3 pb-6 sm:hidden">
                    <button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-extrabold text-base text-[#C7F4FA] transition-all shadow-lg">
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                    </button>

                    {isOwner && (
                        <Link
                            href={`/${type}/${slug}/manage`}
                            className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all"
                        >
                            <Icon ssr={true} icon="mdi:cog" width="20" height="20" />
                            <span>Manage</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Download Version Modal */}
            {resourceId && (
                <DownloadVersionModal
                    open={isDownloadModalOpen}
                    onOpenChange={setIsDownloadModalOpen}
                    resourceId={resourceId}
                    resourceName={title}
                    donationLink={donationLink}
                />
            )}

            {/* Report Resource Dialog */}
            {resourceId && (
                <ReportResourceDialog
                    open={isReportDialogOpen}
                    onOpenChange={setIsReportDialogOpen}
                    resourceId={resourceId}
                    resourceName={title}
                />
            )}
        </div>
    );
}