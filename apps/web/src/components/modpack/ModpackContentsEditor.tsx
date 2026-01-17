'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { Trash2, Plus, Settings, GripVertical, Upload, FileCode } from 'lucide-react';
import Link from 'next/link';
import AddModDialog from './AddModDialog';
import {
    getModpackByResourceId,
    getModpackEntries,
    removeModEntry,
    reorderModEntries,
    uploadModConfig,
    deleteModConfig,
    type ModpackModEntry,
    type Modpack,
} from '@/lib/api/modpack';

interface ModpackContentsEditorProps {
    resourceId: string;
    versionId: string;
    canEdit: boolean;
}

export default function ModpackContentsEditor({
    resourceId,
    versionId,
    canEdit,
}: ModpackContentsEditorProps) {
    const [modpack, setModpack] = useState<Modpack | null>(null);
    const [modEntries, setModEntries] = useState<ModpackModEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState<ModpackModEntry | null>(null);
    const [uploadingConfigFor, setUploadingConfigFor] = useState<string | null>(null);
    const [deletingConfigFor, setDeletingConfigFor] = useState<ModpackModEntry | null>(null);

    // Drag state
    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Fetch modpack data
    const fetchModpack = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getModpackByResourceId(resourceId);
            setModpack(data);
            const entries = await getModpackEntries(resourceId, versionId);
            setModEntries(entries || []);
        } catch (error) {
            console.error('Failed to fetch modpack:', error);
            // Modpack extension might not exist yet, that's ok
            setModEntries([]);
        } finally {
            setLoading(false);
        }
    }, [resourceId, versionId]);

    useEffect(() => {
        fetchModpack();
    }, [fetchModpack]);

    // Handle mod added
    const handleModAdded = (entry: ModpackModEntry) => {
        setModEntries((prev) => [...prev, entry]);
    };

    // Handle delete mod
    const handleDeleteMod = async () => {
        if (!deletingEntry) return;

        try {
            await removeModEntry(resourceId, versionId, deletingEntry.id);
            toast.success('Mod removed!');
            setModEntries((prev) => prev.filter((e) => e.id !== deletingEntry.id));
            setDeletingEntry(null);
        } catch (error) {
            console.error('Failed to remove mod:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to remove mod');
        }
    };


    // Handle config upload
    const handleConfigUpload = async (entryId: string, file: File) => {
        if (!file.name.endsWith('.zip')) {
            toast.error('Only ZIP files are allowed for configs');
            return;
        }

        try {
            const config = await uploadModConfig(resourceId, versionId, entryId, file);
            toast.success('Config uploaded!');
            setModEntries((prev) =>
                prev.map((e) => (e.id === entryId ? { ...e, config } : e))
            );
            setUploadingConfigFor(null);
        } catch (error) {
            console.error('Failed to upload config:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload config');
        }
    };

    // Handle config delete
    const handleDeleteConfig = async () => {
        if (!deletingConfigFor) return;

        try {
            await deleteModConfig(resourceId, versionId, deletingConfigFor.id);
            toast.success('Config deleted!');
            setModEntries((prev) =>
                prev.map((e) => (e.id === deletingConfigFor.id ? { ...e, config: undefined } : e))
            );
            setDeletingConfigFor(null);
        } catch (error) {
            console.error('Failed to delete config:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete config');
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, entryId: string) => {
        setDraggedId(entryId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) {
            setDraggedId(null);
            return;
        }

        const draggedIndex = modEntries.findIndex((e) => e.id === draggedId);
        const targetIndex = modEntries.findIndex((e) => e.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedId(null);
            return;
        }

        // Reorder locally first for immediate feedback
        const newEntries = [...modEntries];
        const [removed] = newEntries.splice(draggedIndex, 1);
        if (!removed) {
            setDraggedId(null);
            return;
        }
        newEntries.splice(targetIndex, 0, removed);
        setModEntries(newEntries);
        setDraggedId(null);

        // Send to API
        try {
            await reorderModEntries(
                resourceId,
                versionId,
                newEntries.map((e) => e.id)
            );
        } catch (error) {
            console.error('Failed to reorder mods:', error);
            toast.error('Failed to save order');
            // Revert on error
            fetchModpack();
        }
    };

    const handleDragEnd = () => {
        setDraggedId(null);
    };

    // Get mod display info
    const getModInfo = (entry: ModpackModEntry) => {
        if (entry.modVersion) {
            return {
                name: entry.modVersion.resource.name,
                version: entry.modVersion.versionNumber,
                icon: entry.modVersion.resource.iconUrl,
                slug: entry.modVersion.resource.slug,
                isCustom: false,
            };
        }
        return {
            name: entry.customModName || 'Unknown',
            version: entry.customModVersion || '?',
            icon: null,
            slug: null,
            isCustom: true,
        };
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Icon ssr={true} icon="mdi:loading" width="24" height="24" className="text-muted-foreground animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-nunito font-semibold text-sm text-foreground">
                    Mods ({modEntries.length})
                </h4>
                {canEdit && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Mod
                    </Button>
                )}
            </div>

            {modEntries.length === 0 ? (
                <div className="bg-secondary/50 rounded-lg p-8 text-center">
                    <Icon ssr={true} icon="mdi:package-variant" width="32" height="32" className="text-muted-foreground mx-auto mb-2" />
                    <p className="font-nunito text-muted-foreground mb-3">No mods in this modpack yet</p>
                    {canEdit && (
                        <Button size="sm" onClick={() => setIsAddOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add First Mod
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {modEntries.map((entry) => {
                        const info = getModInfo(entry);
                        const isDragging = draggedId === entry.id;

                        return (
                            <div
                                key={entry.id}
                                draggable={canEdit}
                                onDragStart={(e) => handleDragStart(e, entry.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, entry.id)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-transparent transition-all ${isDragging ? 'opacity-50 border-primary' : ''
                                    } ${canEdit ? 'cursor-move' : ''}`}
                            >
                                {/* Drag Handle */}
                                {canEdit && (
                                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}

                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-background/50 flex items-center justify-center flex-shrink-0">
                                    {info.icon ? (
                                        <img src={info.icon} alt={info.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon
                                            ssr={true}
                                            icon={info.isCustom ? 'mdi:file-code' : 'mdi:cube'}
                                            width="20"
                                            height="20"
                                            className="text-muted-foreground"
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {info.slug ? (
                                            <Link
                                                href={`/mod/${info.slug}`}
                                                target="_blank"
                                                className="font-nunito font-semibold text-sm text-foreground hover:text-primary transition-colors"
                                            >
                                                {info.name}
                                            </Link>
                                        ) : (
                                            <span className="font-nunito font-semibold text-sm text-foreground">
                                                {info.name}
                                            </span>
                                        )}
                                        <Badge variant="secondary" className="text-xs">
                                            v{info.version}
                                        </Badge>
                                        {info.isCustom && (
                                            <Badge variant="outline" className="text-xs">
                                                <FileCode className="w-3 h-3 mr-1" />
                                                Custom
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        {entry.config && (
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:cog" width="12" height="12" />
                                                Config: {entry.config.fileName} ({formatFileSize(entry.config.size)})
                                            </span>
                                        )}
                                        {entry.notes && (
                                            <span className="truncate max-w-xs" title={entry.notes}>
                                                {entry.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                {canEdit && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Config Upload */}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".zip"
                                                id={`config-upload-${entry.id}`}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleConfigUpload(entry.id, file);
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                            {entry.config ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="p-1.5 h-auto"
                                                    onClick={() => setDeletingConfigFor(entry)}
                                                    title="Delete config"
                                                >
                                                    <Settings className="w-4 h-4 text-primary" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="p-1.5 h-auto"
                                                    onClick={() => document.getElementById(`config-upload-${entry.id}`)?.click()}
                                                    title="Upload config"
                                                >
                                                    <Upload className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Delete */}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="p-1.5 h-auto text-destructive hover:text-destructive"
                                            onClick={() => setDeletingEntry(entry)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Mod Dialog */}
            <AddModDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                resourceId={resourceId}
                versionId={versionId}
                onModAdded={handleModAdded}
            />

            {/* Delete Mod Confirmation */}
            <OrbisConfirmDialog
                open={!!deletingEntry}
                onOpenChange={(open) => !open && setDeletingEntry(null)}
                title="Remove Mod"
                description={`Are you sure you want to remove "${deletingEntry ? getModInfo(deletingEntry).name : ''}" from this modpack?`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteMod}
            />

            {/* Delete Config Confirmation */}
            <OrbisConfirmDialog
                open={!!deletingConfigFor}
                onOpenChange={(open) => !open && setDeletingConfigFor(null)}
                title="Delete Config"
                description={`Are you sure you want to delete the config for "${deletingConfigFor ? getModInfo(deletingConfigFor).name : ''}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteConfig}
            />
        </div>
    );
}
