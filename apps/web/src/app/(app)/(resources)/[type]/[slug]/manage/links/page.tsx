'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbisFormDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';

interface Resource {
    id: string;
    externalLinks?: ExternalLink[];
}

interface ExternalLink {
    id?: string;
    type: string;
    url: string;
    label?: string;
}

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
    const params = useParams();
    const resourceSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resource, setResource] = useState<Resource | null>(null);
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState({ type: 'WEBSITE', url: '', label: '' });

    useEffect(() => {
        fetchResource();
    }, [resourceSlug]);

    const fetchResource = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${resourceSlug}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                const res = data.resource as Resource;
                setResource(res);
                if (res.externalLinks) setExternalLinks(res.externalLinks);
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setFormData({ type: 'WEBSITE', url: '', label: '' });
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (index: number) => {
        const link = externalLinks[index];
        if (!link) return;
        setFormData({ type: link.type, url: link.url, label: link.label || '' });
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const saveLinks = async (updatedLinks: ExternalLink[]) => {
        if (!resource) return;

        try {
            const existingLinks = updatedLinks.filter(l => l.id);
            const newLinks = updatedLinks.filter(l => !l.id);

            const updateData = {
                externalLinks: [...existingLinks, ...newLinks],
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update links');
            }

            fetchResource(); // Refresh to get new IDs
        } catch (error) {
            console.error('Failed to update links:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update links');
            throw error;
        }
    };

    const handleSubmitDialog = async (e: React.FormEvent) => {
        e.preventDefault();

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

        setSaving(true);
        let updatedLinks: ExternalLink[];

        if (editingIndex !== null) {
            // Update existing link
            updatedLinks = [...externalLinks];
            updatedLinks[editingIndex] = { ...updatedLinks[editingIndex], ...formData };
        } else {
            // Add new link
            updatedLinks = [...externalLinks, { ...formData, id: '' }];
        }

        try {
            await saveLinks(updatedLinks);
            setExternalLinks(updatedLinks);
            toast.success(editingIndex !== null ? 'Link updated successfully' : 'Link added successfully');
            setIsDialogOpen(false);
        } catch {
            // Error already shown in saveLinks
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLink = async () => {
        if (deletingIndex === null || !resource) return;

        setSaving(true);
        const updatedLinks = externalLinks.filter((_, i) => i !== deletingIndex);

        try {
            await saveLinks(updatedLinks);
            setExternalLinks(updatedLinks);
            toast.success('Link removed successfully');
            setDeletingIndex(null);
        } catch {
            // Error already shown in saveLinks
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Icon icon="mdi:alert-circle" width="48" height="48" className="text-destructive mb-4" />
                <p className="font-nunito text-lg text-foreground/60">Resource not found</p>
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
                    <Icon icon="mdi:plus" width="20" height="20" />
                    Add Link
                </Button>
            </div>

            {/* Links List */}
            {externalLinks.length > 0 ? (
                <div className="space-y-3">
                    {externalLinks.map((link, index) => {
                        const linkType = getLinkTypeInfo(link.type);

                        return (
                            <div key={index} className="bg-secondary/30 rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: linkType?.color + '20' }}
                                    >
                                        <Icon
                                            icon={linkType?.icon || 'mdi:link'}
                                            width="24"
                                            height="24"
                                            style={{ color: linkType?.color }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-hebden text-lg font-semibold text-foreground mb-1">
                                            {link.label || linkType?.label}
                                        </h3>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline font-nunito truncate block mb-3"
                                        >
                                            {link.url}
                                        </a>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="font-nunito text-sm"
                                                onClick={() => openEditDialog(index)}
                                            >
                                                <Icon icon="mdi:pencil" width="16" height="16" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="font-nunito text-sm"
                                                onClick={() => setDeletingIndex(index)}
                                            >
                                                <Icon icon="mdi:delete" width="16" height="16" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-secondary/30 rounded-lg p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            <Icon icon="mdi:link-variant-off" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-nunito text-lg mb-2">No external links yet</p>
                        <p className="text-muted-foreground font-nunito text-sm mb-6 max-w-md">
                            Add links to help users find related resources like your source code, documentation, or community channels.
                        </p>
                        <Button className="font-hebden" onClick={openAddDialog}>
                            <Icon icon="mdi:plus" width="20" height="20" />
                            Add Your First Link
                        </Button>
                    </div>
                </div>
            )}



            {/* Add/Edit Link Dialog */}
            <OrbisFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={editingIndex !== null ? 'Edit Link' : 'Add External Link'}
                description={editingIndex !== null ? 'Update the link details below' : 'Add a new external link to your resource'}
                onSubmit={handleSubmitDialog}
                submitText={editingIndex !== null ? 'Update Link' : 'Add Link'}
                submitLoading={false}
                onCancel={() => setIsDialogOpen(false)}
                size="md"
            >
                <div className="space-y-4">
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
                                            <Icon icon={type.icon} width="16" height="16" style={{ color: type.color }} />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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
                open={deletingIndex !== null}
                onOpenChange={(open) => !open && setDeletingIndex(null)}
                title="Delete Link"
                description="Are you sure you want to delete this link? This action cannot be undone."
                confirmText="Delete Link"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteLink}
                onCancel={() => setDeletingIndex(null)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}
