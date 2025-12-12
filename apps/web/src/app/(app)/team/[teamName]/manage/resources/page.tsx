'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { CreateResourceDialog } from '@/components/CreateResourceDialog';
import { toast } from 'sonner';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Resource {
    id: string;
    name: string;
    slug: string;
    type: 'PLUGIN' | 'MOD' | 'WORLD' | 'DATA_PACK' | 'ASSET_PACK' | 'PREFAB' | 'MODPACK';
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';
    tagline?: string;
    iconUrl?: string;
    downloadCount: number;
    likeCount: number;
    viewCount: number;
}

export default function TeamResourcesPage() {
    const params = useParams();
    const router = useRouter();
    const teamName = params.teamName as string;

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

    useEffect(() => {
        fetchResources();
    }, [teamName]);

    const fetchResources = async () => {
        try {
            setLoading(true);

            // First, get the team ID from the team name
            const teamResponse = await fetch(`${API_URL}/teams/${teamName}`, {
                credentials: 'include',
            });

            if (!teamResponse.ok) {
                throw new Error('Failed to fetch team');
            }

            const teamData = await teamResponse.json();
            setTeamId(teamData.id);

            // Fetch resources
            const resourcesResponse = await fetch(`${API_URL}/teams/${teamData.id}/resources`, {
                credentials: 'include',
            });

            if (resourcesResponse.ok) {
                const resourcesData = await resourcesResponse.json();
                setResources(resourcesData);
            }
        } catch (error) {
            console.error('Error fetching team resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async () => {
        if (!deletingResourceId) return;

        try {
            const response = await fetch(`${API_URL}/resources/${deletingResourceId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setResources(resources.filter(resource => resource.id !== deletingResourceId));
                toast.success('Resource deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete resource:', error);
            toast.error('Failed to delete resource');
        } finally {
            setDeletingResourceId(null);
        }
    };

    const getStatusColor = (status: Resource['status']) => {
        switch (status) {
            case 'APPROVED': return 'text-[#10b981]';
            case 'PENDING': return 'text-[#f59e0b]';
            case 'DRAFT': return 'text-[#6b7280]';
            case 'REJECTED': return 'text-destructive';
            case 'SUSPENDED': return 'text-[#f97316]';
            case 'ARCHIVED': return 'text-[#6b7280]';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusIcon = (status: Resource['status']) => {
        switch (status) {
            case 'APPROVED': return 'mdi:check-circle';
            case 'PENDING': return 'mdi:clock-outline';
            case 'DRAFT': return 'mdi:file-document-outline';
            case 'REJECTED': return 'mdi:close-circle';
            case 'SUSPENDED': return 'mdi:pause-circle';
            case 'ARCHIVED': return 'mdi:archive';
            default: return 'mdi:help-circle';
        }
    };

    const getTypeIcon = (type: Resource['type']) => {
        switch (type) {
            case 'PLUGIN': return 'mdi:puzzle';
            case 'MOD': return 'mdi:package-variant';
            case 'WORLD': return 'mdi:earth';
            case 'DATA_PACK': return 'mdi:database';
            case 'ASSET_PACK': return 'mdi:image-multiple';
            case 'PREFAB': return 'mdi:cube-outline';
            case 'MODPACK': return 'mdi:apps-box';
            default: return 'mdi:package-variant';
        }
    };

    const totalResources = resources.length;
    const totalDownloads = resources.reduce((acc, r) => acc + r.downloadCount, 0);
    const totalLikes = resources.reduce((acc, r) => acc + r.likeCount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-hebden text-2xl font-bold text-foreground">Team Resources</h1>
                    <p className="text-muted-foreground mt-1 font-nunito text-sm">
                        Manage resources owned by this team
                    </p>
                </div>

                {/* Create Resource Dialog */}
                <CreateResourceDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    onSuccess={fetchResources}
                    defaultTeamId={teamId} // Lock to this team
                    trigger={
                        <Button className="font-hebden">
                            <Icon icon="mdi:plus" width="20" height="20" />
                            Create Resource
                        </Button>
                    }
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon icon="mdi:package-variant" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalResources}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Resources</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon icon="mdi:download" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalDownloads}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Downloads</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-accent/80 to-accent/40 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon icon="mdi:star" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalLikes}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Likes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources List */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Resources</h2>
                {resources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.map((resource) => (
                            <div key={resource.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {resource.iconUrl ? (
                                            <Image src={resource.iconUrl} alt={resource.name} width={64} height={64} className="rounded-lg object-cover" />
                                        ) : (
                                            <Icon icon={getTypeIcon(resource.type)} width="32" height="32" className="text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-hebden text-lg font-semibold text-foreground">{resource.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito mb-2">
                                            <Icon icon={getStatusIcon(resource.status)} width="16" height="16" className={getStatusColor(resource.status)} />
                                            <span className={getStatusColor(resource.status)}>{resource.status}</span>
                                            <span>•</span>
                                            <Icon icon={getTypeIcon(resource.type)} width="16" height="16" />
                                            <span>{resource.type}</span>
                                        </div>
                                        {resource.tagline && (
                                            <p className="text-sm text-foreground/70 font-nunito line-clamp-2 mb-3">{resource.tagline}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito">
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:download" width="16" height="16" />
                                                {resource.downloadCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:heart" width="16" height="16" />
                                                {resource.likeCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="font-nunito text-sm"
                                        onClick={() => router.push(`/${resource.type.toLowerCase().replace('_', '-')}/${resource.slug}`)}
                                    >
                                        <Icon icon="mdi:eye" width="16" height="16" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="font-nunito text-sm"
                                        onClick={() => router.push(`/${resource.type.toLowerCase()}/${resource.slug}/manage`)}
                                    >
                                        <Icon icon="mdi:pencil" width="16" height="16" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="font-nunito text-sm"
                                        onClick={() => setDeletingResourceId(resource.id)}
                                    >
                                        <Icon icon="mdi:delete" width="16" height="16" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            <Icon icon="mdi:package-variant" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-nunito text-lg mb-2">No resources yet</p>
                        <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
                            Start creating resources for this team. Upload mods, plugins, worlds, and more.
                        </p>
                        <Button
                            className="font-hebden"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Icon icon="mdi:plus" width="20" height="20" />
                            Create First Resource
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Resource Confirmation Dialog */}
            <OrbisConfirmDialog
                open={!!deletingResourceId}
                onOpenChange={(open) => !open && setDeletingResourceId(null)}
                title="Delete Resource"
                description="Are you sure you want to delete this resource? This action cannot be undone."
                confirmText="Delete Resource"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteResource}
                onCancel={() => setDeletingResourceId(null)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}
