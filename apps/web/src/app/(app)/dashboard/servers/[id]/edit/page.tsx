'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';

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

interface Team {
  id: string;
  name: string;
}

interface Server {
  id: string;
  name: string;
  description: string;
  shortDesc?: string;
  serverIp: string;
  port: number;
  gameVersion: string;
  supportedVersions: string[];
  websiteUrl?: string;
  discordUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  logo?: string;
  banner?: string;
  teamId?: string | null;
  categories?: Array<{
    category: ServerCategory;
    isPrimary: boolean;
  }>;
  tags?: Array<{
    tag: ServerTag;
  }>;
}

export default function EditServerPage() {
  const router = useRouter();
  const params = useParams();
  const serverId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServerCategory[]>([]);
  const [tags, setTags] = useState<ServerTag[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [server, setServer] = useState<Server | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDesc: '',
    serverIp: '',
    port: '25565',
    gameVersion: '1.0.0',
    supportedVersions: ['1.0.0'],
    websiteUrl: '',
    discordUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    tiktokUrl: '',
    primaryCategoryId: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    teamId: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteImageId, setDeleteImageId] = useState<'logo' | 'banner' | null>(null);

  useEffect(() => {
    fetchServer();
    fetchCategories();
    fetchTags();
    fetchTeams();
  }, [serverId]);

  const fetchServer = async () => {
    try {
      const response = await fetch(`${API_URL}/servers/${serverId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const serverData: Server = await response.json();
        setServer(serverData);

        const primaryCategory = serverData.categories?.find(c => c.isPrimary)?.category;
        const additionalCategories = serverData.categories?.filter(c => !c.isPrimary).map(c => c.category.id) || [];
        const serverTags = serverData.tags?.map(t => t.tag.id) || [];

        setFormData({
          name: serverData.name,
          description: serverData.description,
          shortDesc: serverData.shortDesc || '',
          serverIp: serverData.serverIp,
          port: serverData.port.toString(),
          gameVersion: serverData.gameVersion,
          supportedVersions: serverData.supportedVersions,
          websiteUrl: serverData.websiteUrl || '',
          discordUrl: serverData.discordUrl || '',
          youtubeUrl: serverData.youtubeUrl || '',
          twitterUrl: serverData.twitterUrl || '',
          tiktokUrl: serverData.tiktokUrl || '',
          primaryCategoryId: primaryCategory?.id || '',
          categoryIds: additionalCategories,
          tagIds: serverTags,
          teamId: serverData.teamId || null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch server:', error);
      toast.error('Failed to fetch server details');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me/teams`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    // Validate file size (5MB for logo, 10MB for banner)
    const maxSize = type === 'logo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${type === 'logo' ? '5MB' : '10MB'}`);
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await fetch(`${API_URL}/servers/${serverId}/${type}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        await fetchServer();
        toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} updated successfully!`);
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to upload image' }));
        toast.error(error.message || `Failed to upload ${type}`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}. Please try again.`);
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImageId) return;

    try {
      const response = await fetch(`${API_URL}/servers/${serverId}/${deleteImageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchServer();
        toast.success(`${deleteImageId === 'logo' ? 'Logo' : 'Banner'} deleted successfully!`);
      } else {
        toast.error(`Failed to delete ${deleteImageId}`);
      }
    } catch (error) {
      console.error(`Error deleting ${deleteImageId}:`, error);
      toast.error(`Failed to delete ${deleteImageId}`);
    } finally {
      setDeleteImageId(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Server name is required';
    if (!formData.description.trim() || formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (formData.shortDesc && formData.shortDesc.length > 200) {
      newErrors.shortDesc = 'Short description must be maximum 200 characters';
    }
    if (!formData.serverIp.trim()) newErrors.serverIp = 'Server IP is required';
    if (!formData.port || parseInt(formData.port) < 1 || parseInt(formData.port) > 65535) {
      newErrors.port = 'Valid port number is required (1-65535)';
    }
    if (!formData.gameVersion.trim()) newErrors.gameVersion = 'Game version is required';
    if (!formData.primaryCategoryId) newErrors.primaryCategoryId = 'Primary category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);

    try {
      const serverData = {
        ...formData,
        port: parseInt(formData.port),
        teamId: formData.teamId || null,
      };

      const response = await fetch(`${API_URL}/servers/${serverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(serverData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update server');
      }

      toast.success('Server updated successfully!');
      router.push('/dashboard/servers');
    } catch (error) {
      console.error('Failed to update server:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleVersionAdd = () => {
    const newVersion = prompt('Enter a supported version:');
    if (newVersion && !formData.supportedVersions.includes(newVersion)) {
      setFormData({
        ...formData,
        supportedVersions: [...formData.supportedVersions, newVersion],
      });
    }
  };

  const handleVersionRemove = (version: string) => {
    setFormData({
      ...formData,
      supportedVersions: formData.supportedVersions.filter(v => v !== version),
    });
  };

  const toggleCategory = (categoryId: string) => {
    setFormData({
      ...formData,
      categoryIds: formData.categoryIds.includes(categoryId)
        ? formData.categoryIds.filter(id => id !== categoryId)
        : [...formData.categoryIds, categoryId],
    });
  };

  const toggleTag = (tagId: string) => {
    setFormData({
      ...formData,
      tagIds: formData.tagIds.includes(tagId)
        ? formData.tagIds.filter(id => id !== tagId)
        : [...formData.tagIds, tagId],
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <Icon icon="mdi:arrow-left" width="20" height="20" />
        </Button>
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">Edit Server</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Update your server details
          </p>
        </div>
      </div>

      {/* Banner and Logo Section */}
      <div className="bg-secondary/30 rounded-lg overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
          {server?.banner && (
            <img src={server.banner} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

          <div className="absolute top-4 right-4 flex gap-2">
            {server?.banner && (
              <Button
                variant="destructive"
                size="sm"
                className="h-9 px-4 font-nunito"
                onClick={() => setDeleteImageId('banner')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])}
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-background/80 rounded-lg hover:bg-background transition-colors h-9">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-nunito">Change Banner</span>
              </div>
            </label>
          </div>
        </div>

        {/* Logo */}
        <div className="px-6 -mt-16 pb-6">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg rounded-lg">
              <AvatarImage src={server?.logo || undefined} alt={server?.name || 'Server'} className="object-cover" />
              <AvatarFallback className="bg-primary text-white font-hebden text-3xl rounded-lg">
                {server?.name ? getInitials(server.name) : 'S'}
              </AvatarFallback>
            </Avatar>

            <div className="absolute -bottom-2 -right-2 flex gap-2">
              {server?.logo && (
                <button
                  onClick={() => setDeleteImageId('logo')}
                  className="flex items-center justify-center w-8 h-8 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                />
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full hover:bg-primary/80 transition-colors shadow-sm">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-hebden">Basic Information</CardTitle>
            <CardDescription className="font-nunito">
              Essential details about your server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-nunito">Server Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Awesome Hytale Server"
                className={`font-nunito ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-sm text-red-500 font-nunito">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-nunito">Description * (min 50 characters)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A complete description of at least 50 characters to explain what the server offers..."
                rows={6}
                className={`font-nunito ${errors.description ? 'border-red-500' : ''}`}
              />
              <p className="text-sm text-muted-foreground font-nunito">
                {formData.description.length} / 50 characters
              </p>
              {errors.description && <p className="text-sm text-red-500 font-nunito">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDesc" className="font-nunito">Short Description (max 200 characters)</Label>
              <Textarea
                id="shortDesc"
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                placeholder="A brief description of your server..."
                rows={3}
                className={`font-nunito ${errors.shortDesc ? 'border-red-500' : ''}`}
              />
              <p className="text-sm text-muted-foreground font-nunito">
                {formData.shortDesc.length} / 200 characters
              </p>
              {errors.shortDesc && <p className="text-sm text-red-500 font-nunito">{errors.shortDesc}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-hebden">Server Connection</CardTitle>
            <CardDescription className="font-nunito">
              How players will connect to your server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="serverIp" className="font-nunito">Server IP *</Label>
                <Input
                  id="serverIp"
                  value={formData.serverIp}
                  onChange={(e) => setFormData({ ...formData, serverIp: e.target.value })}
                  placeholder="play.myserver.com"
                  className={`font-nunito ${errors.serverIp ? 'border-red-500' : ''}`}
                />
                {errors.serverIp && <p className="text-sm text-red-500 font-nunito">{errors.serverIp}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="port" className="font-nunito">Port *</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="25565"
                  className={`font-nunito ${errors.port ? 'border-red-500' : ''}`}
                />
                {errors.port && <p className="text-sm text-red-500 font-nunito">{errors.port}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameVersion" className="font-nunito">Game Version *</Label>
              <Input
                id="gameVersion"
                value={formData.gameVersion}
                onChange={(e) => setFormData({ ...formData, gameVersion: e.target.value })}
                placeholder="1.0.0"
                className={`font-nunito ${errors.gameVersion ? 'border-red-500' : ''}`}
              />
              {errors.gameVersion && <p className="text-sm text-red-500 font-nunito">{errors.gameVersion}</p>}
            </div>

            <div className="space-y-2">
              <Label className="font-nunito">Supported Versions</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.supportedVersions.map((version) => (
                  <div key={version} className="bg-accent px-3 py-1 rounded-full flex items-center gap-2 font-nunito text-sm">
                    {version}
                    <button
                      type="button"
                      onClick={() => handleVersionRemove(version)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Icon icon="mdi:close" width="16" height="16" />
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleVersionAdd} className="font-nunito">
                <Icon icon="mdi:plus" width="16" height="16" className="mr-2" />
                Add Version
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-hebden">Categories & Tags</CardTitle>
            <CardDescription className="font-nunito">
              Help players find your server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryCategory" className="font-nunito">Primary Category *</Label>
              <Select
                value={formData.primaryCategoryId}
                onValueChange={(value) => setFormData({ ...formData, primaryCategoryId: value })}
              >
                <SelectTrigger className={`font-nunito ${errors.primaryCategoryId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select primary category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="font-nunito">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryCategoryId && <p className="text-sm text-red-500 font-nunito">{errors.primaryCategoryId}</p>}
            </div>

            <div className="space-y-2">
              <Label className="font-nunito">Additional Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 rounded-lg border-2 transition-all font-nunito text-sm ${formData.categoryIds.includes(category.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-nunito">Tags</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`p-3 rounded-lg border-2 transition-all font-nunito text-sm ${formData.tagIds.includes(tag.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-hebden">Social Links</CardTitle>
            <CardDescription className="font-nunito">
              Connect your social media and community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="font-nunito">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://myserver.com"
                className="font-nunito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discordUrl" className="font-nunito">Discord URL</Label>
              <Input
                id="discordUrl"
                type="url"
                value={formData.discordUrl}
                onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                placeholder="https://discord.gg/myserver"
                className="font-nunito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl" className="font-nunito">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/@myserver"
                className="font-nunito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterUrl" className="font-nunito">Twitter URL</Label>
              <Input
                id="twitterUrl"
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/myserver"
                className="font-nunito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktokUrl" className="font-nunito">TikTok URL</Label>
              <Input
                id="tiktokUrl"
                type="url"
                value={formData.tiktokUrl}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@myserver"
                className="font-nunito"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-hebden">Team Assignment</CardTitle>
            <CardDescription className="font-nunito">
              Assign this server to a team (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="team" className="font-nunito">Select Team</Label>
                <Select
                  value={formData.teamId || ''}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value || null })}
                >
                  <SelectTrigger className="font-nunito">
                    <SelectValue placeholder="Select a team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-team" className="font-nunito text-muted-foreground">No team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} className="font-nunito">
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-nunito">
                You don't have any teams yet. Create a team to assign servers to it.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="font-hebden">
            {saving ? (
              <>
                <Icon icon="mdi:loading" width="20" height="20" className="animate-spin mr-2" />
                Saving Changes...
              </>
            ) : (
              <>
                <Icon icon="mdi:check" width="20" height="20" className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="font-nunito">
            Cancel
          </Button>
        </div>
      </form>

      <OrbisConfirmDialog
        open={!!deleteImageId}
        onOpenChange={(open) => !open && setDeleteImageId(null)}
        title={`Delete Server ${deleteImageId === 'logo' ? 'Logo' : 'Banner'}`}
        description={`Are you sure you want to delete this ${deleteImageId}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImageId(null)}
      >
        <></>
      </OrbisConfirmDialog>
    </div>
  );
}