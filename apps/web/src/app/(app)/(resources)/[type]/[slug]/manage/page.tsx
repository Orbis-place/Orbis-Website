'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, Trash2 } from 'lucide-react';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { cn } from '@/lib/utils';
import { TagSearchInput } from '@/components/TagSearchInput';

interface Resource {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    type: string;
    visibility: string;
    iconUrl?: string;
    bannerUrl?: string;
    tags?: Array<{
        tag: ResourceTag;
        featured: boolean;
    }>;
    categories?: Array<{
        category: ResourceCategory;
    }>;
}

interface ResourceCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    resourceTypes: string[];
}

interface ResourceTag {
    id: string;
    name: string;
    slug: string;
    usageCount?: number;
}

export default function ManageGeneralPage() {
    const params = useParams();
    const router = useRouter();
    const resourceSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resource, setResource] = useState<Resource | null>(null);
    const [availableTags, setAvailableTags] = useState<ResourceTag[]>([]);
    const [availableCategories, setAvailableCategories] = useState<ResourceCategory[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        type: 'PLUGIN',
        visibility: 'PUBLIC',
    });

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [showDeleteBannerDialog, setShowDeleteBannerDialog] = useState(false);
    const [showDeleteIconDialog, setShowDeleteIconDialog] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchResource();
        fetchTags();
    }, [resourceSlug]);

    // Fetch categories when resource type changes
    useEffect(() => {
        if (formData.type) {
            fetchCategories(formData.type);
        }
    }, [formData.type]);

    const fetchResource = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${resourceSlug}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                const res = data.resource as Resource;
                setResource(res);

                setFormData({
                    name: res.name,
                    tagline: res.tagline,
                    type: res.type,
                    visibility: res.visibility,
                });

                if (res.iconUrl) setIconPreview(res.iconUrl);
                if (res.bannerUrl) setBannerPreview(res.bannerUrl);

                if (res.tags) {
                    const tagIds = res.tags.map(t => t.tag.id);
                    setSelectedTags(tagIds);
                }

                if (res.categories) {
                    const categoryIds = res.categories.map(c => c.category.id);
                    setSelectedCategories(categoryIds);
                }
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resource-tags?limit=100`);
            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data);
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const fetchCategories = async (resourceType: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/categories?type=${resourceType}`
            );
            if (response.ok) {
                const data = await response.json();
                setAvailableCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIconFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(current =>
            current.includes(tagId)
                ? current.filter(id => id !== tagId)
                : [...current, tagId]
        );
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim() || formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }
        if (formData.name.length > 100) {
            newErrors.name = 'Name must be maximum 100 characters';
        }
        if (formData.tagline.length > 200) {
            newErrors.tagline = 'Tagline must be maximum 200 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !resource) {
            return;
        }

        setSaving(true);

        try {
            // Prepare update data
            const updateData: any = {
                name: formData.name,
                tagline: formData.tagline,
                type: formData.type,
                visibility: formData.visibility,
            };

            // Handle tags - Send tag names to the backend
            const currentTags = resource.tags?.map(t => t.tag.id) || [];
            const tagsToAdd: string[] = [];
            const tagsToRemove: string[] = [];

            // Find tags to add
            for (const tagId of selectedTags) {
                if (!currentTags.includes(tagId)) {
                    const tag = availableTags.find(t => t.id === tagId);
                    if (tag) {
                        // For existing tags, send the name
                        tagsToAdd.push(tag.name);
                    } else {
                        // For new tags (temp IDs), extract the name from the ID
                        // Temp IDs are in format: temp-{timestamp}-{normalized-name}
                        const tempIdMatch = tagId.match(/^temp-\d+-(.+)$/);
                        if (tempIdMatch) {
                            tagsToAdd.push(tempIdMatch[1].replace(/-/g, ' '));
                        }
                    }
                }
            }

            // Find tags to remove
            for (const oldTagId of currentTags) {
                if (!selectedTags.includes(oldTagId)) {
                    const tag = resource.tags?.find(t => t.tag.id === oldTagId)?.tag;
                    if (tag) {
                        tagsToRemove.push(tag.name);
                    }
                }
            }

            if (tagsToAdd.length > 0) updateData.addTags = tagsToAdd;
            if (tagsToRemove.length > 0) updateData.removeTags = tagsToRemove;

            // Handle categories
            const currentCategories = resource.categories?.map(c => c.category.id) || [];
            const categoriesToAdd = selectedCategories.filter(id => !currentCategories.includes(id));
            const categoriesToRemove = currentCategories.filter(id => !selectedCategories.includes(id));

            if (categoriesToAdd.length > 0) updateData.addCategories = categoriesToAdd;
            if (categoriesToRemove.length > 0) updateData.removeCategories = categoriesToRemove;

            // Update resource
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
                throw new Error(errorData.message || 'Failed to update resource');
            }

            // Upload icon if changed
            if (iconFile) {
                const formData = new FormData();
                formData.append('icon', iconFile);

                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}/icon`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
            }

            // Upload banner if changed
            if (bannerFile) {
                const formData = new FormData();
                formData.append('banner', bannerFile);

                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}/banner`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
            }

            toast.success('Resource updated successfully!');

            // Refresh data
            fetchResource();

        } catch (error) {
            console.error('Failed to update resource:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update resource');
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
            {/* Images Section */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-lg font-semibold mb-6 text-foreground">Images</h2>

                <div className="bg-background/50 rounded-xl overflow-hidden border border-border">
                    {/* Banner */}
                    <div className="relative h-48 bg-gradient-to-r from-primary/20 to-background/20">
                        {bannerPreview && (
                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#032125]/80 to-transparent" />

                        <div className="absolute top-4 right-4 flex gap-2">
                            {bannerPreview && (
                                <Button
                                    type="button"
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
                                    onChange={handleBannerChange}
                                />
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#032125]/80 text-[#C7F4FA] rounded-lg hover:bg-[#06363D] transition-colors h-9 border border-[#084B54]">
                                    <Camera className="w-4 h-4" />
                                    <span className="text-sm font-nunito">Change Banner</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Icon */}
                    <div className="px-6 -mt-16 pb-6">
                        <div className="relative inline-block">
                            <div className="h-32 w-32 border-4 border-[#032125] shadow-lg rounded-xl overflow-hidden bg-[#06363D]">
                                {iconPreview ? (
                                    <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#109EB1]/10">
                                        <Icon icon="mdi:image-outline" width="48" height="48" className="text-[#C7F4FA]/50" />
                                    </div>
                                )}
                            </div>

                            <label className="absolute bottom-0 right-0 cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleIconChange}
                                />
                                <div className="flex items-center justify-center w-10 h-10 bg-[#109EB1] rounded-full hover:bg-[#0D8A9A] transition-colors shadow-lg border-2 border-[#032125]">
                                    <Camera className="w-5 h-5 text-[#C7F4FA]" />
                                </div>
                            </label>
                        </div>

                        {iconPreview && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-4 mt-2 font-nunito text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setShowDeleteIconDialog(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Icon
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="font-hebden text-xl font-semibold text-[#C7F4FA]">Basic Information</h2>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-nunito text-[#C7F4FA]">Resource Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="My Awesome Plugin"
                            className={cn(
                                "bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]",
                                errors.name ? 'border-red-500' : ''
                            )}
                        />
                        {errors.name && <p className="text-sm text-red-500 font-nunito">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tagline" className="font-nunito text-[#C7F4FA]">Tagline *</Label>
                        <Input
                            id="tagline"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            placeholder="A short description of your resource"
                            maxLength={200}
                            className={cn(
                                "bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]",
                                errors.tagline ? 'border-red-500' : ''
                            )}
                        />
                        <p className="text-sm text-[#C7F4FA]/50 font-nunito">
                            {formData.tagline.length} / 200 characters
                        </p>
                        {errors.tagline && <p className="text-sm text-red-500 font-nunito">{errors.tagline}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="font-nunito text-[#C7F4FA]">Resource Type *</Label>
                            <Select
                                disabled
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                    <SelectItem value="PLUGIN">Plugin</SelectItem>
                                    <SelectItem value="MOD">Mod</SelectItem>
                                    <SelectItem value="WORLD">World</SelectItem>
                                    <SelectItem value="DATA_PACK">Data Pack</SelectItem>
                                    <SelectItem value="ASSET_PACK">Asset Pack</SelectItem>
                                    <SelectItem value="PREFAB">Prefab</SelectItem>
                                    <SelectItem value="MODPACK">Modpack</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="visibility" className="font-nunito text-[#C7F4FA]">Visibility *</Label>
                            <Select
                                value={formData.visibility}
                                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                            >
                                <SelectTrigger className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                    <SelectItem value="PUBLIC">Public - Visible to everyone</SelectItem>
                                    <SelectItem value="UNLISTED">Unlisted - Accessible via link only</SelectItem>
                                    <SelectItem value="PRIVATE">Private - Only visible to you</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="font-hebden text-xl font-semibold text-[#C7F4FA]">Tags</h2>

                <div className="space-y-4">
                    {/* Tag Search Input */}
                    <div className="space-y-2">
                        <Label className="font-nunito text-[#C7F4FA]">Search and Add Tags</Label>
                        <p className="text-sm text-[#C7F4FA]/50 font-nunito">
                            Search for existing tags or create new ones.
                        </p>
                        <TagSearchInput
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                            resourceType={formData.type}
                        />
                    </div>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                        <div className="space-y-2">
                            <Label className="font-nunito text-[#C7F4FA]">Selected Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tagId) => {
                                    const tag = availableTags.find(t => t.id === tagId);
                                    if (!tag) return null;

                                    return (
                                        <div
                                            key={tagId}
                                            className="px-3 py-1.5 rounded-md text-sm font-nunito bg-[#109EB1] text-[#C7F4FA] shadow-md flex items-center gap-2"
                                        >
                                            {tag.name}
                                            <button
                                                type="button"
                                                onClick={() => toggleTag(tagId)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <Icon icon="mdi:close" width="14" height="14" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-6">
                <h2 className="font-hebden text-xl font-semibold text-[#C7F4FA]">Categories</h2>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-nunito text-[#C7F4FA]">Select Categories (max 3)</Label>
                        <p className="text-sm text-[#C7F4FA]/50 font-nunito">
                            Choose up to 3 categories that best describe your resource.
                            {availableCategories.length === 0 && formData.type && (
                                <span className="block mt-1 text-yellow-400">
                                    Loading categories for {formData.type}...
                                </span>
                            )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableCategories.map((category) => {
                                const isSelected = selectedCategories.includes(category.id);
                                const canSelect = selectedCategories.length < 3 || isSelected;

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedCategories(current =>
                                                    current.filter(id => id !== category.id)
                                                );
                                            } else if (canSelect) {
                                                setSelectedCategories(current => [...current, category.id]);
                                            }
                                        }}
                                        disabled={!canSelect}
                                        className={cn(
                                            "p-3 rounded-lg border-2 transition-all text-left",
                                            "flex items-start gap-3",
                                            isSelected
                                                ? "border-[#109EB1] bg-[#109EB1]/10"
                                                : canSelect
                                                    ? "border-[#084B54] bg-[#032125] hover:border-[#109EB1]/50 hover:bg-[#032125]/80"
                                                    : "border-[#084B54]/30 bg-[#032125]/30 opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {category.icon && (
                                            <span className="text-2xl flex-shrink-0">{category.icon}</span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-nunito font-medium text-[#C7F4FA] flex items-center gap-2">
                                                {category.name}
                                                {isSelected && (
                                                    <Icon
                                                        icon="mdi:check-circle"
                                                        width="16"
                                                        height="16"
                                                        className="text-[#109EB1] flex-shrink-0"
                                                    />
                                                )}
                                            </div>
                                            {category.description && (
                                                <p className="text-xs text-[#C7F4FA]/60 mt-1 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Categories Summary */}
                    {selectedCategories.length > 0 && (
                        <div className="space-y-2">
                            <Label className="font-nunito text-[#C7F4FA]">Selected Categories</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((categoryId) => {
                                    const category = availableCategories.find(c => c.id === categoryId);
                                    if (!category) return null;

                                    return (
                                        <div
                                            key={categoryId}
                                            className="px-3 py-1.5 rounded-md text-sm font-nunito bg-[#109EB1] text-[#C7F4FA] shadow-md flex items-center gap-2"
                                        >
                                            {category.icon && <span>{category.icon}</span>}
                                            {category.name}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategories(current =>
                                                    current.filter(id => id !== categoryId)
                                                )}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <Icon icon="mdi:close" width="14" height="14" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-[#C7F4FA]/50 font-nunito">
                                {selectedCategories.length} / 3 categories selected
                            </p>
                        </div>
                    )}
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

            {/* Delete Banner Confirmation Dialog */}
            <OrbisConfirmDialog
                open={showDeleteBannerDialog}
                onOpenChange={setShowDeleteBannerDialog}
                title="Delete Banner"
                description="Are you sure you want to delete the banner? This action cannot be undone."
                confirmText="Delete Banner"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={async () => {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource?.id}/banner`, {
                            method: 'DELETE',
                            credentials: 'include',
                        });
                        if (response.ok) {
                            setBannerPreview(null);
                            setBannerFile(null);
                            toast.success('Banner deleted successfully!');
                        } else {
                            toast.error('Failed to delete banner');
                        }
                    } catch (error) {
                        console.error('Error deleting banner:', error);
                        toast.error('Failed to delete banner');
                    }
                }}
            />

            {/* Delete Icon Confirmation Dialog */}
            <OrbisConfirmDialog
                open={showDeleteIconDialog}
                onOpenChange={setShowDeleteIconDialog}
                title="Delete Icon"
                description="Are you sure you want to delete the icon? This action cannot be undone."
                confirmText="Delete Icon"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={async () => {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource?.id}/icon`, {
                            method: 'DELETE',
                            credentials: 'include',
                        });
                        if (response.ok) {
                            setIconPreview(null);
                            setIconFile(null);
                            toast.success('Icon deleted successfully!');
                        } else {
                            toast.error('Failed to delete icon');
                        }
                    } catch (error) {
                        console.error('Error deleting icon:', error);
                        toast.error('Failed to delete icon');
                    }
                }}
            />
        </form>
    );
}
