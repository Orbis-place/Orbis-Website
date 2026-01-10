'use client';

import { useState, useEffect } from 'react';
import { OrbisDialog } from '@/components/OrbisDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { Download, FileIcon } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface VersionFile {
    id: string;
    filename: string;
    displayName?: string;
    fileType: string;
    size: number;
}

interface HytaleVersion {
    id: string;
    hytaleVersion: string;
    name?: string;
}

interface ResourceVersion {
    id: string;
    versionNumber: string;
    name?: string;
    channel: 'RELEASE' | 'BETA' | 'ALPHA' | 'SNAPSHOT';
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
    changelog?: string;
    downloadCount: number;
    createdAt: string;
    publishedAt?: string;
    primaryFileId?: string;
    primaryFile?: VersionFile;
    files: VersionFile[];
    compatibleVersions: Array<{
        hytaleVersion: HytaleVersion;
    }>;
}

interface DownloadVersionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resourceId: string;
    resourceName: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getChannelColor = (channel: ResourceVersion['channel']) => {
    switch (channel) {
        case 'RELEASE': return 'bg-primary/20 text-primary border-primary/30';
        case 'BETA': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
        case 'ALPHA': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
        case 'SNAPSHOT': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// ============================================
// COMPONENT
// ============================================

export function DownloadVersionModal({
    open,
    onOpenChange,
    resourceId,
    resourceName,
}: DownloadVersionModalProps) {
    const [loading, setLoading] = useState(true);
    const [versions, setVersions] = useState<ResourceVersion[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<ResourceVersion['channel'] | 'ALL'>('RELEASE');
    const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

    // Fetch versions when modal opens
    useEffect(() => {
        if (open && resourceId) {
            fetchVersions();
        }
    }, [open, resourceId]);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                // Only show approved versions
                const approvedVersions = (data.versions || []).filter(
                    (v: ResourceVersion) => v.status === 'APPROVED'
                );
                setVersions(approvedVersions);

                // Auto-select first available channel if RELEASE has no versions
                if (approvedVersions.length > 0) {
                    const hasRelease = approvedVersions.some((v: ResourceVersion) => v.channel === 'RELEASE');
                    if (!hasRelease) {
                        setSelectedChannel('ALL');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (version: ResourceVersion, fileId?: string) => {
        // If specific file requested, download that file
        // Otherwise, use smart download (single file or ZIP)
        const downloadUrl = fileId
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${version.id}/download/${fileId}`
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${version.id}/download`;

        window.open(downloadUrl, '_blank');
    };

    // Filter versions by channel
    const filteredVersions = selectedChannel === 'ALL'
        ? versions
        : versions.filter(v => v.channel === selectedChannel);

    // Get available channels
    const availableChannels = [...new Set(versions.map(v => v.channel))];

    // Channel tabs with counts
    const channelTabs: Array<{ value: ResourceVersion['channel'] | 'ALL'; label: string; count: number }> = [
        { value: 'ALL', label: 'All', count: versions.length },
        ...(['RELEASE', 'BETA', 'ALPHA', 'SNAPSHOT'] as const)
            .filter(ch => availableChannels.includes(ch))
            .map(ch => ({
                value: ch,
                label: ch.charAt(0) + ch.slice(1).toLowerCase(),
                count: versions.filter(v => v.channel === ch).length
            }))
    ];

    return (
        <OrbisDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Download ${resourceName}`}
            description="Select a version to download"
            size="xl"
        >
            <div className="max-h-[60vh] overflow-hidden flex flex-col -my-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Icon icon="mdi:loading" width="32" height="32" className="animate-spin text-primary" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon icon="mdi:package-variant" width="48" height="48" className="text-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No versions available for download</p>
                    </div>
                ) : (
                    <>
                        {/* Channel Tabs */}
                        <div className="flex gap-2 border-b border-border/30 pb-3 overflow-x-auto flex-shrink-0">
                            {channelTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setSelectedChannel(tab.value)}
                                    className={`px-4 py-2 rounded-full font-hebden text-sm transition-colors whitespace-nowrap ${selectedChannel === tab.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-secondary/50'
                                        }`}
                                >
                                    {tab.label}
                                    <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
                                </button>
                            ))}
                        </div>

                        {/* Versions List */}
                        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                            {filteredVersions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No {selectedChannel.toLowerCase()} versions available
                                </div>
                            ) : (
                                filteredVersions.map((version) => (
                                    <div
                                        key={version.id}
                                        className="border border-border/50 rounded-xl overflow-hidden bg-secondary/30"
                                    >
                                        {/* Version Header */}
                                        <div className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-hebden text-lg font-semibold text-foreground">
                                                        v{version.versionNumber}
                                                    </span>
                                                    {version.name && (
                                                        <span className="text-muted-foreground text-sm">
                                                            {version.name}
                                                        </span>
                                                    )}
                                                    <Badge variant="outline" className={getChannelColor(version.channel)}>
                                                        {version.channel}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Icon icon="mdi:download" width="12" height="12" />
                                                        {version.downloadCount.toLocaleString()}
                                                    </span>
                                                    <span>
                                                        {version.publishedAt
                                                            ? formatDate(version.publishedAt)
                                                            : formatDate(version.createdAt)}
                                                    </span>
                                                    {version.primaryFile && (
                                                        <span className="flex items-center gap-1">
                                                            <FileIcon className="w-3 h-3" />
                                                            {formatFileSize(version.primaryFile.size)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Compatible Versions */}
                                                {version.compatibleVersions.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                                                        <span className="text-xs text-muted-foreground/60">Hytale:</span>
                                                        {version.compatibleVersions.slice(0, 3).map((cv) => (
                                                            <span
                                                                key={cv.hytaleVersion.id}
                                                                className="px-1.5 py-0.5 bg-secondary rounded text-xs text-foreground/70"
                                                            >
                                                                {cv.hytaleVersion.hytaleVersion}
                                                            </span>
                                                        ))}
                                                        {version.compatibleVersions.length > 3 && (
                                                            <span className="text-xs text-muted-foreground/60">
                                                                +{version.compatibleVersions.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {version.files.length > 1 && (
                                                    <button
                                                        onClick={() =>
                                                            setExpandedVersion(
                                                                expandedVersion === version.id ? null : version.id
                                                            )
                                                        }
                                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                    >
                                                        <Icon
                                                            icon={expandedVersion === version.id ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                                                            width="20"
                                                            height="20"
                                                            className="text-muted-foreground"
                                                        />
                                                    </button>
                                                )}
                                                <Button
                                                    onClick={() => handleDownload(version)}
                                                    disabled={!version.primaryFileId}
                                                    size="sm"
                                                    className="font-hebden"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Files List */}
                                        {expandedVersion === version.id && version.files.length > 1 && (
                                            <div className="border-t border-border/30 bg-secondary/20 p-3 space-y-2">
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Additional files:
                                                </p>
                                                {version.files.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg ${file.id === version.primaryFileId
                                                            ? 'bg-primary/10 border border-primary/20'
                                                            : 'bg-secondary/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm text-foreground truncate">
                                                                    {file.displayName || file.filename}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatFileSize(file.size)}
                                                                    {file.id === version.primaryFileId && (
                                                                        <span className="ml-2 text-primary">Primary</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDownload(version, file.id)}
                                                            className="flex-shrink-0"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </OrbisDialog>
    );
}
