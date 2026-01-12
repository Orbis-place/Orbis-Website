"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, Calendar, FileText, ChevronDown, FileIcon, Loader2, Flag } from 'lucide-react';
import { useResource } from '@/contexts/ResourceContext';
import { Badge } from '@/components/ui/badge';
import { TiptapViewer } from '@/components/TiptapViewer';
import { Icon } from '@iconify/react';
import { ReportDialog } from '@/components/ReportDialog';

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

// ============================================
// HELPER FUNCTIONS
// ============================================

const getChannelColor = (channel: ResourceVersion['channel']) => {
    switch (channel) {
        case 'RELEASE': return 'bg-[#0D7A3D] text-[#5EE59C]';
        case 'BETA': return 'bg-[#7A4D0D] text-[#FFA94D]';
        case 'ALPHA': return 'bg-[#7A0D0D] text-[#FF7979]';
        case 'SNAPSHOT': return 'bg-purple-600 text-purple-200';
        default: return 'bg-gray-600 text-gray-200';
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
// CHANNEL BADGE COMPONENT
// ============================================

const ChannelBadge = ({ channel }: { channel: ResourceVersion['channel'] }) => {
    return (
        <div className={`w-9 h-9 ${getChannelColor(channel)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="font-hebden font-bold text-sm">{channel.charAt(0)}</span>
        </div>
    );
};

// ============================================
// VERSION ITEM COMPONENT
// ============================================

interface VersionItemProps {
    version: ResourceVersion;
    resourceId: string;
    resourceName: string;
}

const VersionItem = ({ version, resourceId, resourceName }: VersionItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    const handleDownload = (e: React.MouseEvent, fileId?: string) => {
        e.stopPropagation();
        const targetFileId = fileId || version.primaryFileId;
        if (!targetFileId) return;

        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${version.id}/download/${targetFileId}`;
        window.open(downloadUrl, '_blank');
    };

    const handleReport = (e: React.MouseEvent) => {
        e.stopPropagation();
        setReportDialogOpen(true);
    };

    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] overflow-hidden hover:border-[#109EB1] transition-colors">
            {/* Version Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <ChannelBadge channel={version.channel} />
                            <h3 className="font-hebden font-bold text-xl text-[#C7F4FA]">
                                v{version.versionNumber}
                            </h3>
                            {version.name && (
                                <span className="font-nunito text-base text-[#C7F4FA]/70">
                                    {version.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 font-nunito text-sm text-[#C7F4FA]/60">
                                <Calendar className="w-4 h-4" />
                                {version.publishedAt ? formatDate(version.publishedAt) : formatDate(version.createdAt)}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm mb-3">
                            <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                <Download className="w-4 h-4" />
                                {version.downloadCount.toLocaleString()} downloads
                            </span>
                            {version.primaryFile && (
                                <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                    <FileText className="w-4 h-4" />
                                    {formatFileSize(version.primaryFile.size)}
                                </span>
                            )}
                            {version.files.length > 1 && (
                                <span className="flex items-center gap-1.5 font-nunito text-[#C7F4FA]/70">
                                    <FileIcon className="w-4 h-4" />
                                    {version.files.length} files
                                </span>
                            )}
                        </div>

                        {/* Compatible Hytale Versions */}
                        <div className="flex flex-wrap gap-2">
                            {version.compatibleVersions.map((cv) => (
                                <span
                                    key={cv.hytaleVersion.id}
                                    className="px-3 py-1 bg-[#032125] rounded-full text-xs font-hebden font-semibold text-[#C7F4FA]/70"
                                >
                                    Hytale {cv.hytaleVersion.hytaleVersion}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReport}
                            className="p-2.5 hover:bg-destructive/10 rounded-full transition-colors group"
                            title="Report version"
                        >
                            <Flag className="w-5 h-5 text-[#C7F4FA]/50 group-hover:text-destructive" />
                        </button>
                        <button
                            onClick={(e) => handleDownload(e)}
                            disabled={!version.primaryFileId}
                            className="flex items-center gap-2 px-6 py-3 bg-[#109EB1] hover:bg-[#0D8A9A] disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-hebden font-bold text-base text-[#C7F4FA] transition-all shadow-lg whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" />
                            Download
                        </button>
                        <ChevronDown
                            className={`w-6 h-6 text-[#C7F4FA]/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>
            </button>

            {/* Expanded Content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-6 pb-6 pt-2 border-t border-[#084B54] space-y-4">
                    {/* Changelog */}
                    {version.changelog && (
                        <div>
                            <h4 className="font-hebden font-bold text-lg text-[#109EB1] mb-3">
                                Changelog
                            </h4>
                            <div className="bg-[#032125] rounded-lg p-4">
                                <TiptapViewer content={version.changelog} />
                            </div>
                        </div>
                    )}

                    {/* Files List */}
                    {version.files.length > 1 && (
                        <div>
                            <h4 className="font-hebden font-bold text-lg text-[#109EB1] mb-3">
                                Files
                            </h4>
                            <div className="space-y-2">
                                {version.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className={`flex items-center justify-between p-3 rounded-lg ${file.id === version.primaryFileId
                                            ? 'bg-[#109EB1]/10 border border-[#109EB1]/30'
                                            : 'bg-[#032125]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileIcon className="w-5 h-5 text-[#C7F4FA]/50 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-nunito text-sm text-[#C7F4FA] truncate">
                                                    {file.displayName || file.filename}
                                                </p>
                                                <p className="text-xs text-[#C7F4FA]/50">
                                                    {formatFileSize(file.size)}
                                                    {file.id === version.primaryFileId && (
                                                        <span className="ml-2 text-[#109EB1]">Primary</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDownload(e, file.id)}
                                            className="p-2 hover:bg-[#109EB1]/20 rounded-lg transition-colors"
                                        >
                                            <Download className="w-4 h-4 text-[#C7F4FA]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Dialog */}
            <ReportDialog
                type="resource_version"
                targetId={version.id}
                targetName={`${resourceName} v${version.versionNumber}`}
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
            />
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function VersionsPage() {
    const { resource } = useResource();
    const [loading, setLoading] = useState(true);
    const [versions, setVersions] = useState<ResourceVersion[]>([]);
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['RELEASE', 'BETA', 'ALPHA', 'SNAPSHOT']);

    const fetchVersions = useCallback(async () => {
        if (!resource?.id) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}/versions`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                // Only show approved versions on the public page
                const approvedVersions = (data.versions || []).filter(
                    (v: ResourceVersion) => v.status === 'APPROVED'
                );
                setVersions(approvedVersions);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setLoading(false);
        }
    }, [resource?.id]);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    if (!resource) return null;

    // Get unique channels from versions
    const availableChannels = [...new Set(versions.map(v => v.channel))];

    // Filter versions by selected channels
    const filteredVersions = versions.filter(v => selectedChannels.includes(v.channel));

    // Toggle channel filter
    const toggleChannel = (channel: string) => {
        setSelectedChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#109EB1]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Filters */}
            {versions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {(['RELEASE', 'BETA', 'ALPHA', 'SNAPSHOT'] as const)
                        .filter(ch => availableChannels.includes(ch))
                        .map(channel => (
                            <button
                                key={channel}
                                onClick={() => toggleChannel(channel)}
                                className={`px-4 py-2 rounded-full font-hebden font-semibold text-sm transition-all border border-[#084B54] ${selectedChannels.includes(channel)
                                    ? getChannelColor(channel)
                                    : 'bg-[#06363D] text-[#C7F4FA]/60 hover:text-[#C7F4FA]'
                                    }`}
                            >
                                {channel.charAt(0) + channel.slice(1).toLowerCase()}
                                <span className="ml-1.5 opacity-70">
                                    ({versions.filter(v => v.channel === channel).length})
                                </span>
                            </button>
                        ))}
                </div>
            )}

            {/* Versions List */}
            <div className="flex flex-col gap-4">
                {filteredVersions.length > 0 ? (
                    filteredVersions.map((version) => (
                        <VersionItem key={version.id} version={version} resourceId={resource.id} resourceName={resource.name} />
                    ))
                ) : versions.length === 0 ? (
                    <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-12 text-center">
                        <Icon icon="mdi:package-variant" width="48" height="48" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                        <p className="font-nunito text-lg text-[#C7F4FA]/60">
                            No versions available yet.
                        </p>
                    </div>
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
