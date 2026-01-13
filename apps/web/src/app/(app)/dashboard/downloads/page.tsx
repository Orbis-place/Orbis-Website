"use client";

import { useState, useEffect } from 'react';
import { getUserDownloadHistory, DownloadHistoryItem } from '@/lib/api/user';
import { formatRelativeTime } from '@/lib/utils/resourceConverters';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import Image from 'next/image';

// Resource type to singular map
const resourceTypeSingularMap: Record<string, string> = {
    'PLUGIN': 'plugin',
    'MOD': 'mod',
    'WORLD': 'world',
    'PREFAB': 'prefab',
    'ASSET_PACK': 'asset-pack',
    'DATA_PACK': 'data-pack',
    'MODPACK': 'modpack',
    'TOOLS_SCRIPTS': 'tool',
    'PREMADE_SERVER': 'server',
};

// Channel colors
const channelColors: Record<string, string> = {
    'RELEASE': 'bg-green-500/20 text-green-400 border-green-500/30',
    'BETA': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'ALPHA': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SNAPSHOT': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function DownloadsPage() {
    const [downloads, setDownloads] = useState<DownloadHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    useEffect(() => {
        fetchDownloads();
    }, [page]);

    const fetchDownloads = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getUserDownloadHistory(page, limit);
            setDownloads(response.downloads);
            setTotalPages(response.pagination.totalPages);
        } catch (err) {
            console.error('Failed to fetch downloads:', err);
            setError('Failed to load download history');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-white/60">Loading downloads...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <Icon ssr={true} icon="mdi:alert-circle-outline" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-white/80 text-lg">{error}</p>
                </div>
            </div>
        );
    }

    if (downloads.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <Icon ssr={true} icon="mdi:download-off-outline" className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/90 mb-2">No downloads yet</h3>
                    <p className="text-white/60">
                        Your download history will appear here when you download resources.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Download History</h1>
                    <p className="text-white/60">
                        View all resources you've downloaded
                    </p>
                </div>
            </div>

            {/* Downloads List */}
            <div className="space-y-3">
                {downloads.map((download) => {
                    const resourceType = resourceTypeSingularMap[download.resource.type] || 'resource';
                    const resourceUrl = `/${resourceType}/${download.resource.slug}`;
                    const author = download.resource.ownerUser || download.resource.ownerTeam;
                    const authorName = download.resource.ownerUser
                        ? download.resource.ownerUser.displayName || download.resource.ownerUser.username
                        : download.resource.ownerTeam?.name || 'Unknown';
                    const channelColor = download.version
                        ? channelColors[download.version.channel] || channelColors.RELEASE
                        : channelColors.RELEASE;

                    return (
                        <Link
                            key={download.id}
                            href={resourceUrl}
                            className="block bg-card-dark border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Resource Icon */}
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-accent">
                                    {download.resource.iconUrl ? (
                                        <Image
                                            src={download.resource.iconUrl}
                                            alt={download.resource.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon ssr={true} icon="mdi:package-variant" className="w-8 h-8 text-white/40" />
                                        </div>
                                    )}
                                </div>

                                {/* Resource Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-white truncate mb-1">
                                                {download.resource.name}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                by {authorName}
                                            </p>
                                        </div>

                                        {/* Version & Channel */}
                                        {download.version && (
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-xs px-2 py-1 rounded border ${channelColor}`}>
                                                    {download.version.channel}
                                                </span>
                                                <span className="text-sm text-white/80 font-mono">
                                                    v{download.version.versionNumber}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Download Date */}
                                    <div className="flex items-center gap-2 text-sm text-white/50">
                                        <Icon ssr={true} icon="mdi:clock-outline" className="w-4 h-4" />
                                        <span>Downloaded {formatRelativeTime(download.downloadedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="px-4 py-2 bg-accent border border-border rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:chevron-left" className="w-5 h-5" />
                    </button>

                    <span className="text-white/80">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                        className="px-4 py-2 bg-accent border border-border rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:chevron-right" className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
