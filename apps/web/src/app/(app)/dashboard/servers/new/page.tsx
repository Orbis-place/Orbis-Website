'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function NewServerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ServerCategory[]>([]);
  const [tags, setTags] = useState<ServerTag[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchTeams();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/server-categories`);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/server-tags`);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/teams`, {
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      return;
    }

    setLoading(true);

    try {
      const serverData = {
        ...formData,
        port: parseInt(formData.port),
        teamId: formData.teamId || null,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(serverData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create server');
      }

      const createdServer = await response.json();

      if (logoFile && createdServer.id) {
        const formData = new FormData();
        formData.append('logo', logoFile);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/servers/${createdServer.id}/logo`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      }

      router.push('/dashboard/servers');
    } catch (error) {
      console.error('Failed to create server:', error);
      alert(error instanceof Error ? error.message : 'Failed to create server. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <Icon icon="mdi:arrow-left" width="20" height="20" />
        </Button>
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">Add New Server</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Fill in the details to add your Hytale server
          </p>
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
                className={errors.name ? 'border-red-500' : ''}
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
                className={errors.description ? 'border-red-500' : ''}
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
                className={errors.shortDesc ? 'border-red-500' : ''}
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
                  className={errors.serverIp ? 'border-red-500' : ''}
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
                  className={errors.port ? 'border-red-500' : ''}
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
                className={errors.gameVersion ? 'border-red-500' : ''}
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
              <Button type="button" variant="outline" size="sm" onClick={handleVersionAdd}>
                <Icon icon="mdi:plus" width="16" height="16" />
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
                <SelectTrigger className={errors.primaryCategoryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select primary category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
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
                    className={`p-3 rounded-lg border-2 transition-all font-nunito text-sm ${
                      formData.categoryIds.includes(category.id)
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
                    className={`p-3 rounded-lg border-2 transition-all font-nunito text-sm ${
                      formData.tagIds.includes(tag.id)
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
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-hebden">Logo & Team</CardTitle>
            <CardDescription className="font-nunito">
              Upload a logo and assign to a team (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo" className="font-nunito">Server Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="font-nunito"
                />
              </div>
            </div>

            {teams.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="team" className="font-nunito">Assign to Team</Label>
                <Select
                  value={formData.teamId || ''}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="font-hebden">
            {loading ? (
              <>
                <Icon icon="mdi:loading" width="20" height="20" className="animate-spin" />
                Creating Server...
              </>
            ) : (
              <>
                <Icon icon="mdi:check" width="20" height="20" />
                Create Server
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="font-nunito">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}