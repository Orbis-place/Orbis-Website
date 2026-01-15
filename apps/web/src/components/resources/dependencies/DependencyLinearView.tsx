'use client';

import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Dependency } from '@/app/(app)/(resources)/[type]/[slug]/(with-header)/dependencies/page';

interface DependencyLinearViewProps {
    dependencies: Dependency[];
}

const getDependencyTypeLabel = (type: Dependency['dependencyType']) => {
    switch (type) {
        case 'REQUIRED': return 'Required';
        case 'OPTIONAL': return 'Optional';
        case 'INCOMPATIBLE': return 'Incompatible';
        case 'EMBEDDED': return 'Embedded';
        default: return type;
    }
};

export default function DependencyLinearView({ dependencies }: DependencyLinearViewProps) {
    const renderDependency = (dep: Dependency) => {
        return (
            <div
                key={dep.id}
                className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                    {dep.isInternal && dep.dependencyResource?.iconUrl ? (
                        <img
                            src={dep.dependencyResource.iconUrl}
                            alt={dep.dependencyResource.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Icon ssr={true} icon={dep.isInternal ? "mdi:cube" : "mdi:link-variant"} width="24" height="24" className="text-muted-foreground" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {dep.isInternal && dep.dependencyResource ? (
                            <Link
                                href={`/mod/${dep.dependencyResource.slug}`}
                                className="font-hebden font-semibold text-foreground hover:text-primary transition-colors"
                            >
                                {dep.dependencyResource.name}
                            </Link>
                        ) : (
                            <a
                                href={dep.externalUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-hebden font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                                {dep.externalName}
                                <Icon ssr={true} icon="mdi:open-in-new" width="14" height="14" />
                            </a>
                        )}

                        <Badge variant="secondary" className="text-xs">
                            {getDependencyTypeLabel(dep.dependencyType)}
                        </Badge>

                        {dep.isInternal ? (
                            <Badge variant="secondary" className="text-xs">
                                <Icon ssr={true} icon="mdi:cube" width="12" height="12" className="mr-1" />
                                Orbis
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs">
                                <Icon ssr={true} icon="mdi:link-variant" width="12" height="12" className="mr-1" />
                                External
                            </Badge>
                        )}
                    </div>

                    {/* Version info */}
                    <div className="text-sm text-muted-foreground font-nunito mt-1">
                        {dep.isInternal && dep.minVersion ? (
                            <span>Minimum version: {dep.minVersion.versionNumber}</span>
                        ) : dep.externalMinVersion ? (
                            <span>Minimum version: {dep.externalMinVersion}</span>
                        ) : (
                            <span>Any version</span>
                        )}
                    </div>
                </div>

                {/* External link */}
                {dep.isInternal && dep.dependencyResource && (
                    <Link
                        href={`/mod/${dep.dependencyResource.slug}`}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Icon ssr={true} icon="mdi:arrow-right" width="20" height="20" />
                    </Link>
                )}
                {!dep.isInternal && dep.externalUrl && (
                    <a
                        href={dep.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Icon ssr={true} icon="mdi:open-in-new" width="20" height="20" />
                    </a>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {dependencies.map(renderDependency)}
        </div>
    );
}
