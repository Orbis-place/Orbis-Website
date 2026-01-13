'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbisFormDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { GripVertical, ExternalLink, Edit2, Trash2, Plus } from 'lucide-react';
import { useResource } from '@/contexts/ResourceContext';
import {
    fetchExternalLinks,
    createExternalLink,
    updateExternalLink,
    deleteExternalLink,
    reorderExternalLinks,
    type ExternalLink as ExternalLinkType
} from '@/lib/api/resources';

const LINK_TYPES = [
    { value: 'ISSUE_TRACKER', label: 'Issue Tracker', icon: 'mdi:bug', color: '#F87171' },
    { value: 'SOURCE_CODE', label: 'Source Code', icon: 'mdi:github', color: '#A78BFA' },
    { value: 'WIKI', label: 'Wiki', icon: 'mdi:book-open-variant', color: '#60A5FA' },
    { value: 'DISCORD', label: 'Discord', icon: 'mdi:discord', color: '#818CF8' },
    { value: 'DONATION', label: 'Donation', icon: 'mdi:heart', color: '#FB7185' },
    { value: 'WEBSITE', label: 'Website', icon: 'mdi:web', color: '#34D399' },
    { value: 'OTHER', label: 'Other', icon: 'mdi:link', color: '#94A3B8' },
];

export default function ManageLinksPage() {
    const { resource } = useResource();

    const [loading, setLoading] = useState(true);
    const [externalLinks, setExternalLinks] = useState<ExternalLinkType[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<ExternalLinkType | null>(null);
    const [deletingLink, setDeletingLink] = useState<ExternalLinkType | null>(null);
    const [formData, setFormData] = useState({ type: 'WEBSITE', url: '', label: '' });

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (resource?.id) {
            loadLinks();
        }
    }, [resource?.id]);

    const loadLinks = async () => {
        if (!resource?.id) return;

        try {
            setLoading(true);
            const links = await fetchExternalLinks(resource.id);
            setExternalLinks(links);
        } catch (error) {
            console.error('Failed to fetch links:', error);
            toast.error('Failed to load external links');
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setFormData({ type: 'WEBSITE', url: '', label: '' });
        setEditingLink(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (link: ExternalLinkType) => {
        setFormData({ type: link.type, url: link.url, label: link.label || '' });
        setEditingLink(link);
        setIsDialogOpen(true);
    };

    const handleSubmitDialog = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resource?.id) return;

        if (!formData.url) {
            toast.error('URL is required');
            return;
        }

        // Basic URL validation
        try {
            new URL(formData.url);
        } catch {
            toast.error('Please enter a valid URL');
            return;
        }

        try {
            if (editingLink) {
                await updateExternalLink(resource.id, editingLink.id, {
                    url: formData.url,
                    label: formData.label || undefined,
                });
                toast.success('Link updated successfully');
            } else {
                await createExternalLink(resource.id, {
                    type: formData.type,
                    url: formData.url,
                    label: formData.label || undefined,
                });
                toast.success('Link added successfully');
            }
            setIsDialogOpen(false);
            loadLinks();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save link');
        }
    };

    const handleDeleteLink = async () => {
        if (!deletingLink || !resource?.id) return;

        try {
            await deleteExternalLink(resource.id, deletingLink.id);
            toast.success('Link removed successfully');
            setDeletingLink(null);
            loadLinks();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete link');
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

        if (!resource?.id || draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        // Create new order
        const newLinks = [...externalLinks];
        const [draggedLink] = newLinks.splice(draggedIndex, 1);
        if (!draggedLink) return;
        newLinks.splice(dropIndex, 0, draggedLink);

        // Update local state immediately for responsive UI
        setExternalLinks(newLinks);
        setDraggedIndex(null);
        setDragOverIndex(null);

        // Send to backend
        try {
            const linkIds = newLinks.map(link => link.id);
            await reorderExternalLinks(resource.id, linkIds);
            toast.success('Links reordered successfully!');
            loadLinks(); // Refresh to get server order
        } catch (error: any) {
            await loadLinks(); // Revert on error
            toast.error(error.message || 'Failed to reorder links');
        }
    };

    if (!resource || loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    const getLinkTypeInfo = (type: string) => LINK_TYPES.find(t => t.value === type) || LINK_TYPES[LINK_TYPES.length - 1];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-hebden text-3xl font-bold text-foreground">External Links</h1>
                    <p className="text-muted-foreground mt-1 font-nunito">
                        Add links to external resources like source code, documentation, or community channels
                    </p>
                </div>
                <Button className="font-hebden" onClick={openAddDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                </Button>
            </div>

            {/* Links List */}
            {externalLinks.length > 0 ? (
                <div className="space-y-3">
                    {externalLinks.map((link, index) => {
                        const linkType = getLinkTypeInfo(link.type);
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

                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: linkType?.color + '20' }}
                                >
                                    <Icon ssr={true} icon={linkType?.icon || 'mdi:link'}
                                        width="24"
                                        height="24"
                                        style={{ color: linkType?.color }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-hebden text-lg font-semibold text-foreground">
                                        {link.label || linkType?.label}
                                    </h3>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline font-nunito truncate block"
                                    >
                                        {link.url}
                                    </a>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.open(link.url, '_blank')}
                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </button>

                                    <button
                                        onClick={() => openEditDialog(link)}
                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    </button>

                                    <button
                                        onClick={() => setDeletingLink(link)}
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
                <div className="bg-secondary/30 rounded-lg p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            <Icon ssr={true} icon="mdi:link-variant-off" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-nunito text-lg mb-2">No external links yet</p>
                        <p className="text-muted-foreground font-nunito text-sm mb-6 max-w-md">
                            Add links to help users find related resources like your source code, documentation, or community channels.
                        </p>
                        <Button className="font-hebden" onClick={openAddDialog}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Link
                        </Button>
                    </div>
                </div>
            )}

            {/* Add/Edit Link Dialog */}
            <OrbisFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={editingLink ? 'Edit Link' : 'Add External Link'}
                description={editingLink ? 'Update the link details below' : 'Add a new external link to your resource'}
                onSubmit={handleSubmitDialog}
                submitText={editingLink ? 'Update Link' : 'Add Link'}
                submitLoading={false}
                onCancel={() => setIsDialogOpen(false)}
                size="md"
            >
                <div className="space-y-4">
                    {!editingLink && (
                        <div className="space-y-2">
                            <Label htmlFor="link-type" className="font-nunito">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger id="link-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LINK_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon ssr={true} icon={type.icon} width="16" height="16" style={{ color: type.color }} />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="link-url" className="font-nunito">
                            URL <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="link-url"
                            placeholder="https://example.com"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link-label" className="font-nunito">
                            Custom Label <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                            id="link-label"
                            placeholder={`e.g., "Official Documentation"`}
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        />
                    </div>
                </div>
            </OrbisFormDialog>

            {/* Delete Confirmation Dialog */}
            <OrbisConfirmDialog
                open={!!deletingLink}
                onOpenChange={(open) => !open && setDeletingLink(null)}
                title="Delete Link"
                description="Are you sure you want to delete this link? This action cannot be undone."
                confirmText="Delete Link"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteLink}
                onCancel={() => setDeletingLink(null)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}
