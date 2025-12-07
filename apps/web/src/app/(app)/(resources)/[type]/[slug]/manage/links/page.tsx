'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Resource {
    id: string;
    externalLinks?: ExternalLink[];
}

interface ExternalLink {
    id: string;
    type: string;
    url: string;
    label?: string;
}

const LINK_TYPES = [
    { value: 'ISSUE_TRACKER', label: 'Issue Tracker', icon: 'mdi:bug' },
    { value: 'SOURCE_CODE', label: 'Source Code', icon: 'mdi:github' },
    { value: 'WIKI', label: 'Wiki', icon: 'mdi:book-open-variant' },
    { value: 'DISCORD', label: 'Discord', icon: 'mdi:discord' },
    { value: 'DONATION', label: 'Donation', icon: 'mdi:heart' },
    { value: 'WEBSITE', label: 'Website', icon: 'mdi:web' },
    { value: 'OTHER', label: 'Other', icon: 'mdi:link' },
];

export default function ManageLinksPage() {
    const params = useParams();
    const resourceSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resource, setResource] = useState<Resource | null>(null);
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
    const [newLink, setNewLink] = useState({ type: 'WEBSITE', url: '', label: '' });

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

    const addExternalLink = () => {
        if (!newLink.url) {
            toast.error('URL is required');
            return;
        }

        setExternalLinks([...externalLinks, { ...newLink, id: '' }]);
        setNewLink({ type: 'WEBSITE', url: '', label: '' });
        toast.success('Link added');
    };

    const removeExternalLink = (index: number) => {
        setExternalLinks(externalLinks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resource) return;

        setSaving(true);

        try {
            const currentLinkIds = resource.externalLinks?.map(l => l.id) || [];
            const existingLinks = externalLinks.filter(l => l.id);
            const newLinks = externalLinks.filter(l => !l.id);

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

            toast.success('Links updated successfully!');
            fetchResource(); // Refresh to get new IDs
        } catch (error) {
            console.error('Failed to update links:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update links');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" width="48" height="48" className="text-[#109EB1] animate-spin" />
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-[#C7F4FA]">
                <p className="font-nunito text-lg mb-4">Resource not found</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="font-hebden text-xl font-semibold mb-6 text-[#C7F4FA]">External Links</h2>

                <div className="space-y-6">
                    {externalLinks.length > 0 && (
                        <div className="space-y-2">
                            <Label className="font-nunito text-[#C7F4FA]">Current Links</Label>
                            <div className="space-y-2">
                                {externalLinks.map((link, index) => {
                                    const linkType = LINK_TYPES.find(t => t.value === link.type);
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-[#032125] border border-[#084B54] rounded-lg">
                                            <Icon icon={linkType?.icon || 'mdi:link'} width="20" height="20" className="text-[#109EB1]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold font-hebden text-[#C7F4FA]">{link.label || linkType?.label}</p>
                                                <p className="text-xs text-[#C7F4FA]/60 font-nunito truncate">{link.url}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeExternalLink(index)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Icon icon="mdi:delete" width="18" height="18" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="font-nunito text-[#C7F4FA]">Add New Link</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Select
                                value={newLink.type}
                                onValueChange={(value) => setNewLink({ ...newLink, type: value })}
                            >
                                <SelectTrigger className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                    {LINK_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon icon={type.icon} width="16" height="16" />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="https://..."
                                value={newLink.url}
                                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                className="bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]"
                            />

                            <Input
                                placeholder="Label (optional)"
                                value={newLink.label}
                                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                                className="bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addExternalLink}
                            className="mt-2 border-[#084B54] text-[#C7F4FA] hover:bg-[#06363D] hover:text-[#C7F4FA]"
                        >
                            <Icon icon="mdi:plus" width="16" height="16" className="mr-2" />
                            Add Link
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-[#084B54]">
                <Button
                    type="submit"
                    disabled={saving}
                    className="font-hebden bg-[#109EB1] hover:bg-[#0D8A9A] text-[#C7F4FA]"
                >
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
            </div>
        </form>
    );
}
