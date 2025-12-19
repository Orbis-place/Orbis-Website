'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from '@/components/CountrySelector';
import { toast } from 'sonner';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { useServer } from '@/contexts/ServerContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface HytaleVersion {
  id: string;
  hytaleVersion: string;
  name?: string;
}

export default function ServerManagePage() {
  const router = useRouter();
  const { server: contextServer, isLoading: contextLoading, isOwner } = useServer();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [server, setServer] = useState(contextServer);
  const [loading, setLoading] = useState(contextLoading);
  const [isSaving, setIsSaving] = useState(false);
  const [hytaleVersions, setHytaleVersions] = useState<HytaleVersion[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    shortDesc: '',
    serverAddress: '',
    gameVersionId: '',
    websiteUrl: '',
    country: '',
  });

  const [showDeleteServerDialog, setShowDeleteServerDialog] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<'logo' | 'banner' | null>(null);

  useEffect(() => {
    fetchHytaleVersions();
  }, []);

  useEffect(() => {
    if (contextServer) {
      setServer(contextServer);

      setFormData(prev => ({
        ...prev,
        name: contextServer.name,
        shortDesc: contextServer.shortDesc || '',
        serverAddress: contextServer.serverAddress,
        gameVersionId: (contextServer as any).gameVersionId || '',
        websiteUrl: (contextServer as any).websiteUrl || '',
        country: (contextServer as any).country || '',
      }));
    }
  }, [contextServer]);

  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

  const fetchHytaleVersions = async () => {
    try {
      const response = await fetch(`${API_URL}/hytale-versions`);
      if (response.ok) {
        const data = await response.json();
        setHytaleVersions(data);
      }
    } catch (error) {
      console.error('Failed to fetch Hytale versions:', error);
    }
  };

  const refreshServer = async () => {
    if (!server?.slug) return;
    try {
      const response = await fetch(`${API_URL}/servers/${server.slug}`, {
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

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!server?.id) return;

    try {
      setIsSaving(true);

      // Only include non-empty optional fields
      const updateData = {
        name: formData.name,
        shortDesc: formData.shortDesc,
        serverAddress: formData.serverAddress,
        gameVersionId: formData.gameVersionId,
        ...(formData.websiteUrl && { websiteUrl: formData.websiteUrl }),
        ...(formData.country && { country: formData.country }),
      };

      const response = await fetch(`${API_URL}/servers/${server.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update server');
      }

      await refreshServer();
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

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(`File size must be less than 5MB`);
      return;
    }

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
        body: JSON.stringify({}),
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
        {server.bannerUrl && (
          <Image
            src={server.bannerUrl}
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
            {server.bannerUrl && (
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

      {/* Server Info - Always in Edit Mode */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="relative">
            {server.logoUrl ? (
              <Image
                src={server.logoUrl}
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
                {server.logoUrl && (
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

          {/* Edit Form - Always Visible */}
          <div className="flex-1">
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
                <Label htmlFor="shortDesc">Short Description *</Label>
                <Input
                  id="shortDesc"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="A brief tagline for your server"
                  maxLength={200}
                  required
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
                <Label htmlFor="gameVersionId">Game Version *</Label>
                <Select
                  key={`${formData.gameVersionId}-${hytaleVersions.length}`}
                  value={formData.gameVersionId}
                  onValueChange={(value) => setFormData({ ...formData, gameVersionId: value })}
                  required
                >
                  <SelectTrigger id="gameVersionId" className="w-full">
                    <SelectValue placeholder="Select game version" />
                  </SelectTrigger>
                  <SelectContent>
                    {hytaleVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.hytaleVersion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <CountrySelector
                  value={formData.country}
                  onChange={(value) => setFormData({ ...formData, country: value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="font-hebden" disabled={isSaving}>
                  {isSaving && <Icon icon="mdi:loading" className="animate-spin" width="20" height="20" />}
                  {!isSaving && <Icon icon="mdi:check" width="20" height="20" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
    </div>
  );
}