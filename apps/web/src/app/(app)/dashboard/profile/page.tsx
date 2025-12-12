'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSessionStore } from '@/stores/useSessionStore';
import { Camera, Plus, Trash2, Edit2, GripVertical, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { OrbisFormDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

interface SocialLink {
  id: string;
  type: string;
  url: string;
  label?: string;
  order: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  image?: string;
  banner?: string;
  bio?: string;
  location?: string;
  website?: string;
  reputation: number;
  _count: {
    followers: number;
    following: number;
    ownedResources: number;
    ownedServers: number;
  };
}

export default function ProfilePage() {
  const { session } = useSessionStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  // Social link dialog state
  const [showAddLinkDialog, setShowAddLinkDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [newLinkType, setNewLinkType] = useState('TWITTER');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Delete banner dialog state
  const [showDeleteBannerDialog, setShowDeleteBannerDialog] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchSocialLinks();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setWebsite(data.website || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me/social-links`, {
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
      };

      console.log('Sending profile update:', payload);

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        await fetchProfile();
        toast.success('Profile updated successfully!');
      } else {
        // Try to get error details
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to save profile';

        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json();
            console.error('Backend error:', errorData);
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
        } else {
          const textError = await response.text();
          console.error('Non-JSON error response:', textError);
          errorMessage = textError || `Error ${response.status}`;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = async () => {
    if (!newLinkUrl.trim()) {
      toast.error('URL is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me/social-links`, {
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
    if (!editingLink || !newLinkUrl.trim()) {
      toast.error('URL is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me/social-links/${editingLink.id}`, {
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

  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  const handleDeleteSocialLink = async (linkId: string) => {
    setDeletingLinkId(linkId);
  };

  const confirmDeleteLink = async () => {
    if (!deletingLinkId) return;

    try {
      const response = await fetch(`${API_URL}/users/me/social-links/${deletingLinkId}`, {
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

    if (draggedIndex === null || draggedIndex === dropIndex) {
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
      const response = await fetch(`${API_URL}/users/me/social-links/reorder`, {
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

  const handleImageUpload = async (type: 'image' | 'banner', file: File) => {
    // Validate file size (5MB for avatar, 10MB for banner)
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${type === 'image' ? '5MB' : '10MB'}`);
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await fetch(`${API_URL}/users/me/${type}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        await fetchProfile();
        toast.success(`${type === 'image' ? 'Avatar' : 'Banner'} updated successfully!`);
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to upload image' }));
        toast.error(error.message || `Failed to upload ${type}`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}. Please try again.`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlatformInfo = (type: string) => {
    return SOCIAL_PLATFORMS.find(p => p.type === type) || SOCIAL_PLATFORMS.find(p => p.type === 'CUSTOM')!;
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
      <h1 className="font-hebden text-3xl font-bold text-foreground">Edit Profile</h1>

      {/* Banner and Avatar Section */}
      <div className="bg-secondary/30 rounded-lg overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
          {profile?.banner && (
            <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

          <div className="absolute top-4 right-4 flex gap-2">
            {profile?.banner && (
              <Button
                variant="destructive"
                size="sm"
                className="h-9 px-4 font-nunito"
                onClick={() => setShowDeleteBannerDialog(true)}
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

        {/* Avatar */}
        <div className="px-6 -mt-16 pb-6">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile?.image || undefined} alt={profile?.displayName || 'User'} />
              <AvatarFallback className="bg-primary text-white font-hebden text-3xl">
                {profile?.displayName ? getInitials(profile.displayName) : 'U'}
              </AvatarFallback>
            </Avatar>

            <label className="absolute bottom-0 right-0 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('image', e.target.files[0])}
              />
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full hover:bg-primary/80 transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <h2 className="font-hebden text-xl font-semibold mb-6 text-foreground">Profile Information</h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Display Name</Label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="font-nunito"
            />
          </div>

          <div>
            <Label className="mb-2 block">Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Tell us about yourself..."
              rows={4}
              className="font-nunito resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Location</Label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="font-nunito"
              />
            </div>

            <div>
              <Label className="mb-2 block">Website</Label>
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="font-nunito"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="font-hebden"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Social Links */}
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
                      onClick={() => handleDeleteSocialLink(link.id)}
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

      {/* Statistics */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <h2 className="font-hebden text-xl font-semibold mb-6 text-foreground">Statistics</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold font-hebden text-foreground">{profile?._count.followers || 0}</p>
            <p className="text-sm text-muted-foreground font-nunito">Followers</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold font-hebden text-foreground">{profile?._count.following || 0}</p>
            <p className="text-sm text-muted-foreground font-nunito">Following</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold font-hebden text-foreground">{profile?._count.ownedResources || 0}</p>
            <p className="text-sm text-muted-foreground font-nunito">Resources</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold font-hebden text-foreground">{profile?._count.ownedServers || 0}</p>
            <p className="text-sm text-muted-foreground font-nunito">Servers</p>
          </div>
        </div>
      </div>

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
        description={editingLink ? 'Update your social link information' : 'Add a new social link to your profile'}
        submitText={editingLink ? 'Update Link' : 'Add Link'}
        onSubmit={(e) => {
          e.preventDefault();
          if (editingLink) {
            handleUpdateSocialLink();
          } else {
            handleAddSocialLink();
          }
        }}
        onCancel={() => {
          setShowAddLinkDialog(false);
          setEditingLink(null);
          setNewLinkUrl('');
          setNewLinkLabel('');
        }}
      >
        <div className="space-y-4">
          {!editingLink && (
            <div>
              <Label className="mb-2 block">Platform</Label>
              <Select
                value={newLinkType}
                onValueChange={setNewLinkType}
              >
                <SelectTrigger className="font-nunito">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.type} value={platform.type} className="font-nunito">
                      <div className="flex items-center gap-2">
                        <Icon icon={platform.icon} width="16" height="16" />
                        {platform.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="mb-2 block">URL</Label>
            <Input
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="font-nunito"
              required
            />
          </div>

          <div>
            <Label className="mb-2 block">
              Custom Label (Optional)
            </Label>
            <Input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Follow me on..."
              className="font-nunito"
            />
          </div>
        </div>
      </OrbisFormDialog>

      {/* Delete Confirmation Dialog */}
      <OrbisConfirmDialog
        open={!!deletingLinkId}
        onOpenChange={(open) => !open && setDeletingLinkId(null)}
        title="Delete Social Link"
        description="Are you sure you want to delete this social link? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteLink}
        onCancel={() => setDeletingLinkId(null)}
      >
        <></>
      </OrbisConfirmDialog>

      {/* Delete Banner Confirmation Dialog */}
      <OrbisConfirmDialog
        open={showDeleteBannerDialog}
        onOpenChange={setShowDeleteBannerDialog}
        title="Delete Banner"
        description="Are you sure you want to delete your banner? This action cannot be undone."
        confirmText="Delete Banner"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          try {
            const response = await fetch(`${API_URL}/users/me/banner`, {
              method: 'DELETE',
              credentials: 'include',
            });
            if (response.ok) {
              await fetchProfile();
              toast.success('Banner deleted successfully!');
            } else {
              toast.error('Failed to delete banner');
            }
          } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Failed to delete banner');
          } finally {
            setShowDeleteBannerDialog(false);
          }
        }}
        onCancel={() => setShowDeleteBannerDialog(false)}
      >
        <></>
      </OrbisConfirmDialog>
    </div>
  );
}
