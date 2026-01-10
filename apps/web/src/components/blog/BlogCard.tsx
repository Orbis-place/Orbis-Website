'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Clock } from 'lucide-react';

export interface BlogPost {
    id: string;
    title: string;
    description: string;
    image: string;
    author: string;
    authorDisplay: string;
    date: string;
    readTime: string;
    slug: string;
    category?: string;
}

interface BlogCardProps {
    post: BlogPost;
    featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
    // Featured card - Large hero style
    if (featured) {
        return (
            <Link href={`/blog/${post.slug}`}>
                <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden hover:border-[#109EB1]/50 transition-all duration-300 cursor-pointer group">
                    {/* Featured Image */}
                    <div className="w-full aspect-[21/9] relative overflow-hidden">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.category && (
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#109EB1] rounded-[36px] z-10">
                                <span className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]">
                                    {post.category}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Meta Info */}
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-[#C7F4FA]/50" />
                                <span className="font-nunito text-sm text-[#C7F4FA]/70">{post.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[#C7F4FA]/50" />
                                <span className="font-nunito text-sm text-[#C7F4FA]/70">{post.readTime}</span>
                            </div>
                            <Link
                                href={`/user/${post.author}`}
                                className="flex items-center gap-1.5 hover:text-[#109EB1] transition-colors ml-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <User className="w-4 h-4 text-[#C7F4FA]/50" />
                                <span className="font-hebden font-semibold text-sm text-[#109EB1]">
                                    {post.authorDisplay}
                                </span>
                            </Link>
                        </div>

                        {/* Title */}
                        <h2 className="font-hebden font-semibold text-2xl leading-8 text-[#C7F4FA] mb-3 group-hover:text-[#109EB1] transition-colors">
                            {post.title}
                        </h2>

                        {/* Description */}
                        <p className="font-nunito text-base leading-6 text-[#C7F4FA]/80 line-clamp-2">
                            {post.description}
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    // Regular card - Grid view
    return (
        <Link href={`/blog/${post.slug}`}>
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden hover:border-[#109EB1]/50 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                {/* Image */}
                <div className="w-full aspect-video relative overflow-hidden">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.category && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#109EB1] rounded-[36px] z-10">
                            <span className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]">
                                {post.category}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                            <span className="font-nunito text-xs text-[#C7F4FA]/70">{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                            <span className="font-nunito text-xs text-[#C7F4FA]/70">{post.readTime}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-hebden font-semibold text-lg leading-6 text-[#C7F4FA] mb-2 group-hover:text-[#109EB1] transition-colors line-clamp-2">
                        {post.title}
                    </h3>

                    {/* Description */}
                    <p className="font-nunito text-sm leading-5 text-[#C7F4FA]/80 line-clamp-3 mb-3 flex-1">
                        {post.description}
                    </p>

                    {/* Author */}
                    <div className="pt-3 border-t border-[#084B54] mt-auto">
                        <Link
                            href={`/user/${post.author}`}
                            className="flex items-center gap-1.5 hover:text-[#109EB1] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <User className="w-3.5 h-3.5 text-[#C7F4FA]/50" />
                            <span className="font-hebden font-semibold text-xs text-[#C7F4FA]/50">
                                by <span className="text-[#109EB1]">{post.authorDisplay}</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </Link>
    );
}
