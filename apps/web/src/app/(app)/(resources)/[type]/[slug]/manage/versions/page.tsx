'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { OrbisConfirmDialog, OrbisFormDialog } from '@/components/OrbisDialog';
import { Trash2, Upload, FileIcon, Check, X, Send, RefreshCw, Settings } from 'lucide-react';
import { TiptapEditor } from '@/components/TiptapEditor';
import { TiptapViewer } from '@/components/TiptapViewer';
import VersionDependencies from '@/components/resources/dependencies/VersionDependencies';


// ============================================
// TYPES
// ============================================

interface HytaleVersion {
    id: string;
    hytaleVersion: string;
    name?: string;
}

interface VersionFile {
    id: string;
    filename: string;
    displayName?: string;
    fileType: string;
    size: number;
    url: string;
    uploadedAt: string;
}

interface ResourceVersion {
    id: string;
    versionNumber: string;
    name?: string;
    channel: 'RELEASE' | 'BETA' | 'ALPHA' | 'SNAPSHOT';
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
    changelog?: string;
    rejectionReason?: string;
    downloadCount: number;
    createdAt: string;
    publishedAt?: string;
    primaryFileId?: string;
    primaryFile?: VersionFile;
    files: VersionFile[];
    buildStrategy?: 'COMPLETE_ZIP' | 'CONFIGURATOR';
    compatibleVersions: Array<{
        hytaleVersion: HytaleVersion;
    }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStatusColor = (status: ResourceVersion['status']) => {
    switch (status) {
        case 'APPROVED': return 'bg-green-500/20 text-green-500 border-green-500/30';
        case 'PENDING': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
        case 'DRAFT': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        case 'REJECTED': return 'bg-red-500/20 text-red-500 border-red-500/30';
        case 'ARCHIVED': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const getStatusIcon = (status: ResourceVersion['status']) => {
    switch (status) {
        case 'APPROVED': return 'mdi:check-circle';
        case 'PENDING': return 'mdi:clock-outline';
        case 'DRAFT': return 'mdi:file-document-edit-outline';
        case 'REJECTED': return 'mdi:close-circle';
        case 'ARCHIVED': return 'mdi:archive';
        default: return 'mdi:help-circle';
    }
};

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
// MAIN COMPONENT
// ============================================

export default function ManageVersionsPage() {
    const params = useParams();
    const resourceSlug = params.slug as string;

    // State
    const [loading, setLoading] = useState(true);
    const [resourceId, setResourceId] = useState<string>('');
    const [resourceType, setResourceType] = useState<string>('');
    const [versions, setVersions] = useState<ResourceVersion[]>([]);
    const [hytaleVersions, setHytaleVersions] = useState<HytaleVersion[]>([]);

    // Create version dialog
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newVersion, setNewVersion] = useState({
        versionNumber: '',
        name: '',
        channel: 'RELEASE' as const,
        compatibleHytaleVersionIds: [] as string[],
    });

    // Edit version state
    const [editingVersion, setEditingVersion] = useState<ResourceVersion | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        channel: 'RELEASE' as ResourceVersion['channel'],
        compatibleHytaleVersionIds: [] as string[],
    });
    const [updating, setUpdating] = useState(false);

    // Changelog editing
    const [editingChangelog, setEditingChangelog] = useState<string | null>(null);
    const [changelogText, setChangelogText] = useState('');
    const [savingChangelog, setSavingChangelog] = useState(false);

    // File upload
    const [uploadingVersionId, setUploadingVersionId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Delete
    const [deletingVersion, setDeletingVersion] = useState<ResourceVersion | null>(null);
    const [deletingFile, setDeletingFile] = useState<{ versionId: string; file: VersionFile } | null>(null);

    // Expanded versions for file view
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

    // Current user state for upload limits
    const [currentUser, setCurrentUser] = useState<{ isVerifiedCreator: boolean } | null>(null);

    // ============================================
    // DATA FETCHING
    // ============================================

    const fetchResource = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${resourceSlug}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setResourceId(data.resource.id);
                setResourceType(data.resource.type);
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to load resource');
        }
    }, [resourceSlug]);

    const fetchVersions = useCallback(async () => {
        if (!resourceId) return;
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setVersions(data.versions || []);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
            toast.error('Failed to load versions');
        } finally {
            setLoading(false);
        }
    }, [resourceId]);

    const fetchHytaleVersions = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/hytale-versions`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setHytaleVersions(Array.isArray(data) ? data : (data.versions || []));
            }
        } catch (error) {
            console.error('Failed to fetch Hytale versions:', error);
        }
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    }, []);

    useEffect(() => {
        fetchResource();
        fetchHytaleVersions();
        fetchCurrentUser();
    }, [fetchResource, fetchHytaleVersions, fetchCurrentUser]);

    useEffect(() => {
        if (resourceId) {
            fetchVersions();
        }
    }, [resourceId, fetchVersions]);

    // ============================================
    // VERSION CRUD
    // ============================================

    const handleCreateVersion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVersion.versionNumber.trim()) {
            toast.error('Version number is required');
            return;
        }
        if (newVersion.compatibleHytaleVersionIds.length === 0) {
            toast.error('Please select at least one compatible Hytale version');
            return;
        }

        setCreating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newVersion),
            });

            if (response.ok) {
                toast.success('Version created successfully!');
                setIsCreateOpen(false);
                setNewVersion({
                    versionNumber: '',
                    name: '',
                    channel: 'RELEASE',
                    compatibleHytaleVersionIds: [],
                });
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to create version');
            }
        } catch (error) {
            console.error('Failed to create version:', error);
            toast.error('Failed to create version');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateVersion = async (versionId: string) => {
        setUpdating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                toast.success('Version updated successfully!');
                setEditingVersion(null);
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update version');
            }
        } catch (error) {
            console.error('Failed to update version:', error);
            toast.error('Failed to update version');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteVersion = async () => {
        if (!deletingVersion) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${deletingVersion.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Version deleted successfully!');
                setDeletingVersion(null);
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to delete version');
            }
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version');
        }
    };

    // ============================================
    // CHANGELOG
    // ============================================

    const handleSaveChangelog = async (versionId: string) => {
        setSavingChangelog(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/changelog`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ changelog: changelogText }),
            });

            if (response.ok) {
                toast.success('Changelog saved!');
                setEditingChangelog(null);
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to save changelog');
            }
        } catch (error) {
            console.error('Failed to save changelog:', error);
            toast.error('Failed to save changelog');
        } finally {
            setSavingChangelog(false);
        }
    };

    // ============================================
    // FILE MANAGEMENT
    // ============================================

    const handleFileUpload = async (versionId: string, file: File) => {
        // Validation for file size
        const isVerified = currentUser?.isVerifiedCreator || false;
        const maxSize = isVerified ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 2GB vs 100MB

        if (file.size > maxSize) {
            toast.error(
                `File too large. Limit is ${formatFileSize(maxSize)}.`
            );
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/files`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                toast.success('File uploaded successfully!');
                setUploadingVersionId(null);
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async () => {
        if (!deletingFile) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${deletingFile.versionId}/files/${deletingFile.file.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('File deleted successfully!');
                setDeletingFile(null);
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to delete file');
            }
        } catch (error) {
            console.error('Failed to delete file:', error);
            toast.error('Failed to delete file');
        }
    };

    const handleSetPrimaryFile = async (versionId: string, fileId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/files/primary`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fileId }),
            });

            if (response.ok) {
                toast.success('Primary file set!');
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to set primary file');
            }
        } catch (error) {
            console.error('Failed to set primary file:', error);
            toast.error('Failed to set primary file');
        }
    };

    // ============================================
    // WORKFLOW ACTIONS
    // ============================================

    const handleSubmitVersion = async (versionId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/submit`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Version submitted for review!');
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to submit version');
            }
        } catch (error) {
            console.error('Failed to submit version:', error);
            toast.error('Failed to submit version');
        }
    };

    const handleResubmitVersion = async (versionId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/resubmit`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Version resubmitted for review!');
                fetchVersions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to resubmit version');
            }
        } catch (error) {
            console.error('Failed to resubmit version:', error);
            toast.error('Failed to resubmit version');
        }
    };

    // ============================================
    // HELPERS
    // ============================================

    const toggleVersionExpanded = (versionId: string) => {
        const newExpanded = new Set(expandedVersions);
        if (newExpanded.has(versionId)) {
            newExpanded.delete(versionId);
        } else {
            newExpanded.add(versionId);
        }
        setExpandedVersions(newExpanded);
    };

    const canEditMetadata = (version: ResourceVersion) => {
        return version.status === 'DRAFT' || version.status === 'REJECTED';
    };

    const canEditChangelogAndFiles = (version: ResourceVersion) => {
        return version.status === 'DRAFT' || version.status === 'REJECTED';
    };

    const canSubmit = (version: ResourceVersion) => {
        if (resourceType === 'MODPACK') {
            // COMPLETE_ZIP mode requires a file
            if (version.buildStrategy === 'COMPLETE_ZIP') {
                return version.status === 'DRAFT' && version.files.length > 0 && version.primaryFileId;
            }
            // CONFIGURATOR mode only needs status (mod entries checked by backend)
            return version.status === 'DRAFT';
        }
        return version.status === 'DRAFT' && version.files.length > 0 && version.primaryFileId;
    };

    const canResubmit = (version: ResourceVersion) => {
        if (resourceType === 'MODPACK') {
            // COMPLETE_ZIP mode requires a file
            if (version.buildStrategy === 'COMPLETE_ZIP') {
                return version.status === 'REJECTED' && version.files.length > 0 && version.primaryFileId;
            }
            // CONFIGURATOR mode only needs status (mod entries checked by backend)
            return version.status === 'REJECTED';
        }
        return version.status === 'REJECTED' && version.files.length > 0 && version.primaryFileId;
    };

    // ============================================
    // RENDER
    // ============================================

    if (loading && !versions.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-hebden text-2xl font-bold text-foreground">Versions</h1>
                    <p className="text-muted-foreground font-nunito text-sm">
                        Manage your resource versions and releases
                    </p>
                </div>

                <Button onClick={() => setIsCreateOpen(true)} className="font-hebden">
                    <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
                    New Version
                </Button>
            </div>

            {/* Versions List */}
            <div className="space-y-4">
                {versions.length === 0 ? (
                    <div className="bg-secondary/30 rounded-lg p-12 text-center">
                        <div className="bg-secondary p-4 rounded-full mb-4 inline-block">
                            <Icon ssr={true} icon="mdi:tag-multiple" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-nunito text-lg mb-2">No versions yet</p>
                        <p className="text-muted-foreground font-nunito text-sm mb-6 max-w-md mx-auto">
                            Create your first version to start publishing your resource
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)} className="font-hebden">
                            <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
                            Create First Version
                        </Button>
                    </div>
                ) : (
                    versions.map((version) => (
                        <div key={version.id} className="bg-secondary/30 rounded-lg overflow-hidden">
                            {/* Version Header */}
                            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <button
                                        onClick={() => toggleVersionExpanded(version.id)}
                                        className="p-1 hover:bg-secondary/50 rounded transition-colors"
                                    >
                                        <Icon ssr={true} icon={expandedVersions.has(version.id) ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                                            width="24"
                                            height="24"
                                            className="text-muted-foreground"
                                        />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-hebden text-lg font-semibold text-foreground">
                                                v{version.versionNumber}
                                            </span>
                                            {version.name && (
                                                <span className="text-muted-foreground font-nunito">
                                                    — {version.name}
                                                </span>
                                            )}
                                            <Badge variant="outline" className={getChannelColor(version.channel)}>
                                                {version.channel}
                                            </Badge>
                                            <Badge variant="outline" className={getStatusColor(version.status)}>
                                                <Icon ssr={true} icon={getStatusIcon(version.status)} width="14" height="14" className="mr-1" />
                                                {version.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground font-nunito">
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:download" width="14" height="14" />
                                                {version.downloadCount} downloads
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:file-multiple" width="14" height="14" />
                                                {version.files.length} file{version.files.length !== 1 ? 's' : ''}
                                            </span>
                                            <span>Created {formatDate(version.createdAt)}</span>
                                        </div>

                                        {/* Rejection reason */}
                                        {version.status === 'REJECTED' && version.rejectionReason && (
                                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                                                <p className="text-sm text-red-400 font-nunito">
                                                    <Icon ssr={true} icon="mdi:alert-circle" width="14" height="14" className="inline mr-1" />
                                                    <strong>Rejection reason:</strong> {version.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {canSubmit(version) && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleSubmitVersion(version.id)}
                                            className="font-nunito"
                                        >
                                            <Send className="w-4 h-4 mr-1" />
                                            Submit
                                        </Button>
                                    )}

                                    {canResubmit(version) && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleResubmitVersion(version.id)}
                                            className="font-nunito"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-1" />
                                            Resubmit
                                        </Button>
                                    )}

                                    {canEditMetadata(version) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingVersion(version);
                                                setEditForm({
                                                    name: version.name || '',
                                                    channel: version.channel,
                                                    compatibleHytaleVersionIds: version.compatibleVersions.map(cv => cv.hytaleVersion.id),
                                                });
                                            }}
                                        >
                                            <Icon ssr={true} icon="mdi:pencil" width="16" height="16" />
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeletingVersion(version)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedVersions.has(version.id) && (
                                <div className="border-t border-border p-4 space-y-6">
                                    {/* Compatible Versions */}
                                    <div>
                                        <h4 className="font-nunito font-semibold text-sm text-foreground mb-2">
                                            Compatible Hytale Versions
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {version.compatibleVersions.map((cv) => (
                                                <Badge key={cv.hytaleVersion.id} variant="secondary">
                                                    {cv.hytaleVersion.hytaleVersion}
                                                    {cv.hytaleVersion.name && ` - ${cv.hytaleVersion.name}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Changelog */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-nunito font-semibold text-sm text-foreground">
                                                Changelog
                                            </h4>
                                            {canEditChangelogAndFiles(version) && editingChangelog !== version.id && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingChangelog(version.id);
                                                        setChangelogText(version.changelog || '');
                                                    }}
                                                >
                                                    <Icon ssr={true} icon="mdi:pencil" width="14" height="14" className="mr-1" />
                                                    Edit
                                                </Button>
                                            )}
                                        </div>

                                        {editingChangelog === version.id ? (
                                            <div className="space-y-3">
                                                <TiptapEditor
                                                    content={changelogText}
                                                    onChange={setChangelogText}
                                                    placeholder="Write your changelog here..."
                                                    minHeight="200px"
                                                    versionId={version.id}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSaveChangelog(version.id)}
                                                        disabled={savingChangelog}
                                                    >
                                                        {savingChangelog ? (
                                                            <Icon ssr={true} icon="mdi:loading" width="16" height="16" className="animate-spin mr-1" />
                                                        ) : (
                                                            <Check className="w-4 h-4 mr-1" />
                                                        )}
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingChangelog(null)}
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-secondary/50 rounded-lg p-4">
                                                {version.changelog ? (
                                                    <TiptapViewer content={version.changelog} />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No changelog yet</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Files - Hidden for modpacks */}
                                    {resourceType !== 'MODPACK' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-nunito font-semibold text-sm text-foreground">
                                                    Files
                                                </h4>
                                                {canEditChangelogAndFiles(version) && (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            id={`file-upload-${version.id}`}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handleFileUpload(version.id, file);
                                                                }
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => document.getElementById(`file-upload-${version.id}`)?.click()}
                                                            disabled={uploading}
                                                        >
                                                            {uploading ? (
                                                                <Icon ssr={true} icon="mdi:loading" width="14" height="14" className="animate-spin mr-1" />
                                                            ) : (
                                                                <Upload className="w-4 h-4 mr-1" />
                                                            )}
                                                            Upload File
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {version.files.length === 0 ? (
                                                <div className="bg-secondary/50 rounded-lg p-8 text-center">
                                                    <FileIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {version.files.map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border ${file.id === version.primaryFileId
                                                                ? 'border-primary/50 bg-primary/5'
                                                                : 'border-border bg-secondary/50'
                                                                }`}
                                                        >
                                                            <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-nunito font-semibold text-foreground truncate">
                                                                        {file.displayName || file.filename}
                                                                    </span>
                                                                    {file.id === version.primaryFileId && (
                                                                        <Badge variant="default" className="text-xs">
                                                                            Primary
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground font-nunito">
                                                                    {formatFileSize(file.size)} • {file.fileType}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                {file.id !== version.primaryFileId && canEditChangelogAndFiles(version) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleSetPrimaryFile(version.id, file.id)}
                                                                        title="Set as primary"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                {canEditChangelogAndFiles(version) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-destructive hover:text-destructive"
                                                                        onClick={() => setDeletingFile({ versionId: version.id, file })}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Modpack Contents - Only for modpacks */}
                                    {resourceType === 'MODPACK' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-nunito font-semibold text-sm text-foreground">
                                                    Mods
                                                </h4>
                                                <Badge variant="secondary" className="font-nunito">
                                                    View in configuration
                                                </Badge>
                                            </div>
                                            <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Icon ssr={true} icon="mdi:package-variant" width="20" height="20" className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-nunito font-semibold text-sm text-foreground">
                                                            Configure modpack content
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Add mods, manage configs, and organize your modpack
                                                        </p>
                                                    </div>
                                                </div>
                                                {canEditChangelogAndFiles(version) && (
                                                    <Link
                                                        href={`/${params.type}/${resourceSlug}/manage/versions/${version.id}/modpack`}
                                                    >
                                                        <Button size="sm" className="gap-2">
                                                            <Settings className="w-4 h-4" />
                                                            Configure Content
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dependencies - Hidden for modpacks */}
                                    {resourceType !== 'MODPACK' && (
                                        <VersionDependencies
                                            resourceId={resourceId}
                                            versionId={version.id}
                                            versionStatus={version.status}
                                            canEdit={canEditChangelogAndFiles(version)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Version Dialog */}
            <OrbisFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Create New Version"
                description="Create a new version for your resource"
                onSubmit={handleCreateVersion}
                submitText={creating ? 'Creating...' : 'Create Version'}
                submitLoading={creating}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="versionNumber" className="font-nunito">Version Number *</Label>
                            <Input
                                id="versionNumber"
                                value={newVersion.versionNumber}
                                onChange={(e) => setNewVersion({ ...newVersion, versionNumber: e.target.value })}
                                placeholder="1.0.0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-nunito">Version Name (optional)</Label>
                            <Input
                                id="name"
                                value={newVersion.name}
                                onChange={(e) => setNewVersion({ ...newVersion, name: e.target.value })}
                                placeholder="The Big Update"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-nunito">Release Channel *</Label>
                        <Select
                            value={newVersion.channel}
                            onValueChange={(value: any) => setNewVersion({ ...newVersion, channel: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RELEASE">Release (Stable)</SelectItem>
                                <SelectItem value="BETA">Beta (Testing)</SelectItem>
                                <SelectItem value="ALPHA">Alpha (Early Access)</SelectItem>
                                <SelectItem value="SNAPSHOT">Snapshot (Development)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-nunito">Compatible Hytale Versions *</Label>
                        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg min-h-[48px]">
                            {hytaleVersions.map((hv) => {
                                const isSelected = newVersion.compatibleHytaleVersionIds.includes(hv.id);
                                return (
                                    <button
                                        key={hv.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setNewVersion({
                                                    ...newVersion,
                                                    compatibleHytaleVersionIds: newVersion.compatibleHytaleVersionIds.filter(id => id !== hv.id),
                                                });
                                            } else {
                                                setNewVersion({
                                                    ...newVersion,
                                                    compatibleHytaleVersionIds: [...newVersion.compatibleHytaleVersionIds, hv.id],
                                                });
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-md text-sm font-nunito transition-colors ${isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                            }`}
                                    >
                                        {hv.hytaleVersion}
                                    </button>
                                );
                            })}
                            {hytaleVersions.length === 0 && (
                                <span className="text-muted-foreground text-sm">No Hytale versions available</span>
                            )}
                        </div>
                    </div>
                </div>
            </OrbisFormDialog>

            {/* Edit Version Dialog */}
            <OrbisFormDialog
                open={!!editingVersion}
                onOpenChange={(open) => !open && setEditingVersion(null)}
                title={`Edit Version ${editingVersion?.versionNumber}`}
                description="Update version metadata"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (editingVersion) handleUpdateVersion(editingVersion.id);
                }}
                submitText={updating ? 'Saving...' : 'Save Changes'}
                submitLoading={updating}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="font-nunito">Version Name (optional)</Label>
                        <Input
                            id="edit-name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="The Big Update"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-nunito">Release Channel</Label>
                        <Select
                            value={editForm.channel}
                            onValueChange={(value: any) => setEditForm({ ...editForm, channel: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RELEASE">Release (Stable)</SelectItem>
                                <SelectItem value="BETA">Beta (Testing)</SelectItem>
                                <SelectItem value="ALPHA">Alpha (Early Access)</SelectItem>
                                <SelectItem value="SNAPSHOT">Snapshot (Development)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-nunito">Compatible Hytale Versions</Label>
                        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg min-h-[48px]">
                            {hytaleVersions.map((hv) => {
                                const isSelected = editForm.compatibleHytaleVersionIds.includes(hv.id);
                                return (
                                    <button
                                        key={hv.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setEditForm({
                                                    ...editForm,
                                                    compatibleHytaleVersionIds: editForm.compatibleHytaleVersionIds.filter(id => id !== hv.id),
                                                });
                                            } else {
                                                setEditForm({
                                                    ...editForm,
                                                    compatibleHytaleVersionIds: [...editForm.compatibleHytaleVersionIds, hv.id],
                                                });
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-md text-sm font-nunito transition-colors ${isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                                            }`}
                                    >
                                        {hv.hytaleVersion}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </OrbisFormDialog>

            {/* Delete Version Confirmation */}
            <OrbisConfirmDialog
                open={!!deletingVersion}
                onOpenChange={(open) => !open && setDeletingVersion(null)}
                title="Delete Version"
                description={`Are you sure you want to delete version ${deletingVersion?.versionNumber}? This will also delete all associated files.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteVersion}
            />

            {/* Delete File Confirmation */}
            <OrbisConfirmDialog
                open={!!deletingFile}
                onOpenChange={(open) => !open && setDeletingFile(null)}
                title="Delete File"
                description={`Are you sure you want to delete "${deletingFile?.file.filename}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteFile}
            />
        </div>
    );
}
