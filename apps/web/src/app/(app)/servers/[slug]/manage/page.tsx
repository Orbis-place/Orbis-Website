'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OrbisConfirmDialog, OrbisFormDialog } from '@/components/OrbisDialog';
import { useServer } from '@/contexts/ServerContext';
import { Plus, Trash2, Edit2, GripVertical, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ServerCategory {
  id: string;
  name: string;
  slug: string;
}

interface ServerTag {
  id: string;
  name: string;
  slug: string;
}

interface SocialLink {
  id: string;
  type: string;
  url: string;
  label?: string;
  order: number;
}

const SOCIAL_PLATFORMS = [
  { type: 'TWITTER', label: 'Twitter', icon: 'mdi:twitter', color: '#1DA1F2' },
  { type: 'GITHUB', label: 'GitHub', icon: 'mdi:github', color: '#ffffff' },
  { type: 'DISCORD', label: 'Discord', icon: 'mdi:discord', color: '#5865F2' },
  { type: 'YOUTUBE', label: 'YouTube', icon: 'mdi:youtube', color: '#FF0000' },
  { type: 'TWITCH', label: 'Twitch', icon: 'mdi:twitch', color: '#9146FF' },
  { type: 'LINKEDIN', label: 'LinkedIn', icon: 'mdi:linkedin', color: '#0A66C2' },
  { type: 'INSTAGRAM', label: 'Instagram', icon: 'mdi:instagram', color: '#E4405F' },
  { type: 'FACEBOOK', label: 'Facebook', icon: 'mdi:facebook', color: '#1877F2' },
  { type: 'REDDIT', label: 'Reddit', icon: 'mdi:reddit', color: '#FF4500' },
  { type: 'TIKTOK', label: 'TikTok', icon: 'mdi:music-note', color: '#000000' },
  { type: 'CUSTOM', label: 'Custom Link', icon: 'mdi:link-variant', color: '#6B7280' },
];

export default function ServerManagePage() {
  const router = useRouter();
  const params = useParams();
  const serverSlug = params.slug as string;
  const { server: contextServer, isLoading: contextLoading, isOwner } = useServer();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [server, setServer] = useState(contextServer);
  const [loading, setLoading] = useState(contextLoading);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<ServerCategory[]>([]);
  const [tags, setTags] = useState<ServerTag[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDesc: '',
    serverAddress: '',
    gameVersion: '1.0.0',
    primaryCategoryId: '',
    websiteUrl: '',
    country: '',
  });

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showAddLinkDialog, setShowAddLinkDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [newLinkType, setNewLinkType] = useState('TWITTER');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [showDeleteServerDialog, setShowDeleteServerDialog] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<'logo' | 'banner' | null>(null);

  useEffect(() => {
    if (contextServer) {
      setServer(contextServer);
      const primaryCategory = contextServer.categories?.find((c: any) => c.isPrimary)?.category;
      setFormData({
        name: contextServer.name,
        description: contextServer.description,
        shortDesc: contextServer.shortDesc || '',
        serverAddress: contextServer.serverAddress,
        gameVersion: contextServer.gameVersion,
        primaryCategoryId: primaryCategory?.id || '',
        websiteUrl: contextServer.websiteUrl || '',
        country: contextServer.country || '',
      });
    }
  }, [contextServer]);

  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/server-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/server-tags`);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const refreshServer = async () => {
    try {
      const response = await fetch(`${API_URL}/servers/${serverSlug}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setServer(data);
      }
    } catch (error) {
      console.error('Failed to refresh server:', error);
    }
  };

  // Fetch social links
  useEffect(() => {
    if (server?.id) {
      fetchSocialLinks();
    }
  }, [server?.id]);

  const fetchSocialLinks = async () => {
    if (!server?.id) return;
    try {
      const response = await fetch(`${API_URL}/servers/${server.id}/social-links`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSocialLinks(data);
      }
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const handleAddSocialLink = async () => {
    if (!newLinkUrl.trim() || !server?.id) {
      toast.error('URL is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/servers/${server.id}/social-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: newLinkType,
          url: newLinkUrl.trim(),
          label: newLinkLabel.trim() || null,
        }),
      });

      if (response.ok) {
        await fetchSocialLinks();
        setShowAddLinkDialog(false);
        setNewLinkUrl('');
        setNewLinkLabel('');
        setNewLinkType('TWITTER');
        toast.success('Social link added successfully!');
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to add link' }));
        toast.error(error.message || 'Failed to add social link');
      }
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link. Please try again.');
    }
  };

  const handleUpdateSocialLink = async () => {
    if (!editingLink || !newLinkUrl.trim() || !server?.id) {
      toast.error('URL is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/servers/${server.id}/social-links/${editingLink.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          url: newLinkUrl.trim(),
          label: newLinkLabel.trim() || null,
        }),
      });

      if (response.ok) {
        await fetchSocialLinks();
        setShowAddLinkDialog(false);
        setEditingLink(null);
        setNewLinkUrl('');
        setNewLinkLabel('');
        toast.success('Social link updated successfully!');
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to update link' }));
        toast.error(error.message || 'Failed to update social link');
      }
    } catch (error) {
      console.error('Error updating social link:', error);
      toast.error('Failed to update social link. Please try again.');
    }
  };

  const confirmDeleteLink = async () => {
    if (!deletingLinkId || !server?.id) return;

    try {
      const response = await fetch(`${API_URL}/servers/${server.id}/social-links/${deletingLinkId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchSocialLinks();
        toast.success('Social link deleted successfully!');
      } else {
        toast.error('Failed to delete social link');
      }
    } catch (error) {
      console.error('Error deleting social link:', error);
      toast.error('Failed to delete social link. Please try again.');
    } finally {
      setDeletingLinkId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex || !server?.id) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Create new order
    const newLinks = [...socialLinks];
    const [draggedLink] = newLinks.splice(draggedIndex, 1);
    if (!draggedLink) return;
    newLinks.splice(dropIndex, 0, draggedLink);

    // Update local state immediately for responsive UI
    setSocialLinks(newLinks);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Send to backend
    try {
      const linkIds = newLinks.map(link => link.id);
      const response = await fetch(`${API_URL}/servers/${server.id}/social-links/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ linkIds }),
      });

      if (response.ok) {
        await fetchSocialLinks(); // Refresh to get server order
        toast.success('Social links reordered!');
      } else {
        // Revert on error
        await fetchSocialLinks();
        toast.error('Failed to reorder links');
      }
    } catch (error) {
      console.error('Error reordering links:', error);
      await fetchSocialLinks(); // Revert
      toast.error('Failed to reorder links');
    }
  };

  const getPlatformInfo = (type: string) => {
    return SOCIAL_PLATFORMS.find(p => p.type === type) || SOCIAL_PLATFORMS.find(p => p.type === 'CUSTOM')!;
  };


  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!server?.id) return;

    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/servers/${server.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update server');
      }

      await refreshServer();
      setIsEditing(false);
      toast.success('Server updated successfully!');
    } catch (error) {
      console.error('Error updating server:', error);
      toast.error('Failed to update server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
    if (!server?.id) return;

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await fetch(`${API_URL}/servers/${server.id}/${type}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      await refreshServer();
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteImageId || !server?.id) return;

    try {
      const response = await fetch(`${API_URL}/servers/${server.id}/${deleteImageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${deleteImageId}`);
      }

      await refreshServer();
      toast.success(`${deleteImageId === 'logo' ? 'Logo' : 'Banner'} deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting ${deleteImageId}:`, error);
      toast.error(`Failed to delete ${deleteImageId}`);
    } finally {
      setDeleteImageId(null);
    }
  };

  const handleDeleteServer = async () => {
    if (!server?.id) return;

    try {
      const response = await fetch(`${API_URL}/servers/${server.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete server');
      }

      toast.success('Server deleted successfully');
      router.push('/dashboard/servers');
    } catch (error) {
      console.error('Error deleting server:', error);
      toast.error('Failed to delete server');
    } finally {
      setShowDeleteServerDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon icon="mdi:server-off" width="48" height="48" className="text-muted-foreground" />
        <p className="text-foreground font-nunito text-lg mt-4">Server not found</p>
        <Button onClick={() => router.push('/dashboard/servers')} className="mt-4 font-hebden">
          Back to Servers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-hebden text-foreground">General Settings</h1>
      </div>

      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden">
        {server.banner && (
          <Image
            src={server.banner}
            alt={`${server.name} banner`}
            fill
            className="object-cover"
          />
        )}
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
            />
            <Button
              size="sm"
              className="font-hebden"
              onClick={() => bannerInputRef.current?.click()}
            >
              <Icon icon="mdi:upload" width="16" height="16" />
              Upload Banner
            </Button>
            {server.banner && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteImageId('banner')}
                className="font-hebden"
              >
                <Icon icon="mdi:delete" width="16" height="16" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Server Info */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="relative">
            {server.logo ? (
              <Image
                src={server.logo}
                alt={server.name}
                width={96}
                height={96}
                className="rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon icon="mdi:server" width="48" height="48" />
              </div>
            )}
            {isOwner && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                />
                <Button
                  size="sm"
                  className="font-hebden h-8 w-8 p-0"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Icon icon="mdi:upload" width="16" height="16" />
                </Button>
                {server.logo && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteImageId('logo')}
                    className="font-hebden h-8 w-8 p-0"
                  >
                    <Icon icon="mdi:delete" width="16" height="16" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-hebden text-foreground">{server.name}</h2>
                    <p className="text-muted-foreground font-nunito">@{server.slug}</p>
                  </div>
                  {isOwner && (
                    <Button onClick={() => setIsEditing(true)} className="font-hebden">
                      <Icon icon="mdi:pencil" width="20" height="20" />
                      Edit
                    </Button>
                  )}
                </div>
                {server.description && (
                  <p className="text-foreground font-nunito">{server.description}</p>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground font-nunito">
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:server-network" width="16" height="16" />
                    {server.serverAddress}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:package-variant" width="16" height="16" />
                    v{server.gameVersion}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateServer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Server Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serverAddress">Server Address *</Label>
                  <Input
                    id="serverAddress"
                    value={formData.serverAddress}
                    onChange={(e) => setFormData({ ...formData, serverAddress: e.target.value })}
                    placeholder="1.1.1.1:5520 or play.myserver.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground/60 font-nunito">
                    Enter IP:port or domain:port (port defaults to 5520)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="font-hebden" disabled={isSaving}>
                    {isSaving && <Icon icon="mdi:loading" className="animate-spin" width="20" height="20" />}
                    {!isSaving && <Icon icon="mdi:check" width="20" height="20" />}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (server) {
                        const primaryCategory = server.categories?.find((c: any) => c.isPrimary)?.category;
                        setFormData({
                          name: server.name,
                          description: server.description,
                          shortDesc: server.shortDesc || '',
                          serverAddress: server.serverAddress,
                          gameVersion: server.gameVersion,
                          primaryCategoryId: primaryCategory?.id || '',
                          websiteUrl: (server as any).websiteUrl || '',
                          country: (server as any).country || '',
                        });
                      }
                    }}
                    variant="outline"
                    className="font-hebden"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      {isOwner && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-hebden text-xl font-semibold text-foreground">Social Links</h2>
            <Button
              onClick={() => setShowAddLinkDialog(true)}
              size="sm"
              className="font-hebden"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>

          {socialLinks.length > 0 ? (
            <div className="space-y-3">
              {socialLinks.map((link, index) => {
                const platformInfo = getPlatformInfo(link.type);
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center gap-3 p-4 bg-background rounded-lg border group transition-all ${isDragging
                      ? 'opacity-50 border-primary'
                      : isDragOver
                        ? 'border-primary border-2'
                        : 'border-border'
                      }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move group-hover:text-primary transition-colors" />

                    <Icon
                      icon={platformInfo.icon}
                      width="24"
                      height="24"
                      style={{ color: platformInfo.color }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-nunito font-semibold text-foreground">
                        {link.label || platformInfo.label}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(link.url, '_blank')}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingLink(link);
                          setNewLinkUrl(link.url);
                          setNewLinkLabel(link.label || '');
                          setShowAddLinkDialog(true);
                        }}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>

                      <button
                        onClick={() => setDeletingLinkId(link.id)}
                        className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon icon="mdi:link-variant-off" width="48" height="48" className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-nunito">No social links added yet</p>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      {isOwner && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
          <h3 className="text-xl font-bold font-hebden text-destructive mb-4">Danger Zone</h3>
          <p className="text-sm text-muted-foreground font-nunito mb-4">
            Once you delete a server, there is no going back. Please be certain.
          </p>
          <Button
            onClick={() => setShowDeleteServerDialog(true)}
            variant="destructive"
            className="font-hebden"
          >
            <Icon icon="mdi:delete" width="20" height="20" />
            Delete Server
          </Button>
        </div>
      )}

      {/* Delete Server Confirmation Dialog */}
      <OrbisConfirmDialog
        open={showDeleteServerDialog}
        onOpenChange={(open) => !open && setShowDeleteServerDialog(false)}
        title="Delete Server"
        description="Are you sure you want to delete this server? This action cannot be undone."
        confirmText="Delete Server"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteServer}
        onCancel={() => setShowDeleteServerDialog(false)}
      >
        <></>
      </OrbisConfirmDialog>

      {/* Delete Image Confirmation Dialog */}
      <OrbisConfirmDialog
        open={!!deleteImageId}
        onOpenChange={(open) => !open && setDeleteImageId(null)}
        title={`Delete ${deleteImageId === 'logo' ? 'Logo' : 'Banner'}`}
        description={`Are you sure you want to delete this ${deleteImageId}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteFile}
        onCancel={() => setDeleteImageId(null)}
      >
        <></>
      </OrbisConfirmDialog>

      {/* Delete Social Link Confirmation Dialog */}
      <OrbisConfirmDialog
        open={!!deletingLinkId}
        onOpenChange={(open) => !open && setDeletingLinkId(null)}
        title="Delete Social Link"
        description="Are you sure you want to delete this social link?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteLink}
        onCancel={() => setDeletingLinkId(null)}
      >
        <></>
      </OrbisConfirmDialog>

      {/* Add/Edit Social Link Dialog */}
      <OrbisFormDialog
        open={showAddLinkDialog}
        onOpenChange={(open) => {
          setShowAddLinkDialog(open);
          if (!open) {
            setEditingLink(null);
            setNewLinkUrl('');
            setNewLinkLabel('');
          }
        }}
        title={editingLink ? 'Edit Social Link' : 'Add Social Link'}
        description={editingLink ? 'Update your social link information' : 'Add a new social link to your server'}
        submitText={editingLink ? 'Update Link' : 'Add Link'}
        onSubmit={editingLink ? handleUpdateSocialLink : handleAddSocialLink}
        onCancel={() => {
          setShowAddLinkDialog(false);
          setEditingLink(null);
          setNewLinkUrl('');
          setNewLinkLabel('');
        }}
      >
        <div className="space-y-4">
          {/* Platform Type */}
          {!editingLink && (
            <div className="space-y-2">
              <Label htmlFor="linkType">Platform</Label>
              <Select value={newLinkType} onValueChange={setNewLinkType}>
                <SelectTrigger id="linkType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.type} value={platform.type}>
                      <div className="flex items-center gap-2">
                        <Icon icon={platform.icon} width="20" height="20" style={{ color: platform.color }} />
                        <span>{platform.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">URL *</Label>
            <Input
              id="linkUrl"
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          {/* Custom Label */}
          <div className="space-y-2">
            <Label htmlFor="linkLabel">Custom Label (Optional)</Label>
            <Input
              id="linkLabel"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="My Awesome Server"
            />
            <p className="text-xs text-muted-foreground/60 font-nunito">
              Leave empty to use the platform default name
            </p>
          </div>
        </div>
      </OrbisFormDialog>
    </div>
  );
}