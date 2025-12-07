'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Download, Heart, Bookmark, MoreVertical, Tag, Calendar } from 'lucide-react';
import { Icon } from '@iconify-icon/react';

export interface ResourceHeaderProps {
    title: string;
    description: string;
    image: string;
    bannerImage?: string;
    downloads: string;
    followers: number;
    tags: string[];
    type: string;
    slug: string;
    author: string;
    updatedAt: string;
    isOwner?: boolean;
    isLiked?: boolean;
    isFavorited?: boolean;
    onToggleLike?: () => void;
    onToggleFavorite?: () => void;
    isLiking?: boolean;
    isFavoriting?: boolean;
}

export default function ResourceHeader({
    title,
    description,
    image,
    bannerImage,
    downloads,
    followers,
    tags,
    type,
    slug,
    author,
    updatedAt,
    isOwner = false,
    isLiked = false,
    isFavorited = false,
    onToggleLike,
    onToggleFavorite,
    isLiking = false,
    isFavoriting = false
}: ResourceHeaderProps) {
    return (
        <div className="mb-4">
            {/* Banner and Avatar Container */}
            <div className="relative mb-20">
                {/* Banner Section */}
                <div className="relative w-full h-48 rounded-[25px] overflow-hidden">
                    {/* Banner Image or Gradient */}
                    {bannerImage ? (
                        <Image
                            src={bannerImage}
                            alt={`${title} banner`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1]" />
                    )}

                    {/* Type Badge on Banner */}
                    <div className="absolute top-6 left-6">
                        <span className="px-4 py-2 bg-[#109EB1] rounded-full font-hebden font-bold text-sm text-[#C7F4FA]">
                            {type}
                        </span>
                    </div>
                </div>

                {/* Avatar - Overlapping Banner (outside banner container to avoid overflow) */}
                <div className="absolute -bottom-16 left-8">
                    <div className="relative w-32 h-32 rounded-[25px] overflow-hidden border-4 border-[#032125] shadow-2xl bg-[#032125]">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="px-2">
                {/* Title and Description */}
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                            <h1 className="font-hebden font-extrabold text-3xl sm:text-4xl leading-tight text-[#C7F4FA] mb-2">
                                {title}
                            </h1>
                            <p className="font-nunito text-base text-[#C7F4FA]/80 leading-relaxed max-w-3xl">
                                {description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button className="flex items-center gap-3 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] rounded-full font-hebden font-extrabold text-base text-[#C7F4FA] transition-all shadow-lg">
                                <Download className="w-5 h-5" />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            {isOwner && (
                                <Link
                                    href={`/${type}/${slug}/manage`}
                                    className="flex items-center gap-3 px-6 py-3 bg-[#06363D] hover:bg-[#084B54] border border-[#084B54] rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all"
                                >
                                    <Icon icon="mdi:cog" width="20" height="20" />
                                    <span className="hidden sm:inline">Manage</span>
                                </Link>
                            )}

                            <button
                                onClick={onToggleLike}
                                disabled={isLiking}
                                className={`group flex items-center justify-center w-12 h-12 border rounded-full transition-all ${isLiked
                                    ? 'bg-[#109EB1] border-[#109EB1]'
                                    : 'bg-[#06363D] hover:bg-[#084B54] border-[#084B54]'
                                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Heart
                                    className={`w-5 h-5 transition-all ${isLiked
                                        ? 'text-white fill-white scale-110'
                                        : 'text-[#C7F4FA] group-hover:scale-110'
                                        } ${isLiking ? 'animate-pulse' : ''}`}
                                />
                            </button>

                            <button
                                onClick={onToggleFavorite}
                                disabled={isFavoriting}
                                className={`group flex items-center justify-center w-12 h-12 border rounded-full transition-all ${isFavorited
                                    ? 'bg-[#109EB1] border-[#109EB1]'
                                    : 'bg-[#06363D] hover:bg-[#084B54] border-[#084B54]'
                                    } ${isFavoriting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Bookmark
                                    className={`w-5 h-5 transition-all ${isFavorited
                                        ? 'text-white fill-white scale-110'
                                        : 'text-[#C7F4FA] group-hover:scale-110'
                                        } ${isFavoriting ? 'animate-pulse' : ''}`}
                                />
                            </button>

                            <button className="flex items-center justify-center w-12 h-12 hover:bg-[#06363D] border border-transparent hover:border-[#084B54] rounded-full transition-all">
                                <MoreVertical className="w-5 h-5 text-[#C7F4FA]" />
                            </button>
                        </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#C7F4FA]/60 font-nunito">
                        <span>by <Link href={`/users/${author.toLowerCase()}`} className="text-[#109EB1] font-semibold hover:underline">{author}</Link></span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Updated {updatedAt}
                        </span>
                    </div>
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
                                {followers?.toLocaleString() || '0'}
                            </span>
                            <span className="font-nunito text-sm text-[#C7F4FA]/50">
                                Followers
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-1">
                        <Tag className="w-5 h-5 text-[#C7F4FA]/50" />
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-[#06363D] border border-[#084B54] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA] hover:bg-[#084B54] transition-colors cursor-pointer"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
