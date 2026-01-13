'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrbisConfirmDialog, OrbisFormDialog, OrbisDialog } from '@/components/OrbisDialog';
import {
    fetchGalleryImages,
    deleteGalleryImage,
    updateGalleryImage,
    reorderGalleryImages,
    createGalleryImage,
    type GalleryImage,
    type UpdateGalleryImageData,
} from '@/lib/api/resources';
import { toast } from 'sonner';
import { Camera, Trash2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryManagementProps {
    resourceId: string;
}

export function GalleryManagement({ resourceId }: GalleryManagementProps) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [deletingImage, setDeletingImage] = useState<GalleryImage | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    const loadGalleryImages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchGalleryImages(resourceId);
            setImages(data.galleryImages);
        } catch (error) {
            console.error('Failed to fetch gallery images:', error);
            toast.error('Failed to load gallery images');
        } finally {
            setLoading(false);
        }
    }, [resourceId]);

    useEffect(() => {
        loadGalleryImages();
    }, [loadGalleryImages]);

    const handleUploadImages = async (files: File[]) => {
        if (files.length === 0) return;

        try {
            // Upload each file using createGalleryImage
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file) continue;

                await createGalleryImage(resourceId, file);
            }

            toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`);
            loadGalleryImages();
            setShowUploadDialog(false);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload images');
            throw error; // Re-throw to let dialog handle it
        }
    };

    const handleDeleteImage = async () => {
        if (!deletingImage) return;

        try {
            await deleteGalleryImage(resourceId, deletingImage.id);
            toast.success('Image deleted successfully');
            setImages((prev) => prev.filter((img) => img.id !== deletingImage.id));
            setDeletingImage(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleUpdateImage = async (data: UpdateGalleryImageData) => {
        if (!editingImage) return;

        try {
            const result = await updateGalleryImage(resourceId, editingImage.id, data);
            toast.success('Image updated successfully');
            setImages((prev) =>
                prev.map((img) => (img.id === editingImage.id ? result.galleryImage : img))
            );
            setEditingImage(null);
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update image');
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newImages = [...images];
        const draggedItem = newImages[draggedIndex];
        if (!draggedItem) return;

        newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, draggedItem);

        setImages(newImages);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex === null) return;

        try {
            const imageIds = images.map((img) => img.id);
            await reorderGalleryImages(resourceId, imageIds);
            toast.success('Gallery order updated');
        } catch (error) {
            console.error('Reorder error:', error);
            toast.error('Failed to update order');
            // Reload to get original order
            loadGalleryImages();
        } finally {
            setDraggedIndex(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-hebden text-2xl font-bold text-foreground">Gallery</h1>
                    <p className="text-muted-foreground mt-1 font-nunito text-sm">
                        Manage images for your resource. Drag to reorder.
                    </p>
                </div>

                <Button
                    className="font-hebden"
                    onClick={() => setShowUploadDialog(true)}
                >
                    <Camera className="w-5 h-5 mr-2" />
                    Upload Images
                </Button>
            </div>

            {/* Gallery Grid */}
            {images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                'bg-secondary/30 rounded-lg overflow-hidden group cursor-move transition-all',
                                draggedIndex === index ? 'opacity-50' : 'opacity-100'
                            )}
                        >
                            {/* Image */}
                            <div className="relative aspect-video bg-accent/20">
                                <Image
                                    src={image.url}
                                    alt={image.title || image.caption || 'Gallery image'}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Drag handle */}
                                <div className="absolute top-2 left-2 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-4 h-4 text-foreground" />
                                </div>

                                {/* Actions */}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setEditingImage(image)}
                                        className="h-8 px-2"
                                    >
                                        <Icon ssr={true} icon="mdi:pencil" width="16" height="16" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeletingImage(image)}
                                        className="h-8 px-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                {image.title && (
                                    <h3 className="font-hebden font-semibold text-foreground text-sm mb-1 line-clamp-1">
                                        {image.title}
                                    </h3>
                                )}
                                {image.caption && (
                                    <p className="text-xs text-muted-foreground font-nunito line-clamp-2">
                                        {image.caption}
                                    </p>
                                )}
                                {!image.title && !image.caption && (
                                    <p className="text-xs text-muted-foreground/50 font-nunito italic">
                                        No caption
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-secondary/30 rounded-lg">
                    <div className="p-4 bg-accent rounded-full mb-4">
                        <Icon ssr={true} icon="mdi:image-multiple" width="48" height="48" className="text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-nunito text-lg mb-2">No images yet</p>
                    <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
                        Upload images to showcase your resource. You can add multiple images and reorder them.
                    </p>
                    <Button
                        className="font-hebden"
                        onClick={() => setShowUploadDialog(true)}
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        Upload Your First Images
                    </Button>
                </div>
            )}

            {/* Upload Images Dialog */}
            <UploadImagesDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                onUpload={handleUploadImages}
            />

            {/* Edit Image Dialog */}
            {editingImage && (
                <EditImageDialog
                    image={editingImage}
                    onClose={() => setEditingImage(null)}
                    onSave={handleUpdateImage}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <OrbisConfirmDialog
                open={!!deletingImage}
                onOpenChange={(open) => !open && setDeletingImage(null)}
                title="Delete Image"
                description="Are you sure you want to delete this image? This action cannot be undone."
                confirmText="Delete Image"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteImage}
                onCancel={() => setDeletingImage(null)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}

interface EditImageDialogProps {
    image: GalleryImage;
    onClose: () => void;
    onSave: (data: UpdateGalleryImageData) => Promise<void>;
}

function EditImageDialog({ image, onClose, onSave }: EditImageDialogProps) {
    const [formData, setFormData] = useState({
        title: image.title || '',
        caption: image.caption || '',
        description: image.description || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <OrbisFormDialog
            open={true}
            onOpenChange={onClose}
            title="Edit Image"
            description="Update the image details"
            size="lg"
            onSubmit={handleSubmit}
            submitText="Save Changes"
            submitLoading={saving}
            onCancel={onClose}
        >
            <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative aspect-video bg-accent/20 rounded-lg overflow-hidden">
                    <Image
                        src={image.url}
                        alt={image.title || 'Gallery image'}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Image title"
                        maxLength={100}
                    />
                </div>

                {/* Caption */}
                <div className="space-y-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Input
                        id="caption"
                        value={formData.caption}
                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                        placeholder="Short caption"
                        maxLength={200}
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed description (optional)"
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground font-nunito">
                        {formData.description.length} / 500 characters
                    </p>
                </div>
            </div>
        </OrbisFormDialog>
    );
}

interface UploadImagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (files: File[]) => Promise<void>;
}

function UploadImagesDialog({ open, onOpenChange, onUpload }: UploadImagesDialogProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setSelectedFiles(Array.from(files));
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(file =>
                file.type.startsWith('image/')
            );
            setSelectedFiles(files);
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            await onUpload(selectedFiles);
            setSelectedFiles([]);
        } catch (error) {
            // Error already handled in parent
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <OrbisDialog
            open={open}
            onOpenChange={(open) => {
                if (!uploading) {
                    onOpenChange(open);
                    if (!open) {
                        setSelectedFiles([]);
                    }
                }
            }}
            title="Upload Images"
            description="Add images to your resource gallery"
            size="lg"
            footer={
                <>
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={uploading}
                        className="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-border bg-secondary/30 hover:bg-secondary text-foreground transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className={cn(
                            "px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center gap-2",
                            (selectedFiles.length === 0 || uploading) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {uploading && (
                            <Icon ssr={true} icon="mdi:loading" width="16" height="16" className="animate-spin" />
                        )}
                        Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-secondary/20"
                    )}
                >
                    <Icon ssr={true} icon="mdi:cloud-upload" width="48" height="48" className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-foreground font-nunito mb-2">
                        Drag and drop images here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground font-nunito mb-4">
                        Supports: JPG, PNG, GIF, WebP
                    </p>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <Button className="font-hebden" size="sm" disabled={uploading}>
                            <Icon ssr={true} icon="mdi:folder-open" width="18" height="18" className="mr-2" />
                            Browse Files
                        </Button>
                    </label>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <Label className="font-nunito">Selected Files ({selectedFiles.length})</Label>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                                >
                                    <Icon ssr={true} icon="mdi:file-image" width="24" height="24" className="text-primary" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-nunito text-foreground truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-nunito">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        disabled={uploading}
                                        className="p-1 hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
                                    >
                                        <Icon ssr={true} icon="mdi:close" width="20" height="20" className="text-destructive" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </OrbisDialog>
    );
}
