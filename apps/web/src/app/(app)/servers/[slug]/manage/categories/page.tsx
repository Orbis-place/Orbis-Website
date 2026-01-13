'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useServer } from '@/contexts/ServerContext';
import { cn } from '@/lib/utils';
import { ServerTagSearchInput } from '@/components/ServerTagSearchInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ServerCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
}

interface ServerTag {
    id: string;
    name: string;
    slug: string;
    usageCount?: number;
}

export default function ServerCategoriesPage() {
    const router = useRouter();
    const { server, isLoading, isOwner } = useServer();

    const [categories, setCategories] = useState<ServerCategory[]>([]);
    const [popularTags, setPopularTags] = useState<ServerTag[]>([]);
    const [selectedPrimaryCategoryId, setSelectedPrimaryCategoryId] = useState<string>('');
    const [selectedSecondaryCategoryIds, setSelectedSecondaryCategoryIds] = useState<string[]>([]);
    const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOwner && !isLoading) {
            router.push(`/servers/${server?.slug || ''}`);
        }
    }, [isOwner, isLoading, router, server]);

    useEffect(() => {
        fetchCategories();
        fetchPopularTags();
    }, []);

    useEffect(() => {
        if (server) {
            // Set primary category
            const primaryCategory = server.categories?.find((c: any) => c.isPrimary)?.category;
            setSelectedPrimaryCategoryId(primaryCategory?.id || '');

            // Set secondary categories
            const secondaryCategories = server.categories
                ?.filter((c: any) => !c.isPrimary)
                ?.map((c: any) => c.category.id) || [];
            setSelectedSecondaryCategoryIds(secondaryCategories);

            // Set tags - use tag names instead of IDs
            const tagNames = server.tags?.map((t: any) => t.tag.name) || [];
            setSelectedTagNames(tagNames);
        }
    }, [server]);

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

    const fetchPopularTags = async () => {
        try {
            const response = await fetch(`${API_URL}/server-tags/popular?limit=20`);
            if (response.ok) {
                const data = await response.json();
                setPopularTags(data);
            }
        } catch (error) {
            console.error('Failed to fetch popular tags:', error);
        }
    };

    const handleToggleSecondaryCategory = (categoryId: string) => {
        setSelectedSecondaryCategoryIds(current => {
            if (current.includes(categoryId)) {
                return current.filter(id => id !== categoryId);
            } else if (current.length < 2) {
                return [...current, categoryId];
            }
            return current;
        });
    };

    const handleToggleTag = (tagName: string) => {
        setSelectedTagNames(current => {
            if (current.includes(tagName)) {
                return current.filter(name => name !== tagName);
            } else if (current.length < 10) {
                return [...current, tagName];
            }
            return current;
        });
    };

    const handleSave = async () => {
        if (!server?.id) return;

        if (!selectedPrimaryCategoryId) {
            toast.error('Please select a primary category');
            return;
        }

        setSaving(true);
        try {
            // Get current tags
            const currentTagNames = server.tags?.map((t: any) => t.tag.name) || [];

            // Prepare update data
            const updateData: any = {};

            // Handle categories - send complete list with primary and secondary
            // Backend expects both primaryCategoryId and categoryIds together
            const allCategoryIds = [selectedPrimaryCategoryId, ...selectedSecondaryCategoryIds];
            updateData.primaryCategoryId = selectedPrimaryCategoryId;
            updateData.categoryIds = allCategoryIds;

            // Handle tags - send tag names
            const tagsToAdd: string[] = [];
            const tagsToRemove: string[] = [];

            for (const tagName of selectedTagNames) {
                if (!currentTagNames.includes(tagName)) {
                    tagsToAdd.push(tagName);
                }
            }

            for (const oldTagName of currentTagNames) {
                if (!selectedTagNames.includes(oldTagName)) {
                    tagsToRemove.push(oldTagName);
                }
            }

            if (tagsToAdd.length > 0) updateData.addTags = tagsToAdd;
            if (tagsToRemove.length > 0) updateData.removeTags = tagsToRemove;

            const response = await fetch(`${API_URL}/servers/${server.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Failed to update server');
            }

            toast.success('Categories and tags updated successfully!');

            // Refresh server data
            window.location.reload();
        } catch (error) {
            console.error('Error updating server:', error);
            toast.error('Failed to update categories and tags');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    if (!server || !isOwner) {
        return null;
    }

    // Popular tags for display
    const filteredPopularTags = popularTags.filter(tag => !selectedTagNames.includes(tag.name));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold font-hebden text-foreground">Categories & Tags</h1>
                <p className="text-muted-foreground mt-1 font-nunito">
                    Organize your server with categories and tags to help players find it
                </p>
            </div>

            {/* Primary Category */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold text-foreground mb-2">Primary Category *</h2>
                <p className="text-muted-foreground font-nunito text-sm mb-4">
                    Choose the main category that best describes your server
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((category) => {
                        const isSelected = selectedPrimaryCategoryId === category.id;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedPrimaryCategoryId(category.id)}
                                className={cn(
                                    'p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3',
                                    isSelected
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-background hover:border-primary/50'
                                )}
                            >
                                {category.icon && (
                                    <Icon ssr={true} icon={category.icon}
                                        width="24"
                                        height="24"
                                        className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-nunito font-medium text-foreground">
                                        {category.name}
                                    </div>
                                </div>
                                {isSelected && (
                                    <Icon ssr={true} icon="mdi:check-circle" width="20" height="20" className="text-primary flex-shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Secondary Categories */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold text-foreground mb-2">
                    Secondary Categories (Optional)
                </h2>
                <p className="text-muted-foreground font-nunito text-sm mb-4">
                    Select up to 2 additional categories ({selectedSecondaryCategoryIds.length}/2 selected)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories
                        .filter(cat => cat.id !== selectedPrimaryCategoryId)
                        .map((category) => {
                            const isSelected = selectedSecondaryCategoryIds.includes(category.id);
                            const canSelect = selectedSecondaryCategoryIds.length < 2 || isSelected;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleToggleSecondaryCategory(category.id)}
                                    disabled={!canSelect}
                                    className={cn(
                                        'p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3',
                                        isSelected
                                            ? 'border-primary bg-primary/10'
                                            : canSelect
                                                ? 'border-border bg-background hover:border-primary/50'
                                                : 'border-border/30 bg-secondary/20 opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {category.icon && (
                                        <Icon ssr={true} icon={category.icon}
                                            width="24"
                                            height="24"
                                            className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-nunito font-medium text-foreground">
                                            {category.name}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Icon ssr={true} icon="mdi:check-circle" width="20" height="20" className="text-primary flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                </div>
            </div>

            {/* Tags */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold text-foreground mb-2">Tags</h2>
                <p className="text-muted-foreground font-nunito text-sm mb-4">
                    Add tags to help players find your server. Search for existing tags or create new ones.
                </p>

                {/* Tag Search Input */}
                <div className="space-y-4 mb-4">
                    <div>
                        <Label className="font-nunito text-foreground mb-2 block">
                            Search and Add Tags
                        </Label>
                        <ServerTagSearchInput
                            selectedTags={selectedTagNames}
                            onTagsChange={setSelectedTagNames}
                        />
                    </div>
                </div>

                {/* Selected Tags */}
                {selectedTagNames.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <Label className="font-nunito text-foreground">
                            Selected Tags ({selectedTagNames.length}/10)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedTagNames.map((tagName) => (
                                <div
                                    key={tagName}
                                    className="px-3 py-1.5 rounded-md text-sm font-nunito bg-primary/20 text-primary border border-primary/30 flex items-center gap-2"
                                >
                                    {tagName}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleTag(tagName)}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        <Icon ssr={true} icon="mdi:close" width="14" height="14" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular Tags */}
                <div className="space-y-2">
                    <Label className="font-nunito text-foreground">Popular Tags</Label>
                    {selectedTagNames.length >= 10 && (
                        <p className="text-xs text-muted-foreground font-nunito">
                            Maximum limit reached. Remove tags to add more.
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {filteredPopularTags.map((tag) => {
                            const isDisabled = selectedTagNames.length >= 10;
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleToggleTag(tag.name)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'px-3 py-1.5 rounded-md text-sm font-nunito transition-all',
                                        isDisabled
                                            ? 'bg-secondary/50 text-muted-foreground border border-border/50 opacity-50 cursor-not-allowed'
                                            : 'bg-secondary text-foreground border border-border hover:border-primary/50'
                                    )}
                                >
                                    {tag.name}
                                    {tag.usageCount !== undefined && (
                                        <span className="ml-1 text-xs text-muted-foreground">({tag.usageCount})</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="font-hebden">
                    {saving ? (
                        <>
                            <Icon ssr={true} icon="mdi:loading" width="20" height="20" className="animate-spin mr-2" />
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Icon ssr={true} icon="mdi:check" width="20" height="20" className="mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
