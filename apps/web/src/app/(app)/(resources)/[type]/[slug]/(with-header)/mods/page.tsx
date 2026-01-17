'use client';

import { useState, useEffect, useCallback } from 'react';
import { useResource } from '@/contexts/ResourceContext';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { getModpackBySlug, type ModpackModEntry, type Modpack } from '@/lib/api/modpack';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ModsPage() {
    const { resource, isLoading: resourceLoading } = useResource();
    const [modpack, setModpack] = useState<Modpack | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchModpack = useCallback(async () => {
        if (!resource?.slug || resource.type !== 'MODPACK') {
            setLoading(false);
            return;
        }

        try {
            const data = await getModpackBySlug(resource.slug);
            setModpack(data);
        } catch (error) {
            console.error('Failed to fetch modpack:', error);
        } finally {
            setLoading(false);
        }
    }, [resource?.slug, resource?.type]);

    useEffect(() => {
        if (resource?.slug) {
            fetchModpack();
        }
    }, [resource?.slug, fetchModpack]);

    if (resourceLoading || loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    if (resource?.type !== 'MODPACK') {
        return (
            <div className="bg-secondary/30 rounded-lg p-8 text-center">
                <Icon ssr={true} icon="mdi:package-variant" width="48" height="48" className="text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-nunito text-lg mb-2">Not a modpack</p>
                <p className="text-muted-foreground font-nunito text-sm">
                    This page is only available for modpacks.
                </p>
            </div>
        );
    }

    const modEntries = modpack?.modEntries || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="font-hebden text-xl font-bold text-foreground">Included Mods</h2>
                    <p className="text-muted-foreground font-nunito text-sm">
                        This modpack includes the following mods
                    </p>
                </div>
            </div>

            {/* Summary */}
            {modEntries.length > 0 && (
                <Badge variant="secondary" className="w-fit">
                    {modEntries.length} {modEntries.length === 1 ? 'mod' : 'mods'}
                </Badge>
            )}

            {/* Content */}
            {modEntries.length === 0 ? (
                <div className="bg-secondary/30 rounded-lg p-8 text-center">
                    <Icon ssr={true} icon="mdi:package-variant" width="48" height="48" className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-nunito text-lg mb-2">No mods yet</p>
                    <p className="text-muted-foreground font-nunito text-sm">
                        This modpack doesn't have any mods configured.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {modEntries.map((entry) => (
                        <ModEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ModEntryCard({ entry }: { entry: ModpackModEntry }) {
    const isPlatformMod = !!entry.modVersionId && !!entry.modVersion;
    const isCustomMod = !!entry.customModName;

    const modName = isPlatformMod
        ? entry.modVersion?.resource.name
        : entry.customModName;

    const modVersion = isPlatformMod
        ? entry.modVersion?.versionNumber
        : entry.customModVersion;

    const modIcon = isPlatformMod
        ? entry.modVersion?.resource.iconUrl
        : null;

    const modSlug = isPlatformMod
        ? entry.modVersion?.resource.slug
        : null;

    return (
        <div className="bg-secondary/30 rounded-lg p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
            {/* Icon */}
            <div className="flex-shrink-0">
                {modIcon ? (
                    <Image
                        src={modIcon}
                        alt={modName || 'Mod'}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon
                            ssr={true}
                            icon={isCustomMod ? "mdi:file-code" : "mdi:puzzle"}
                            width="24"
                            height="24"
                            className="text-muted-foreground"
                        />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {isPlatformMod && modSlug ? (
                        <Link
                            href={`/mod/${modSlug}`}
                            className="font-nunito font-semibold text-foreground hover:text-primary transition-colors truncate"
                        >
                            {modName}
                        </Link>
                    ) : (
                        <span className="font-nunito font-semibold text-foreground truncate">
                            {modName}
                        </span>
                    )}
                    {isCustomMod && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                            Custom
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {modVersion && (
                        <span className="flex items-center gap-1">
                            <Icon ssr={true} icon="mdi:tag" width="14" height="14" />
                            v{modVersion}
                        </span>
                    )}
                    {entry.config && (
                        <span className="flex items-center gap-1 text-primary">
                            <Icon ssr={true} icon="mdi:cog" width="14" height="14" />
                            Config included
                        </span>
                    )}
                    {entry.customModFile && (
                        <span className="flex items-center gap-1">
                            <Icon ssr={true} icon="mdi:file" width="14" height="14" />
                            {formatBytes(entry.customModFile.size)}
                        </span>
                    )}
                </div>
                {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {entry.notes}
                    </p>
                )}
            </div>

            {/* Actions */}
            {isPlatformMod && modSlug && (
                <Link
                    href={`/mod/${modSlug}`}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                    <Icon ssr={true} icon="mdi:arrow-right" width="20" height="20" className="text-muted-foreground" />
                </Link>
            )}
        </div>
    );
}
