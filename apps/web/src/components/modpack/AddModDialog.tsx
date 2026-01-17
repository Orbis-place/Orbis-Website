'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OrbisFormDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import {
    addPlatformMod,
    addCustomMod,
    type ModpackModEntry,
} from '@/lib/api/modpack';
import { ResourceType } from '@/lib/api/resources';

interface SearchResult {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    type: string;
}

interface VersionInfo {
    id: string;
    versionNumber: string;
    channel: string;
    status: string;
}

interface AddModDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resourceId: string;
    versionId: string;
    onModAdded: (entry: ModpackModEntry) => void;
}

export default function AddModDialog({
    open,
    onOpenChange,
    resourceId,
    versionId,
    onModAdded,
}: AddModDialogProps) {
    const [adding, setAdding] = useState(false);
    const [addType, setAddType] = useState<'platform' | 'custom'>('platform');

    // Platform mod form
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedMod, setSelectedMod] = useState<SearchResult | null>(null);
    const [modVersions, setModVersions] = useState<VersionInfo[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState('');
    const [notes, setNotes] = useState('');

    // Custom mod form
    const [customFile, setCustomFile] = useState<File | null>(null);
    const [customModName, setCustomModName] = useState('');
    const [customModVersion, setCustomModVersion] = useState('');

    // Reset form
    const resetForm = useCallback(() => {
        setAddType('platform');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedMod(null);
        setModVersions([]);
        setSelectedVersionId('');
        setNotes('');
        setCustomFile(null);
        setCustomModName('');
        setCustomModVersion('');
    }, []);

    // Reset when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open, resetForm]);

    // Search mods
    const searchMods = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources?search=${encodeURIComponent(query)}&type=${ResourceType.MOD}&limit=10`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const json = await response.json();
                setSearchResults(json.data || []);
            }
        } catch (error) {
            console.error('Failed to search mods:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchMods(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchMods]);

    // Fetch versions when mod is selected
    const fetchModVersions = useCallback(async (modId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${modId}/versions`,
                { credentials: 'include' }
            );
            if (response.ok) {
                const data = await response.json();
                // Only get approved versions
                const approvedVersions = (data.versions || []).filter(
                    (v: VersionInfo) => v.status === 'APPROVED'
                );
                setModVersions(approvedVersions);
                // Auto-select first version
                if (approvedVersions.length > 0) {
                    setSelectedVersionId(approvedVersions[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        }
    }, []);

    const handleSelectMod = (mod: SearchResult) => {
        setSelectedMod(mod);
        setSearchQuery('');
        setSearchResults([]);
        fetchModVersions(mod.id);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.jar')) {
                toast.error('Only JAR files are allowed');
                return;
            }
            if (file.size > 100 * 1024 * 1024) {
                toast.error('File too large. Maximum size is 100MB');
                return;
            }
            setCustomFile(file);
            // Auto-fill name from filename
            if (!customModName) {
                const name = file.name.replace('.jar', '').replace(/-/g, ' ');
                setCustomModName(name);
            }
        }
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            let entry: ModpackModEntry;

            if (addType === 'platform') {
                if (!selectedMod || !selectedVersionId) {
                    toast.error('Please select a mod and version');
                    return;
                }

                entry = await addPlatformMod(resourceId, versionId, {
                    modVersionId: selectedVersionId,
                    notes: notes || undefined,
                });
            } else {
                if (!customFile || !customModName || !customModVersion) {
                    toast.error('Please fill in all required fields');
                    return;
                }

                entry = await addCustomMod(resourceId, versionId, customFile, {
                    customModName,
                    customModVersion,
                    notes: notes || undefined,
                });
            }

            toast.success('Mod added successfully!');
            onModAdded(entry);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to add mod:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add mod');
        } finally {
            setAdding(false);
        }
    };

    const canSubmit = addType === 'platform'
        ? selectedMod && selectedVersionId
        : customFile && customModName && customModVersion;

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        if (!canSubmit) {
            e.preventDefault();
            return;
        }
        await handleSubmit(e);
    };

    return (
        <OrbisFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Add Mod"
            description="Add a mod to your modpack"
            onSubmit={handleSubmitWrapper}
            submitText={adding ? 'Adding...' : 'Add Mod'}
            submitLoading={adding || !canSubmit}
            size="lg"
        >
            <Tabs value={addType} onValueChange={(v) => setAddType(v as 'platform' | 'custom')}>
                <TabsList className="w-full mb-4 bg-[#032125] border border-[#084B54] p-1 rounded-[10px] h-[40px]">
                    <TabsTrigger
                        value="platform"
                        className="flex-1 gap-2 data-[state=active]:bg-[#109EB1] data-[state=active]:text-[#C7F4FA] text-[#C7F4FA]/60 font-hebden rounded-[8px] transition-all"
                    >
                        <Icon ssr={true} icon="mdi:cube" width="16" height="16" />
                        Orbis Mod
                    </TabsTrigger>
                    <TabsTrigger
                        value="custom"
                        className="flex-1 gap-2 data-[state=active]:bg-[#109EB1] data-[state=active]:text-[#C7F4FA] text-[#C7F4FA]/60 font-hebden rounded-[8px] transition-all"
                    >
                        <Icon ssr={true} icon="mdi:upload" width="16" height="16" />
                        Custom JAR
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="platform" className="space-y-4">
                    {/* Mod Search */}
                    {!selectedMod ? (
                        <div className="space-y-2">
                            <Label className="font-nunito">Search Mod</Label>
                            <div className="relative">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for a mod on Orbis..."
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
                                            onClick={() => handleSelectMod(result)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#032125] flex items-center justify-center overflow-hidden">
                                                {result.iconUrl ? (
                                                    <img src={result.iconUrl} alt={result.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon ssr={true} icon="mdi:cube" width="20" height="20" className="text-[#C7F4FA]/50" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-nunito font-semibold text-sm text-[#C7F4FA]">{result.name}</p>
                                                <p className="text-xs text-[#C7F4FA]/50">/{result.slug}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Selected Mod */}
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                                    {selectedMod.iconUrl ? (
                                        <img src={selectedMod.iconUrl} alt={selectedMod.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon ssr={true} icon="mdi:cube" width="24" height="24" className="text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-nunito font-semibold text-foreground">{selectedMod.name}</p>
                                    <p className="text-sm text-muted-foreground">/{selectedMod.slug}</p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedMod(null);
                                        setModVersions([]);
                                        setSelectedVersionId('');
                                    }}
                                >
                                    Change
                                </Button>
                            </div>

                            {/* Version Selection */}
                            <div className="space-y-2">
                                <Label className="font-nunito">Version *</Label>
                                {modVersions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No approved versions available</p>
                                ) : (
                                    <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modVersions.map((v) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.versionNumber} ({v.channel})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label className="font-nunito">Mod File (JAR) *</Label>
                        <div className="border-2 border-dashed border-[#084B54] rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                            <input
                                type="file"
                                accept=".jar"
                                onChange={handleFileChange}
                                className="hidden"
                                id="custom-mod-file"
                            />
                            <label htmlFor="custom-mod-file" className="cursor-pointer">
                                {customFile ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon ssr={true} icon="mdi:file-code" width="24" height="24" className="text-primary" />
                                        <span className="font-nunito text-foreground">{customFile.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            ({(customFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                                        <p className="font-nunito text-muted-foreground">
                                            Click to upload a JAR file
                                        </p>
                                        <p className="text-xs text-muted-foreground">Max 100MB</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-nunito">Mod Name *</Label>
                            <Input
                                value={customModName}
                                onChange={(e) => setCustomModName(e.target.value)}
                                placeholder="My Custom Mod"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-nunito">Version *</Label>
                            <Input
                                value={customModVersion}
                                onChange={(e) => setCustomModVersion(e.target.value)}
                                placeholder="1.0.0"
                                required
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Shared Options */}
                <div className="space-y-4 pt-4 border-t border-border mt-4">
                    <div className="space-y-2">
                        <Label className="font-nunito">Notes (optional)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this mod (config tips, compatibility info...)"
                            className="resize-none"
                            rows={2}
                        />
                    </div>
                </div>
            </Tabs>
        </OrbisFormDialog>
    );
}
