'use client'

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
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
import { OrbisConfirmDialog, OrbisFormDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, GripVertical, ExternalLink } from 'lucide-react';

interface TeamMember {
    id: string;
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
        id: string;
        name: string;
        username: string;
        email: string;
        image?: string;
    };
}

interface SocialLink {
    id: string;
    type: string;
    url: string;
    label?: string;
    order: number;
}

interface Team {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    banner?: string;
    members: TeamMember[];
    socialLinks?: SocialLink[];
    _count?: {
        members: number;
        resources: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default function TeamManageGeneralPage() {
    const params = useParams();
    const router = useRouter();
    const { session } = useSessionStore();
    const teamName = params.teamName as string;

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        displayName: '',
        description: '',
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

    const [showLeaveTeamDialog, setShowLeaveTeamDialog] = useState(false);
    const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);

    const userRole = team?.members?.find(m => m.user.id === session?.user?.id)?.role;
    const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';
    const isOwner = userRole === 'OWNER';

    useEffect(() => {
        fetchTeam();
    }, [teamName]);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/teams/${teamName}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch team');
            }

            const data = await response.json();
            setTeam(data);
            // Initialize social links from the team data
            if (data.socialLinks) {
                setSocialLinks(data.socialLinks);
            }
            setFormData({
                displayName: data.displayName,
                description: data.description || '',
            });
        } catch (error) {
            console.error('Error fetching team:', error);
            toast.error('Failed to load team');
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team?.id) return;

        try {
            setIsSaving(true);
            const response = await fetch(`${API_URL}/teams/${team.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update team');
            }

            const updatedTeam = await response.json();
            setTeam(updatedTeam);
            setIsEditing(false);
            toast.success('Team updated successfully!');
        } catch (error) {
            console.error('Error updating team:', error);
            toast.error('Failed to update team');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
        if (!team?.id) return;

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            toast.error(`File size must be less than 5MB`);
            return;
        }

        try {
            const formData = new FormData();
            formData.append(type, file);

            const response = await fetch(`${API_URL}/teams/${team.id}/${type}`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload ${type}`);
            }

            await fetchTeam();
            toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!`);
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            toast.error(`Failed to upload ${type}`);
        }
    };

    const handleDeleteFile = async (type: 'logo' | 'banner') => {
        if (!team?.id) return;

        try {
            const response = await fetch(`${API_URL}/teams/${team.id}/${type}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete ${type}`);
            }

            await fetchTeam();
            toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} deleted successfully!`);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            toast.error(`Failed to delete ${type}`);
        }
    };

    const handleLeaveTeam = async () => {
        if (!team?.id) return;

        try {
            const response = await fetch(`${API_URL}/teams/${team.id}/leave`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to leave team');
            }

            toast.success('Left team successfully');
            router.push('/dashboard/teams');
        } catch (error) {
            console.error('Error leaving team:', error);
            toast.error('Failed to leave team');
        } finally {
            setShowLeaveTeamDialog(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!team?.id) return;

        try {
            const response = await fetch(`${API_URL}/teams/${team.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete team');
            }

            toast.success('Team deleted successfully');
            router.push('/dashboard/teams');
        } catch (error) {
            console.error('Error deleting team:', error);
            toast.error('Failed to delete team');
        } finally {
            setShowDeleteTeamDialog(false);
        }
    };

    //  Social links functions
    const fetchSocialLinks = async () => {
        if (!team?.id) return;
        try {
            const response = await fetch(`${API_URL}/teams/${team.id}/social-links`, {
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
        if (!newLinkUrl.trim() || !team?.id) {
            toast.error('URL is required');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/teams/${team.id}/social-links`, {
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
        if (!editingLink || !newLinkUrl.trim() || !team?.id) {
            toast.error('URL is required');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/teams/${team.id}/social-links/${editingLink.id}`, {
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
        if (!deletingLinkId || !team?.id) return;

        try {
            const response = await fetch(`${API_URL}/teams/${team.id}/social-links/${deletingLinkId}`, {
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

        if (draggedIndex === null || draggedIndex === dropIndex || !team?.id) {
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
            console.log('Reorder Debug:', {
                teamId: team.id,
                linkIds,
                socialLinks: newLinks,
            });
            const response = await fetch(`${API_URL}/teams/${team.id}/social-links/reorder`, {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:account-group-outline" width="48" height="48" className="text-muted-foreground" />
                <p className="text-foreground font-nunito text-lg mt-4">Team not found</p>
                <Button onClick={() => router.push('/dashboard/teams')} className="mt-4 font-hebden">
                    Back to Teams
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-hebden text-foreground">General Settings</h1>
                {!isOwner && (
                    <Button
                        onClick={() => setShowLeaveTeamDialog(true)}
                        variant="destructive"
                        className="font-hebden"
                    >
                        <Icon ssr={true} icon="mdi:exit-to-app" width="20" height="20" />
                        Leave Team
                    </Button>
                )}
            </div>

            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden">
                {team.banner && (
                    <Image
                        src={team.banner}
                        alt={`${team.name} banner`}
                        fill
                        className="object-cover"
                    />
                )}
                {canEdit && (
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
                            <Icon ssr={true} icon="mdi:upload" width="16" height="16" />
                            Upload Banner
                        </Button>
                        {team.banner && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteFile('banner')}
                                className="font-hebden"
                            >
                                <Icon ssr={true} icon="mdi:delete" width="16" height="16" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Team Info */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-start gap-6">
                    {/* Logo */}
                    <div className="relative">
                        {team.logo ? (
                            <Image
                                src={team.logo}
                                alt={team.name}
                                width={96}
                                height={96}
                                className="rounded-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Icon ssr={true} icon="mdi:account-group" width="48" height="48" />
                            </div>
                        )}
                        {canEdit && (
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
                                    <Icon ssr={true} icon="mdi:upload" width="16" height="16" />
                                </Button>
                                {team.logo && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteFile('logo')}
                                        className="font-hebden h-8 w-8 p-0"
                                    >
                                        <Icon ssr={true} icon="mdi:delete" width="16" height="16" />
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
                                        <h2 className="text-2xl font-bold font-hebden text-foreground">{team.name}</h2>
                                        <p className="text-muted-foreground font-nunito">@{team.name}</p>
                                    </div>
                                    {canEdit && (
                                        <Button onClick={() => setIsEditing(true)} className="font-hebden">
                                            <Icon ssr={true} icon="mdi:pencil" width="20" height="20" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                                {team.description && (
                                    <p className="text-foreground font-nunito">{team.description}</p>
                                )}
                                <div className="flex gap-4 text-sm text-muted-foreground font-nunito">
                                    <span className="flex items-center gap-1">
                                        <Icon ssr={true} icon="mdi:account-group" width="16" height="16" />
                                        {team._count?.members || team.members.length} members
                                    </span>
                                    {team._count?.resources !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <Icon ssr={true} icon="mdi:package-variant" width="16" height="16" />
                                            {team._count.resources} resources
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateTeam} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Display Name *</Label>
                                    <Input
                                        id="displayName"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
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
                                <div className="flex gap-2">
                                    <Button type="submit" className="font-hebden" disabled={isSaving}>
                                        {isSaving && <Icon ssr={true} icon="mdi:loading" className="animate-spin" width="20" height="20" />}
                                        {!isSaving && <Icon ssr={true} icon="mdi:check" width="20" height="20" />}
                                        Save Changes
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                displayName: team.name,
                                                description: team.description || '',
                                            });
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
            {canEdit && (
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

                                        <Icon ssr={true} icon={platformInfo.icon}
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
                            <Icon ssr={true} icon="mdi:link-variant-off" width="48" height="48" className="mx-auto text-muted-foreground mb-3" />
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
                        Once you delete a team, there is no going back. Please be certain.
                    </p>
                    <Button
                        onClick={() => setShowDeleteTeamDialog(true)}
                        variant="destructive"
                        className="font-hebden"
                    >
                        <Icon ssr={true} icon="mdi:delete" width="20" height="20" />
                        Delete Team
                    </Button>
                </div>
            )}

            {/* Leave Team Confirmation Dialog */}
            <OrbisConfirmDialog
                open={showLeaveTeamDialog}
                onOpenChange={(open) => !open && setShowLeaveTeamDialog(false)}
                title="Leave Team"
                description="Are you sure you want to leave this team?"
                confirmText="Leave Team"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleLeaveTeam}
                onCancel={() => setShowLeaveTeamDialog(false)}
            >
                <></>
            </OrbisConfirmDialog>

            {/* Delete Team Confirmation Dialog */}
            <OrbisConfirmDialog
                open={showDeleteTeamDialog}
                onOpenChange={(open) => !open && setShowDeleteTeamDialog(false)}
                title="Delete Team"
                description="Are you sure you want to delete this team? This action cannot be undone."
                confirmText="Delete Team"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteTeam}
                onCancel={() => setShowDeleteTeamDialog(false)}
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
                description={editingLink ? 'Update your social link information' : 'Add a new social link to your team'}
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
                                                <Icon ssr={true} icon={platform.icon} width="16" height="16" />
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
                            placeholder="Follow us on..."
                            className="font-nunito"
                        />
                    </div>
                </div>
            </OrbisFormDialog>

            {/* Delete Link Confirmation Dialog */}
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
        </div>
    );
}
