'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import Image from 'next/image';

interface ResourceTag {
  id: string;
  name: string;
  slug: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
}

interface ResourceVersion {
  id: string;
  versionNumber: string;
  name: string;
  channel: string;
  downloadCount: number;
  createdAt: string;
  publishedAt?: string;
}

interface Resource {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  type: 'PLUGIN' | 'MOD' | 'WORLD' | 'DATA_PACK' | 'ASSET_PACK' | 'PREFAB' | 'MODPACK' | 'TOOLS_SCRIPTS';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';
  iconUrl?: string;
  bannerUrl?: string;
  downloadCount: number;
  likeCount: number;
  viewCount: number;
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    username: string;
    displayName?: string;
    image?: string;
  };
  ownerTeam?: {
    id: string;
    name: string;
    logo?: string;
  };
  latestVersion?: ResourceVersion;
  tags?: Array<{
    tag: ResourceTag;
    featured: boolean;
  }>;
  categories?: Array<{
    category: ResourceCategory;
  }>;
  _count?: {
    versions: number;
  };
}

export default function ResourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

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
      case 'TOOLS_SCRIPTS': return 'mdi:tools';
      default: return 'mdi:package-variant';
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <div className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {resource.iconUrl ? (
            <Image src={resource.iconUrl} alt={resource.name} width={64} height={64} className="rounded-lg object-cover" />
          ) : (
            <Icon ssr={true} icon={getTypeIcon(resource.type)} width="32" height="32" className="text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-hebden text-lg font-semibold text-foreground">{resource.name}</h3>
            {resource.featured && (
              <Icon ssr={true} icon="mdi:star" width="16" height="16" className="text-yellow-500" />
            )}
            {resource.verified && (
              <Icon ssr={true} icon="mdi:check-decagram" width="16" height="16" className="text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito mb-2">
            <Icon ssr={true} icon={getStatusIcon(resource.status)} width="16" height="16" className={getStatusColor(resource.status)} />
            <span className={getStatusColor(resource.status)}>{resource.status}</span>
            <span>•</span>
            <Icon ssr={true} icon={getTypeIcon(resource.type)} width="16" height="16" />
            <span>{resource.type}</span>
          </div>
          {resource.tagline && (
            <p className="text-sm text-foreground/70 font-nunito line-clamp-2 mb-3">{resource.tagline}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito mb-2">
            <span className="flex items-center gap-1">
              <Icon ssr={true} icon="mdi:download" width="16" height="16" />
              {resource.downloadCount}
            </span>
            <span className="flex items-center gap-1">
              <Icon ssr={true} icon="mdi:heart" width="16" height="16" />
              {resource.likeCount}
            </span>
            {resource._count?.versions !== undefined && (
              <span className="flex items-center gap-1">
                <Icon ssr={true} icon="mdi:tag-multiple" width="16" height="16" />
                {resource._count.versions} version{resource._count.versions !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {resource.tags.filter(t => t.featured).slice(0, 3).map((tagItem) => (
                <span
                  key={tagItem.tag.id}
                  className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md font-nunito"
                >
                  {tagItem.tag.name}
                </span>
              ))}
            </div>
          )}
          {resource.latestVersion && (
            <div className="text-xs text-muted-foreground font-nunito">
              Latest: v{resource.latestVersion.versionNumber}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          className="font-nunito text-sm"
          onClick={() => router.push(`/${resource.type.toLowerCase().replace('_', '-')}/${resource.slug}`)}
        >
          <Icon ssr={true} icon="mdi:eye" width="16" height="16" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="font-nunito text-sm"
          onClick={() => router.push(`/${resource.type.toLowerCase()}/${resource.slug}/manage`)}
        >
          <Icon ssr={true} icon="mdi:settings" width="16" height="16" />
          Manage
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="font-nunito text-sm"
          onClick={() => setDeletingResourceId(resource.id)}
        >
          <Icon ssr={true} icon="mdi:delete" width="16" height="16" />
          Delete
        </Button>
      </div>
    </div>
  );

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deletingResourceId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${deletingResourceId}`, {
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

  const totalResources = resources.length;
  const totalDownloads = resources.reduce((acc, r) => acc + r.downloadCount, 0);
  const totalLikes = resources.reduce((acc, r) => acc + r.likeCount, 0);

  // Group resources by team
  const personalResources = resources.filter(r => !r.ownerTeam);
  const teamResources = resources.filter(r => r.ownerTeam);

  // Group team resources by team
  const resourcesByTeam = teamResources.reduce((acc, resource) => {
    const teamId = resource.ownerTeam!.id;
    if (!acc[teamId]) {
      acc[teamId] = {
        team: resource.ownerTeam!,
        resources: []
      };
    }
    acc[teamId].resources.push(resource);
    return acc;
  }, {} as Record<string, { team: NonNullable<Resource['ownerTeam']>, resources: Resource[] }>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">My Resources</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Manage your mods, plugins, and other creations
          </p>
        </div>

        {/* Create Resource Button */}
        <Button className="font-hebden" onClick={() => router.push('/resources/new')}>
          <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
          Create Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
              <Icon ssr={true} icon="mdi:package-variant" width="24" height="24" className="text-primary" />
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
              <Icon ssr={true} icon="mdi:download" width="24" height="24" className="text-primary" />
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
              <Icon ssr={true} icon="mdi:heart" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">{totalLikes}</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="space-y-6">
        {resources.length > 0 ? (
          <>
            {/* Personal Resources */}
            {personalResources.length > 0 && (
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Personal Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            )}

            {/* Team Resources */}
            {Object.values(resourcesByTeam).map(({ team, resources: teamResources }) => (
              <div key={team.id} className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {team.logo ? (
                      <Image src={team.logo} alt={team.name} width={40} height={40} className="rounded-lg object-cover" />
                    ) : (
                      <Icon ssr={true} icon="mdi:account-group" width="24" height="24" className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-hebden text-xl font-semibold text-foreground">
                      {team.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-nunito">
                      {teamResources.length} resource{teamResources.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon ssr={true} icon="mdi:package-variant" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No resources yet</p>
            <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
              Start creating resources to share with the Orbis community. Upload mods, plugins, worlds, and more.
            </p>
            <Button
              className="font-hebden"
              onClick={() => router.push('/resources/new')}
            >
              <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
              Create Your First Resource
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
