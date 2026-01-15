'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OrbisFormDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { Trash2, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Types
interface MinVersionInfo {
    id: string;
    versionNumber: string;
}

interface DependencyResource {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string | null;
}

interface Dependency {
    id: string;
    dependencyType: 'REQUIRED' | 'OPTIONAL' | 'INCOMPATIBLE' | 'EMBEDDED';
    isInternal: boolean;
    dependencyResource?: DependencyResource | null;
    minVersion?: MinVersionInfo | null;
    externalName?: string | null;
    externalUrl?: string | null;
    externalMinVersion?: string | null;
    createdAt: string;
}

interface SearchResult {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    type: string;
    versions?: Array<{ id: string; versionNumber: string }>;
}

interface VersionDependenciesProps {
    resourceId: string;
    versionId: string;
    versionStatus: string;
    canEdit: boolean;
}

export default function VersionDependencies({
    resourceId,
    versionId,
    versionStatus,
    canEdit
}: VersionDependenciesProps) {
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    const [loading, setLoading] = useState(true);

    // Add dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [addType, setAddType] = useState<'internal' | 'external'>('internal');
    const [deletingDep, setDeletingDep] = useState<Dependency | null>(null);

    // Internal dependency form
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedResource, setSelectedResource] = useState<SearchResult | null>(null);
    const [resourceVersions, setResourceVersions] = useState<Array<{ id: string; versionNumber: string }>>([]);
    const [selectedMinVersionId, setSelectedMinVersionId] = useState('');
    const [internalDepType, setInternalDepType] = useState<'REQUIRED' | 'OPTIONAL' | 'INCOMPATIBLE' | 'EMBEDDED'>('REQUIRED');

    // External dependency form
    const [externalName, setExternalName] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [externalMinVersion, setExternalMinVersion] = useState('');
    const [externalDepType, setExternalDepType] = useState<'REQUIRED' | 'OPTIONAL' | 'INCOMPATIBLE' | 'EMBEDDED'>('REQUIRED');

    // Fetch dependencies
    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/dependencies`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                setDependencies(data.dependencies || []);
            }
        } catch (error) {
            console.error('Failed to fetch dependencies:', error);
        } finally {
            setLoading(false);
        }
    }, [resourceId, versionId]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    // Search resources
    const searchResources = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources?search=${encodeURIComponent(query)}&limit=10`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const json = await response.json();
                // API returns { data: [...], meta: {...} }
                const filtered = (json.data || []).filter((r: any) => r.id !== resourceId);
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Failed to search resources:', error);
        } finally {
            setSearching(false);
        }
    }, [resourceId]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchResources(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchResources]);

    // Fetch versions when resource is selected
    const fetchResourceVersions = useCallback(async (resId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resId}/versions`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                setResourceVersions(data.versions || []);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        }
    }, []);

    const handleSelectResource = (resource: SearchResult) => {
        setSelectedResource(resource);
        setSearchQuery('');
        setSearchResults([]);
        fetchResourceVersions(resource.id);
    };

    // Add dependency
    const handleAddDependency = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            const body = addType === 'internal'
                ? {
                    dependencyType: internalDepType,
                    dependencyResourceId: selectedResource?.id,
                    minVersionId: selectedMinVersionId && selectedMinVersionId !== 'none' ? selectedMinVersionId : undefined,
                }
                : {
                    dependencyType: externalDepType,
                    externalName,
                    externalUrl,
                    externalMinVersion: externalMinVersion || undefined,
                };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/dependencies`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(body),
                }
            );

            if (response.ok) {
                toast.success('Dependency added successfully!');
                setIsAddOpen(false);
                resetForm();
                fetchDependencies();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to add dependency');
            }
        } catch (error) {
            console.error('Failed to add dependency:', error);
            toast.error('Failed to add dependency');
        } finally {
            setAdding(false);
        }
    };

    // Delete dependency
    const handleDeleteDependency = async () => {
        if (!deletingDep) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/versions/${versionId}/dependencies/${deletingDep.id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                toast.success('Dependency removed!');
                setDeletingDep(null);
                fetchDependencies();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to remove dependency');
            }
        } catch (error) {
            console.error('Failed to remove dependency:', error);
            toast.error('Failed to remove dependency');
        }
    };

    const resetForm = () => {
        setAddType('internal');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedResource(null);
        setResourceVersions([]);
        setSelectedMinVersionId('');
        setInternalDepType('REQUIRED');
        setExternalName('');
        setExternalUrl('');
        setExternalMinVersion('');
        setExternalDepType('REQUIRED');
    };

    const getDependencyTypeLabel = (type: string) => {
        switch (type) {
            case 'REQUIRED': return 'Required';
            case 'OPTIONAL': return 'Optional';
            case 'INCOMPATIBLE': return 'Incompatible';
            case 'EMBEDDED': return 'Embedded';
            default: return type;
        }
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
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-nunito font-semibold text-sm text-foreground">
                    Dependencies ({dependencies.length})
                </h4>
                {canEdit && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                )}
            </div>

            {dependencies.length === 0 ? (
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <Icon ssr={true} icon="mdi:source-branch" width="24" height="24" className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No dependencies declared</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {dependencies.map((dep) => (
                        <div
                            key={dep.id}
                            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                        >
                            {/* Icon */}
                            <div className="w-8 h-8 rounded-md overflow-hidden bg-background/50 flex items-center justify-center flex-shrink-0">
                                {dep.isInternal && dep.dependencyResource?.iconUrl ? (
                                    <img
                                        src={dep.dependencyResource.iconUrl}
                                        alt={dep.dependencyResource.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Icon
                                        ssr={true}
                                        icon={dep.isInternal ? "mdi:cube" : "mdi:link-variant"}
                                        width="16"
                                        height="16"
                                        className="text-muted-foreground"
                                    />
                                )}
                            </div>

                            {/* Name and type */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-nunito font-semibold text-sm text-foreground truncate">
                                        {dep.isInternal ? dep.dependencyResource?.name : dep.externalName}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        {getDependencyTypeLabel(dep.dependencyType)}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground font-nunito">
                                    {dep.isInternal
                                        ? dep.minVersion ? `Min: ${dep.minVersion.versionNumber}` : 'Any version'
                                        : dep.externalMinVersion || 'Any version'
                                    }
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {dep.isInternal && dep.dependencyResource && (
                                    <Link
                                        href={`/mod/${dep.dependencyResource.slug}`}
                                        target="_blank"
                                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                )}
                                {!dep.isInternal && dep.externalUrl && (
                                    <a
                                        href={dep.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </a>
                                )}
                                {canEdit && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-1.5 h-auto text-destructive hover:text-destructive"
                                        onClick={() => setDeletingDep(dep)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Dependency Dialog */}
            <OrbisFormDialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsAddOpen(open);
                }}
                title="Add Dependency"
                description="Add a dependency for this version"
                onSubmit={handleAddDependency}
                submitText={adding ? 'Adding...' : 'Add Dependency'}
                submitLoading={adding}
                size="lg"
            >
                <Tabs value={addType} onValueChange={(v) => setAddType(v as 'internal' | 'external')}>
                    <TabsList className="w-full mb-4 bg-[#032125] border border-[#084B54] p-1 rounded-[10px] h-[40px]">
                        <TabsTrigger
                            value="internal"
                            className="flex-1 gap-2 data-[state=active]:bg-[#109EB1] data-[state=active]:text-[#C7F4FA] text-[#C7F4FA]/60 font-hebden rounded-[8px] transition-all"
                        >
                            <Icon ssr={true} icon="mdi:cube" width="16" height="16" />
                            Orbis Resource
                        </TabsTrigger>
                        <TabsTrigger
                            value="external"
                            className="flex-1 gap-2 data-[state=active]:bg-[#109EB1] data-[state=active]:text-[#C7F4FA] text-[#C7F4FA]/60 font-hebden rounded-[8px] transition-all"
                        >
                            <Icon ssr={true} icon="mdi:link-variant" width="16" height="16" />
                            External
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="internal" className="space-y-4">
                        {/* Resource Search */}
                        {!selectedResource ? (
                            <div className="space-y-2">
                                <Label className="font-nunito">Search Resource</Label>
                                <div className="relative">
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for a resource..."
                                    />
                                    {searching && (
                                        <Icon ssr={true} icon="mdi:loading" className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" width="16" height="16" />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="border border-[#084B54] rounded-lg overflow-hidden max-h-48 overflow-y-auto bg-[#06363D]">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                type="button"
                                                className="w-full flex items-center gap-3 p-3 hover:bg-[#109EB1]/20 transition-colors text-left border-b border-[#084B54] last:border-b-0"
                                                onClick={() => handleSelectResource(result)}
                                            >
                                                <div className="w-8 h-8 rounded-[8px] bg-[#032125] flex items-center justify-center overflow-hidden">
                                                    {result.iconUrl ? (
                                                        <img src={result.iconUrl} alt={result.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon ssr={true} icon="mdi:cube" width="16" height="16" className="text-[#C7F4FA]/50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-nunito font-semibold text-sm text-[#C7F4FA]">{result.name}</p>
                                                    <p className="text-xs text-[#C7F4FA]/50 capitalize">{result.type?.toLowerCase()}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Selected Resource */}
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center overflow-hidden">
                                        {selectedResource.iconUrl ? (
                                            <img src={selectedResource.iconUrl} alt={selectedResource.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon ssr={true} icon="mdi:cube" width="20" height="20" className="text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-nunito font-semibold">{selectedResource.name}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setSelectedResource(null);
                                            setResourceVersions([]);
                                            setSelectedMinVersionId('');
                                        }}
                                    >
                                        Change
                                    </Button>
                                </div>

                                {/* Min Version */}
                                <div className="space-y-2">
                                    <Label className="font-nunito">Minimum Version (optional)</Label>
                                    <Select value={selectedMinVersionId} onValueChange={setSelectedMinVersionId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Any version</SelectItem>
                                            {resourceVersions.map((v) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.versionNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dependency Type */}
                                <div className="space-y-2">
                                    <Label className="font-nunito">Dependency Type</Label>
                                    <Select value={internalDepType} onValueChange={(v: any) => setInternalDepType(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="REQUIRED">Required</SelectItem>
                                            <SelectItem value="OPTIONAL">Optional</SelectItem>
                                            <SelectItem value="INCOMPATIBLE">Incompatible</SelectItem>
                                            <SelectItem value="EMBEDDED">Embedded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="external" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-nunito">Name *</Label>
                            <Input
                                value={externalName}
                                onChange={(e) => setExternalName(e.target.value)}
                                placeholder="Fabric API"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-nunito">URL *</Label>
                            <Input
                                value={externalUrl}
                                onChange={(e) => setExternalUrl(e.target.value)}
                                placeholder="https://www.curseforge.com/hytale/mods/advanced-item-info"
                                type="url"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-nunito">Minimum Version (optional)</Label>
                            <Input
                                value={externalMinVersion}
                                onChange={(e) => setExternalMinVersion(e.target.value)}
                                placeholder="0.90.0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-nunito">Dependency Type</Label>
                            <Select value={externalDepType} onValueChange={(v: any) => setExternalDepType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="REQUIRED">Required</SelectItem>
                                    <SelectItem value="OPTIONAL">Optional</SelectItem>
                                    <SelectItem value="INCOMPATIBLE">Incompatible</SelectItem>
                                    <SelectItem value="EMBEDDED">Embedded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                </Tabs>
            </OrbisFormDialog>

            {/* Delete Confirmation */}
            <OrbisConfirmDialog
                open={!!deletingDep}
                onOpenChange={(open) => !open && setDeletingDep(null)}
                title="Remove Dependency"
                description={`Are you sure you want to remove "${deletingDep?.isInternal ? deletingDep?.dependencyResource?.name : deletingDep?.externalName}" as a dependency?`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteDependency}
            />
        </div>
    );
}
