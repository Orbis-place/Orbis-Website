'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { Trash2, Plus, GripVertical, Upload, Settings, FileCode, Package, FileArchive, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AddModDialog from '@/components/modpack/AddModDialog';
import {
    getModpackByResourceId,
    getModpackEntries,
    removeModEntry,
    reorderModEntries,
    uploadModConfig,
    deleteModConfig,
    updateVersionBuildStrategy,
    uploadCompleteZip,
    ModpackBuildStrategy,
    type ModpackModEntry,
    type Modpack,
} from '@/lib/api/modpack';

export default function ConfigureModpackPage() {
    const params = useParams();
    const router = useRouter();
    const resourceSlug = params.slug as string;
    const versionId = params.versionId as string;
    const type = params.type as string;

    const [modpack, setModpack] = useState<Modpack | null>(null);
    const [modEntries, setModEntries] = useState<ModpackModEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Build strategy
    const [buildStrategy, setBuildStrategy] = useState<ModpackBuildStrategy>(
        ModpackBuildStrategy.CONFIGURATOR
    );
    const [completeZipFile, setCompleteZipFile] = useState<any>(null);
    const [uploadingZip, setUploadingZip] = useState(false);

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState<ModpackModEntry | null>(null);
    const [deletingConfigFor, setDeletingConfigFor] = useState<ModpackModEntry | null>(null);

    // Drag state
    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Fetch modpack data
    const fetchModpack = useCallback(async () => {
        setLoading(true);
        try {
            // We need resourceId first. We can get it from the slug.
            // Since we don't have resourceId immediately from params (only slug), 
            // we use getModpackBySlug which is available in api/modpack or we fetch resource first.
            // Let's use the one that gets by resourceId from the component but here we have slug.
            // Wait, getModpackByResourceId in the previous code was used because resourceId was passed as prop.
            // Here we have slug. Let's refer to getModpackBySlug in lib/api/modpack.ts if it exists.
            // It does exist: getModpackBySlug(slug).

            // Actually, let's fetch by slug to get the full object including resourceId
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/modpacks/${resourceSlug}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch modpack');
            const data = await response.json();

            setModpack(data);

            // Fetch entries for this version
            const entries = await getModpackEntries(data.resourceId, versionId);
            setModEntries(entries || []);

            // Initial strategy from the specific version we are editing
            const currentVersion = data.resource.versions?.find((v: any) => v.id === versionId) ||
                (data.resource.latestVersion?.id === versionId ? data.resource.latestVersion : null);

            if (currentVersion?.buildStrategy) {
                setBuildStrategy(currentVersion.buildStrategy);
            } else {
                setBuildStrategy(ModpackBuildStrategy.CONFIGURATOR);
            }

            // TODO: Load complete zip file info if exists for this version
            // We might need to fetch version details specifically if not fully included in modpack response
            // For now assuming modpack response might have what we need or we stick to defaults.
        } catch (error) {
            console.error('Failed to fetch modpack:', error);
            toast.error('Failed to load modpack data');
        } finally {
            setLoading(false);
        }
    }, [resourceSlug, versionId]);

    useEffect(() => {
        fetchModpack();
    }, [fetchModpack]);

    // Handle build strategy change
    const handleStrategyChange = async (newStrategy: ModpackBuildStrategy) => {
        if (!modpack) return;

        try {
            await updateVersionBuildStrategy(
                modpack.resourceId,
                versionId,
                newStrategy
            );
            setBuildStrategy(newStrategy);
            toast.success(`Switched to ${newStrategy === ModpackBuildStrategy.COMPLETE_ZIP ? 'Complete Zip' : 'Configurator'} mode`);

            // Reload to ensure sync
            fetchModpack();
        } catch (error) {
            console.error('Failed to update build strategy:', error);
            toast.error('Failed to update strategy');
        }
    };

    // Handle complete zip upload
    const handleCompleteZipUpload = async (file: File) => {
        if (!modpack) return;

        if (!file.name.endsWith('.zip')) {
            toast.error('Only ZIP files are allowed');
            return;
        }

        setUploadingZip(true);
        try {
            const result = await uploadCompleteZip(
                modpack.resourceId,
                versionId,
                file
            );
            setCompleteZipFile(result);
            toast.success('Complete zip uploaded!');
        } catch (error) {
            console.error('Failed to upload zip:', error);
            toast.error('Failed to upload zip');
        } finally {
            setUploadingZip(false);
        }
    };

    // Handle mod added
    const handleModAdded = (entry: ModpackModEntry) => {
        setModEntries((prev) => [...prev, entry]);
    };

    // Handle delete mod
    const handleDeleteMod = async () => {
        if (!deletingEntry || !modpack) return;

        try {
            await removeModEntry(modpack.resourceId, versionId, deletingEntry.id);
            toast.success('Mod removed!');
            setModEntries((prev) => prev.filter((e) => e.id !== deletingEntry.id));
            setDeletingEntry(null);
        } catch (error) {
            console.error('Failed to remove mod:', error);
            toast.error('Failed to remove mod');
        }
    };

    // Handle config upload
    const handleConfigUpload = async (entryId: string, file: File) => {
        if (!modpack) return;

        if (!file.name.endsWith('.zip')) {
            toast.error('Only ZIP files are allowed for configs');
            return;
        }

        try {
            const config = await uploadModConfig(modpack.resourceId, versionId, entryId, file);
            toast.success('Config uploaded!');
            setModEntries((prev) =>
                prev.map((e) => (e.id === entryId ? { ...e, config } : e))
            );
        } catch (error) {
            console.error('Failed to upload config:', error);
            toast.error('Failed to upload config');
        }
    };

    // Handle config delete
    const handleDeleteConfig = async () => {
        if (!deletingConfigFor || !modpack) return;

        try {
            await deleteModConfig(modpack.resourceId, versionId, deletingConfigFor.id);
            toast.success('Config deleted!');
            setModEntries((prev) =>
                prev.map((e) => (e.id === deletingConfigFor.id ? { ...e, config: undefined } : e))
            );
            setDeletingConfigFor(null);
        } catch (error) {
            console.error('Failed to delete config:', error);
            toast.error('Failed to delete config');
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
        if (!draggedId || draggedId === targetId || !modpack) {
            setDraggedId(null);
            return;
        }

        const draggedIndex = modEntries.findIndex((e) => e.id === draggedId);
        const targetIndex = modEntries.findIndex((e) => e.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedId(null);
            return;
        }

        // Reorder locally first
        const newEntries = [...modEntries];
        const removed = newEntries.splice(draggedIndex, 1)[0];
        if (removed) {
            newEntries.splice(targetIndex, 0, removed);
            setModEntries(newEntries);
            setDraggedId(null);
        } else {
            setDraggedId(null);
            return;
        }

        // Send to API
        try {
            await reorderModEntries(
                modpack.resourceId,
                versionId,
                newEntries.map((e) => e.id)
            );
        } catch (error) {
            console.error('Failed to reorder mods:', error);
            toast.error('Failed to save order');
            fetchModpack();
        }
    };

    const handleDragEnd = () => {
        setDraggedId(null);
    };

    // Helpers
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

    // Back to versions page
    const goBack = () => {
        router.push(`/${type}/${resourceSlug}/manage/versions`);
    };

    // Check if we need to show strategy selection
    const needsStrategySelection = (): boolean => {
        // Technically strict null check. If it's loaded and we have a strategy, we don't need selection.
        // If it's loaded and strategy is undefined/null, we do.
        // We set default to CONFIGURATOR if null in fetchModpack but maybe we should allow "null" state for selection UI?
        // In fetchModpack I added logic to default to CONFIGURATOR if not set, 
        // effectively skipping selection screen unless we want to force it for new versions?
        // Let's stick to the previous logic: check the actual data from the version.

        if (loading || !modpack) return false;

        const currentVersion = modpack.resource.versions?.find((v: any) => v.id === versionId) ||
            (modpack.resource.latestVersion?.id === versionId ? modpack.resource.latestVersion : null);

        return !currentVersion?.buildStrategy;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="32" height="32" className="text-primary animate-spin" />
            </div>
        );
    }

    if (!modpack) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Modpack not found</p>
                <Button variant="outline" onClick={goBack} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="font-hebden text-2xl font-bold text-foreground">
                        Configure Modpack
                    </h1>
                    <p className="text-muted-foreground font-nunito text-sm">
                        Manage mods and configurations for this version
                    </p>
                </div>
            </div>

            {needsStrategySelection() ? (
                <div className="space-y-6 py-4">
                    <div className="text-center space-y-2">
                        <h3 className="font-hebden text-xl text-foreground">
                            Choose Your Modpack Strategy
                        </h3>
                        <p className="font-nunito text-muted-foreground max-w-lg mx-auto">
                            Select how you want to distribute your modpack. You can change this later.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {/* Configurator Option */}
                        <button
                            onClick={() => handleStrategyChange(ModpackBuildStrategy.CONFIGURATOR)}
                            className="group p-6 rounded-xl border-2 border-border bg-secondary/30 hover:border-primary hover:bg-secondary/50 transition-all text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <Settings className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-nunito font-bold text-foreground mb-2">
                                        Configurator
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Build your modpack from individual mods. Users download mods automatically from Orbis.
                                        You can specify configurations for each mod.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Complete Zip Option */}
                        <button
                            onClick={() => handleStrategyChange(ModpackBuildStrategy.COMPLETE_ZIP)}
                            className="group p-6 rounded-xl border-2 border-border bg-secondary/30 hover:border-primary hover:bg-secondary/50 transition-all text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <FileArchive className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-nunito font-bold text-foreground mb-2">
                                        Complete Zip
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Upload your entire modpack as a single ZIP file. Best if you have custom mods
                                        or want full control over the file structure.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Strategy Selector & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg w-fit">
                            <button
                                onClick={() => handleStrategyChange(ModpackBuildStrategy.CONFIGURATOR)}
                                className={`px-4 py-2 rounded-md text-sm font-nunito font-medium transition-all ${buildStrategy === ModpackBuildStrategy.CONFIGURATOR
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Configurator
                                </div>
                            </button>
                            <button
                                onClick={() => handleStrategyChange(ModpackBuildStrategy.COMPLETE_ZIP)}
                                className={`px-4 py-2 rounded-md text-sm font-nunito font-medium transition-all ${buildStrategy === ModpackBuildStrategy.COMPLETE_ZIP
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileArchive className="w-4 h-4" />
                                    Complete Zip
                                </div>
                            </button>
                        </div>

                        {buildStrategy === ModpackBuildStrategy.CONFIGURATOR && (
                            <Button
                                onClick={() => setIsAddOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Mod
                            </Button>
                        )}
                    </div>

                    {/* Complete Zip Mode */}
                    {buildStrategy === ModpackBuildStrategy.COMPLETE_ZIP && (
                        <div className="space-y-4">
                            {/* Format Warning */}
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Icon ssr={true} icon="mdi:alert-circle-outline" width="20" height="20" className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-nunito font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                            Required ZIP Structure
                                        </p>
                                        <pre className="font-mono text-xs text-muted-foreground bg-background/50 p-3 rounded-md overflow-x-auto">
                                            {`modpack.zip
├── mod1.jar              # JARs at root level
├── mod2.jar
├── ModName_Config/       # Config folders (unzipped)
│   ├── config.toml
│   └── settings.json
└── AnotherMod_Config/
    └── options.yml`}
                                        </pre>
                                        <p className="text-muted-foreground mt-2">
                                            Place all JAR files at the root of the archive. Config folders should be decompressed (not zipped) inside the archive.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-secondary/30 rounded-xl border-2 border-dashed border-border">
                                <input
                                    type="file"
                                    accept=".zip"
                                    id="complete-zip-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleCompleteZipUpload(file);
                                        }
                                        e.target.value = '';
                                    }}
                                />
                                {completeZipFile ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileArchive className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-nunito font-semibold text-foreground">
                                                    {completeZipFile.fileName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(completeZipFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                setCompleteZipFile(null);
                                                toast.info('Upload a new zip file');
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="complete-zip-upload"
                                        className="cursor-pointer flex flex-col items-center justify-center gap-3"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-nunito font-semibold text-foreground">
                                                {uploadingZip ? 'Uploading...' : 'Upload Complete Zip'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Your pre-built modpack as a single ZIP file
                                            </p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mod List - Only show if Configurator mode */}
                    {buildStrategy === ModpackBuildStrategy.CONFIGURATOR && (
                        <div className="space-y-4">
                            {modEntries.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-secondary/10">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <Package className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="font-hebden text-xl text-foreground mb-2">
                                        Empty Modpack
                                    </h3>
                                    <p className="font-nunito text-muted-foreground mb-8 max-w-md mx-auto">
                                        Start by adding mods to your modpack. You can add mods from Orbis or upload custom JAR files.
                                    </p>
                                    <Button
                                        size="lg"
                                        onClick={() => setIsAddOpen(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add First Mod
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {modEntries.map((entry) => {
                                        const info = getModInfo(entry);
                                        const isDragging = draggedId === entry.id;

                                        return (
                                            <div
                                                key={entry.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, entry.id)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, entry.id)}
                                                onDragEnd={handleDragEnd}
                                                className={`flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border transition-all cursor-move ${isDragging ? 'opacity-50 border-primary' : 'border-transparent hover:border-border'
                                                    }`}
                                            >
                                                {/* Drag Handle */}
                                                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

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
                                                                href={`/${type}/${info.slug}`}
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
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                        {entry.config && (
                                                            <span className="flex items-center gap-1 text-primary">
                                                                <Settings className="w-3 h-3" />
                                                                {entry.config.fileName} ({formatFileSize(entry.config.size)})
                                                            </span>
                                                        )}
                                                        {entry.notes && (
                                                            <span className="truncate max-w-[200px]" title={entry.notes}>
                                                                {entry.notes}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
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
                                                                title="Upload config (ZIP)"
                                                            >
                                                                <Upload className="w-4 h-4 text-muted-foreground" />
                                                                <span className="sr-only">Upload config</span>
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="p-1.5 h-auto text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingEntry(entry)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <AddModDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                resourceId={modpack.resourceId}
                versionId={versionId}
                onModAdded={handleModAdded}
            />

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
