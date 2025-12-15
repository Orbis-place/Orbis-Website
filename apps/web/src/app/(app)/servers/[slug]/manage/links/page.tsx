'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useServer } from '@/contexts/ServerContext';
import { OrbisConfirmDialog, OrbisFormDialog } from '@/components/OrbisDialog';
import { Plus, Trash2, Edit2, GripVertical, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default function ServerLinksPage() {
    const router = useRouter();
    const { server, isLoading, isOwner } = useServer();

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

    useEffect(() => {
        if (!isOwner && !isLoading) {
            router.push(`/servers/${server?.slug || ''}`);
        }
    }, [isOwner, isLoading, router, server]);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    if (!server || !isOwner) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-hebden text-foreground">Social Links</h1>
                    <p className="text-muted-foreground mt-1 font-nunito">
                        Add and manage social links for your server
                    </p>
                </div>
                <Button onClick={() => setShowAddLinkDialog(true)} className="font-hebden">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                </Button>
            </div>

            {/* Social Links List */}
            {socialLinks.length > 0 ? (
                <div className="bg-secondary/30 rounded-lg p-6">
                    <p className="text-sm text-muted-foreground font-nunito mb-4">
                        Drag and drop to reorder your social links
                    </p>
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
                </div>
            ) : (
                <div className="bg-secondary/30 rounded-lg p-12 text-center">
                    <div className="p-4 bg-accent rounded-full mb-4 inline-block">
                        <Icon icon="mdi:link-variant-off" width="48" height="48" className="text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-nunito text-lg mb-2">No social links yet</p>
                    <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md mx-auto">
                        Add social links to help players connect with your server community on different platforms.
                    </p>
                    <Button onClick={() => setShowAddLinkDialog(true)} className="font-hebden">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Link
                    </Button>
                </div>
            )}

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
