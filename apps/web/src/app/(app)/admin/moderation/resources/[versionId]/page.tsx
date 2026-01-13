'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FileExplorer } from '@/components/admin/FileExplorer';
import { VirusTotalScanner } from '@/components/admin/VirusTotalScanner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Reusing types from previous page or defining new ones specific to detail view
interface ResourceVersionDetail {
    id: string;
    versionNumber: string;
    channel: string;
    status: string;
    createdAt: string;
    primaryFileId?: string;
    primaryFile?: {
        id: string;
        filename: string;
        size: number;
    };
    resource: {
        id: string;
        name: string;
        slug: string;
        type: string;
        summary: string;
        ownerUser: {
            username: string;
            image: string | null;
        } | null;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ResourceModerationPage() {
    const params = useParams();
    const router = useRouter();
    const [version, setVersion] = useState<ResourceVersionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<any[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (params.versionId) {
            fetchVersionDetails(params.versionId as string);
        }
    }, [params.versionId]);

    const fetchVersionDetails = async (id: string) => {
        try {
            // Note: We might need a specific endpoint for fetching single version details for admin
            // For now, I'll fetch the list and find it, or we assume we can fetch it via general resource endpoints
            // Actually, let's use the public endpoint for details but careful about auth
            // Or better, let's create a getPendingResourceVersions that returns full details 
            // BUT since we don't have a single-version admin endpoint yet, I will misuse the public one or filter

            // Wait, I can fetch the file structure immediately if I have the versionId, relying on backend to check permissions

            // Let's first get the version "meta" (I'll implement a fetch from the list endpoint for now, inefficient but safe)
            const versionsRes = await fetch(`${API_URL}/admin/moderation/pending-resource-versions`, { credentials: 'include' });
            if (versionsRes.ok) {
                const versions = await versionsRes.json();
                const found = versions.find((v: any) => v.id === id);
                if (found) {
                    setVersion(found);
                    // If we have a primary file, fetch its structure immediately
                    // The pending list version doesn't always have primaryFile url populated directly
                    // We might need to fetch the resource public version to get the file url
                    // OR we hack it: assuming we can construct the URL if we knew the filename/path

                    // Actually, let's just try to fetch files using the download URL as the fileUrl (since backend ModerationService downloads it)
                    // The backend `getFileStructure` expects a `fileUrl`. 
                    // We can construct the internal download URL: `${API_URL}/resources/${found.resource.id}/versions/${found.id}/download`
                    // BUT that endpoint redirects to the public URL.

                    // Let's assume for this implementation that we trigger the file fetch using the download endpoint
                    const downloadUrl = `${API_URL}/resources/${found.resource.id}/versions/${found.id}/download`;
                    fetchFiles(id, downloadUrl);
                } else {
                    // It might be already approved?
                    toast.error('Version not found in pending queue');
                    router.push('/admin/moderation');
                }
            }
        } catch (err) {
            console.error('Failed to fetch details:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFiles = async (versionId: string, fileUrl: string) => {
        setFilesLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/moderation/versions/${versionId}/files?fileUrl=${encodeURIComponent(fileUrl)}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setFiles(data);

                // Try to auto-select plugin.yml or README
                const readme = data.find((f: any) => f.name.toLowerCase().startsWith('readme'));
                const pluginYml = data.find((f: any) => f.name.toLowerCase() === 'plugin.yml');
                if (pluginYml) handleFileSelect(fileUrl, pluginYml.path);
                else if (readme) handleFileSelect(fileUrl, readme.path);

            }
        } catch (err) {
            console.error('Failed to fetch files:', err);
        } finally {
            setFilesLoading(false);
        }
    };

    const handleFileSelect = async (fileUrl: string, path: string) => {
        setSelectedFile(path);
        setContentLoading(true);
        setFileContent(null);
        try {
            // Re-construct the download URL if needed, but we passed it down
            // Ideally we store it in state
            // For now, I'll reconstruct it based on version (risky if state not ready)
            if (!version) return;
            const downloadUrl = `${API_URL}/resources/${version.resource.id}/versions/${version.id}/download`;

            const res = await fetch(`${API_URL}/admin/moderation/versions/${version.id}/files/content?fileUrl=${encodeURIComponent(downloadUrl)}&path=${encodeURIComponent(path)}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.type === 'binary') {
                    setFileContent('Binary file - cannot view content');
                } else {
                    setFileContent(data.content);
                }
            } else {
                setFileContent('Failed to load content');
            }
        } catch (err) {
            setFileContent('Error loading content');
        } finally {
            setContentLoading(false);
        }
    };

    const handleAction = async (action: 'APPROVE' | 'REJECT') => {
        if (!version) return;

        let reason = undefined;
        if (action === 'REJECT') {
            reason = prompt('Reason for rejection:');
            if (!reason) return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/moderation/resource-versions/${version.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action, reason }),
            });

            if (!response.ok) throw new Error('Action failed');

            toast.success(`Version ${action === 'APPROVE' ? 'approved' : 'rejected'}`);
            router.push('/admin/moderation');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Icon ssr={true} icon="mdi:loading" className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!version) return null;

    const downloadUrl = `${API_URL}/resources/${version.resource.id}/versions/${version.id}/download`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0 -ml-2 text-muted-foreground hover:text-foreground">
                            <Icon ssr={true} icon="mdi:arrow-left" className="w-5 h-5" />
                        </Button>
                        <h1 className="font-hebden text-2xl font-bold text-foreground">
                            Review Submission
                        </h1>
                    </div>
                    <p className="font-nunito text-muted-foreground">
                        {version.resource.name} • v{version.versionNumber}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        onClick={() => handleAction('REJECT')}
                        disabled={actionLoading}
                    >
                        <Icon ssr={true} icon="mdi:close" className="mr-2" />
                        Reject
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction('APPROVE')}
                        disabled={actionLoading}
                    >
                        <Icon ssr={true} icon="mdi:check" className="mr-2" />
                        Approve
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details & Scanner */}
                <div className="space-y-6">
                    {/* Meta Info */}
                    <div className="bg-secondary/30 rounded-lg p-5 border border-border/30">
                        <h2 className="font-hebden text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                            Metadata
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon ssr={true} icon="mdi:account" className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {version.resource.ownerUser?.username || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Author</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="text-sm font-medium">{version.resource.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Channel</p>
                                    <p className="text-sm font-medium">{version.channel}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Submitted</p>
                                    <p className="text-sm font-medium">
                                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Version</p>
                                    <p className="text-sm font-medium">{version.versionNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VriusTotal Scanner */}
                    <VirusTotalScanner
                        versionId={version.id}
                        fileUrl={downloadUrl}
                    />

                    {/* Quick Info */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Icon ssr={true} icon="mdi:information-outline" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-200/80">
                                This version is currently <strong>{version.status}</strong>.
                                It is not visible to the public until approved.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: File Explorer & Content */}
                <div className="lg:col-span-2 space-y-4">
                    <FileExplorer
                        files={files}
                        loading={filesLoading}
                        selectedFile={selectedFile || undefined}
                        onSelectFile={(path) => handleFileSelect(downloadUrl, path)}
                    />

                    <div className="bg-secondary/20 rounded-lg border border-border/30 min-h-[400px] flex flex-col">
                        <div className="px-4 py-2 border-b border-border/30 bg-secondary/40 flex items-center justify-between">
                            <h3 className="font-mono text-xs text-muted-foreground">
                                {selectedFile || 'No file selected'}
                            </h3>
                            {selectedFile && (
                                <Badge variant="outline" className="text-[10px] h-5">
                                    READ-ONLY
                                </Badge>
                            )}
                        </div>
                        <div className="flex-1 p-0 overflow-hidden relative">
                            {contentLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                                    <Icon ssr={true} icon="mdi:loading" className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : fileContent ? (
                                <pre className="p-4 text-xs font-mono overflow-auto h-[400px] text-foreground/80">
                                    {fileContent}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                    <Icon ssr={true} icon="mdi:code-tags" className="w-12 h-12 mb-2" />
                                    <p>Select a file to view content</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Badge component to reuse if not imported
function Badge({ className, variant, children }: any) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            "bg-secondary text-secondary-foreground",
            className
        )}>
            {children}
        </span>
    );
}
