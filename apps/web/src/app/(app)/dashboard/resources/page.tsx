'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbisFormDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
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
  type: 'PLUGIN' | 'MOD' | 'WORLD' | 'DATA_PACK' | 'ASSET_PACK' | 'PREFAB' | 'MODPACK';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
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
  team?: {
    id: string;
    name: string;
    displayName?: string;
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    type: 'PLUGIN',
    visibility: 'PUBLIC'
  });
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create resource');
      }

      const data = await response.json();
      console.log('Resource created:', data);

      // Reset form and close dialog
      setFormData({
        name: '',
        tagline: '',
        type: 'PLUGIN',
        visibility: 'PUBLIC'
      });
      setIsCreateOpen(false);

      toast.success('Resource created successfully!');

      // Refresh the resources list
      fetchResources();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource. Please try again.');
    } finally {
      setIsLoading(false);
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
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
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

        {/* Create Resource Dialog */}
        <OrbisFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={
            <Button className="font-hebden">
              <Icon icon="mdi:plus" width="20" height="20" />
              Create Resource
            </Button>
          }
          title="Create New Resource"
          description="Fill in the details to create your resource"
          size="lg"
          onSubmit={handleCreateResource}
          submitText="Create Resource"
          submitLoading={isLoading}
          onCancel={() => setIsCreateOpen(false)}
        >
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Resource Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="My Awesome Plugin"
                required
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline">
                Tagline *
              </Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                maxLength={200}
                placeholder="A short description of your resource"
                required
              />
              <p className="text-xs text-muted-foreground/60 font-nunito">
                {formData.tagline.length}/200 characters
              </p>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Resource Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLUGIN">Plugin</SelectItem>
                  <SelectItem value="MOD">Mod</SelectItem>
                  <SelectItem value="WORLD">World</SelectItem>
                  <SelectItem value="DATA_PACK">Data Pack</SelectItem>
                  <SelectItem value="ASSET_PACK">Asset Pack</SelectItem>
                  <SelectItem value="PREFAB">Prefab</SelectItem>
                  <SelectItem value="MODPACK">Modpack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">
                Visibility *
              </Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                required
              >
                <SelectTrigger id="visibility" className="w-full">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:earth" width="16" height="16" />
                      Public - Visible to everyone
                    </span>
                  </SelectItem>
                  <SelectItem value="UNLISTED">
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:link-variant" width="16" height="16" />
                      Unlisted - Accessible via link only
                    </span>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <span className="flex items-center gap-2">
                      <Icon icon="mdi:lock" width="16" height="16" />
                      Private - Only visible to you
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex gap-3">
                <Icon icon="mdi:information" className="text-primary flex-shrink-0 mt-0.5" width="20" height="20" />
                <p className="text-sm text-foreground/80 font-nunito">
                  Your resource will be created as a <strong>draft</strong>. You can add versions, images, and other details before publishing.
                </p>
              </div>
            </div>
          </div>
        </OrbisFormDialog>
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
        <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Your Resources</h2>
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-hebden text-lg font-semibold text-foreground">{resource.name}</h3>
                      {resource.featured && (
                        <Icon icon="mdi:star" width="16" height="16" className="text-yellow-500" />
                      )}
                      {resource.verified && (
                        <Icon icon="mdi:check-decagram" width="16" height="16" className="text-blue-500" />
                      )}
                    </div>
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito mb-2">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:download" width="16" height="16" />
                        {resource.downloadCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:heart" width="16" height="16" />
                        {resource.likeCount}
                      </span>
                      {resource._count?.versions !== undefined && (
                        <span className="flex items-center gap-1">
                          <Icon icon="mdi:tag-multiple" width="16" height="16" />
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
              Start creating resources to share with the Orbis community. Upload mods, plugins, worlds, and more.
            </p>
            <Button
              className="font-hebden"
              onClick={() => setIsCreateOpen(true)}
            >
              <Icon icon="mdi:plus" width="20" height="20" />
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
