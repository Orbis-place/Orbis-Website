'use client';

import { useState, useEffect, useCallback } from 'react';
import { useResource } from '@/contexts/ResourceContext';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DependencyLinearView from '@/components/resources/dependencies/DependencyLinearView';
import DependencyGraphView from '@/components/resources/dependencies/DependencyGraphView';
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

export interface Dependency {
    id: string;
    dependencyType: 'REQUIRED' | 'OPTIONAL' | 'INCOMPATIBLE' | 'EMBEDDED';
    isInternal: boolean;
    // Internal
    dependencyResource?: DependencyResource | null;
    minVersion?: MinVersionInfo | null;
    // External
    externalName?: string | null;
    externalUrl?: string | null;
    externalMinVersion?: string | null;
    createdAt: string;
}

export default function DependenciesPage() {
    const { resource, isLoading: resourceLoading } = useResource();
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'linear' | 'graph'>('linear');

    const fetchDependencies = useCallback(async () => {
        if (!resource?.id || !resource?.latestVersion?.id) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}/versions/${resource.latestVersion.id}/dependencies`,
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
    }, [resource?.id, resource?.latestVersion?.id]);

    useEffect(() => {
        if (resource?.id) {
            fetchDependencies();
        }
    }, [resource?.id, fetchDependencies]);

    if (resourceLoading || loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    if (!resource?.latestVersion) {
        return (
            <div className="bg-secondary/30 rounded-lg p-8 text-center">
                <Icon ssr={true} icon="mdi:source-branch" width="48" height="48" className="text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-nunito text-lg mb-2">No version available</p>
                <p className="text-muted-foreground font-nunito text-sm">
                    Dependencies will appear once a version is published.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="font-hebden text-xl font-bold text-foreground">Dependencies</h2>
                    <p className="text-muted-foreground font-nunito text-sm">
                        Version {resource.latestVersion.versionNumber} requires the following dependencies
                    </p>
                </div>

                {/* View Toggle */}
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'linear' | 'graph')}>
                    <TabsList className="bg-secondary/50">
                        <TabsTrigger value="linear" className="gap-2 font-nunito">
                            <Icon ssr={true} icon="mdi:format-list-bulleted" width="16" height="16" />
                            List
                        </TabsTrigger>
                        <TabsTrigger value="graph" className="gap-2 font-nunito">
                            <Icon ssr={true} icon="mdi:graph" width="16" height="16" />
                            Graph
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Summary */}
            {dependencies.length > 0 && (
                <Badge variant="secondary" className="w-fit">
                    {dependencies.length} {dependencies.length === 1 ? 'dependency' : 'dependencies'}
                </Badge>
            )}

            {/* Content */}
            {dependencies.length === 0 ? (
                <div className="bg-secondary/30 rounded-lg p-8 text-center">
                    <Icon ssr={true} icon="mdi:source-branch" width="48" height="48" className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-nunito text-lg mb-2">No dependencies</p>
                    <p className="text-muted-foreground font-nunito text-sm">
                        This resource has no declared dependencies.
                    </p>
                </div>
            ) : viewMode === 'linear' ? (
                <DependencyLinearView dependencies={dependencies} />
            ) : (
                <DependencyGraphView
                    dependencies={dependencies}
                    resourceName={resource.name}
                    resourceSlug={resource.slug}
                    resourceIcon={resource.iconUrl}
                />
            )}
        </div>
    );
}
