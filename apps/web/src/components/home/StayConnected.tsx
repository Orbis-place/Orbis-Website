'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { EntityAvatar } from '@/components/EntityAvatar';
import { fetchResources, ResourceSortOption, Resource } from '@/lib/api/resources';

const features = [
    {
        icon: 'mdi:bell-ring',
        title: 'Instant Notifications',
        description: 'Get notified when followed creators publish updates or new content.',
    },
    {
        icon: 'mdi:star',
        title: 'Personal Collection',
        description: 'Save your favorites. Build a library that\'s uniquely yours.',
    },
    {
        icon: 'mdi:account-heart',
        title: 'Follow Creators',
        description: 'Support the people behind your favorite mods. See their full portfolio.',
    },
];

interface UpdateNotification {
    id: string;
    slug: string;
    type: string;
    iconUrl?: string;
    title: string;
    description: string;
    time: string;
    isNew: boolean;
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
}

// Transform API resource to notification format
function transformToNotification(resource: Resource, isNew: boolean): UpdateNotification {
    return {
        id: resource.id,
        slug: resource.slug,
        type: resource.type.toLowerCase().replace(/_/g, '-'),
        iconUrl: resource.iconUrl,
        title: `${resource.name} updated!`,
        description: resource.latestVersion?.name || `Version ${resource.latestVersion?.versionNumber || 'new'}`,
        time: formatRelativeTime(resource.updatedAt),
        isNew,
    };
}

interface StayConnectedProps {
    initialUpdates?: UpdateNotification[];
}

export function StayConnected({ initialUpdates = [] }: StayConnectedProps) {
    const [updates, setUpdates] = useState<UpdateNotification[]>(initialUpdates);
    const [isLoading, setIsLoading] = useState(initialUpdates.length === 0);

    // Fetch recently updated resources on mount
    useEffect(() => {
        if (initialUpdates.length === 0) {
            const loadUpdates = async () => {
                try {
                    const response = await fetchResources({
                        sortBy: ResourceSortOption.UPDATED,
                        limit: 4,
                    });
                    setUpdates(response.data.map((r, i) => transformToNotification(r, i === 0)));
                } catch (error) {
                    console.error('Failed to fetch updates:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadUpdates();
        }
    }, [initialUpdates.length]);

    const newCount = updates.filter(u => u.isNew).length || updates.length;

    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Never Miss an Update
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-2xl mx-auto">
                        Be the first to know when your favorite creators release something new. Build your personal collection of Hytale content.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Features */}
                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon ssr={true} icon={feature.icon} className="w-6 h-6 text-[#109EB1]" />
                                </div>
                                <div>
                                    <h3 className="font-hebden font-semibold text-xl text-[#C7F4FA] mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="font-nunito text-[#C7F4FA]/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Notifications */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#084B54]">
                            <div className="flex items-center gap-2">
                                <Icon ssr={true} icon="mdi:bell" className="w-5 h-5 text-[#109EB1]" />
                                <span className="font-hebden font-semibold text-[#C7F4FA]">Recent Updates</span>
                            </div>
                            {updates.length > 0 && (
                                <span className="px-2 py-0.5 bg-[#109EB1] rounded-full text-xs font-nunito text-[#C7F4FA]">
                                    {newCount} new
                                </span>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="divide-y divide-[#084B54]">
                            {isLoading ? (
                                // Loading skeleton
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-3 px-5 py-4">
                                            <div className="w-10 h-10 bg-[#109EB1]/20 rounded-lg flex-shrink-0 animate-pulse" />
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="h-4 bg-[#109EB1]/20 rounded w-3/4 animate-pulse" />
                                                <div className="h-3 bg-[#109EB1]/10 rounded w-1/2 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : updates.length > 0 ? (
                                updates.map((notif) => (
                                    <Link
                                        key={notif.id}
                                        href={`/${notif.type}/${notif.slug}`}
                                        className={`flex gap-3 px-5 py-4 hover:bg-[#032125]/50 transition-colors ${notif.isNew ? 'bg-[#109EB1]/5' : ''
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                                            <EntityAvatar
                                                src={notif.iconUrl}
                                                name={notif.title}
                                                variant="resource"
                                                className="w-full h-full"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-hebden text-sm text-[#C7F4FA]">{notif.title}</p>
                                            <p className="font-nunito text-xs text-[#C7F4FA]/60">{notif.description}</p>
                                        </div>

                                        {/* Time */}
                                        <span className="font-nunito text-xs text-[#C7F4FA]/40 flex-shrink-0">
                                            {notif.time}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Icon ssr={true} icon="mdi:bell-off" className="w-12 h-12 text-[#C7F4FA]/20 mx-auto mb-2" />
                                    <p className="font-nunito text-sm text-[#C7F4FA]/50">
                                        No recent updates
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* View All Link */}
                        {updates.length > 0 && (
                            <div className="flex items-center justify-center gap-2 text-[#109EB1] font-nunito text-sm hover:underline px-5 py-3 border-t border-[#084B54] cursor-pointer">
                                View all updates
                                <Icon ssr={true} icon="mdi:arrow-right" className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
