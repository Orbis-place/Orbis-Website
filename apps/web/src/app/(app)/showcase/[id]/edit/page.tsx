'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { TiptapEditor } from '@/components/TiptapEditor';
import { SHOWCASE_CATEGORIES, type ShowcaseCategory, fetchShowcasePost, type ShowcasePost } from '@/lib/api/showcase';
import { useSessionStore } from '@/stores/useSessionStore';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MediaItem {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    order: number;
    caption?: string;
}

export default function EditShowcasePage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;
    const { session, isLoading: isLoadingSession } = useSessionStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ShowcaseCategory>('THREE_D_MODEL');
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    // Load existing post data
    const loadPost = useCallback(async () => {
        try {
            const post = await fetchShowcasePost(postId);
            setTitle(post.title);
            setDescription(post.description || '');
            setCategory(post.category);
            setThumbnailUrl(post.thumbnailUrl || null);
            setMedia(post.media || []);
        } catch (error) {
            console.error('Failed to load post:', error);
            toast.error('Failed to load post');
            router.push('/dashboard/showcase');
        } finally {
            setIsLoading(false);
        }
    }, [postId, router]);

    useEffect(() => {
        if (postId) {
            loadPost();
        }
    }, [postId, loadPost]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login?redirect=/dashboard/showcase');
        }
    }, [session, isLoadingSession, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`${API_URL}/showcase/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    category,
                    thumbnailUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            toast.success('Post updated successfully!');
            router.push(`/showcase/${postId}`);

        } catch (err) {
            console.error('Error updating post:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update post');
        } finally {
            setIsSaving(false);
        }
    };

    // Media management functions
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploadingMedia(true);
        let uploadedCount = 0;

        for (const file of files) {
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast.warning(`Skipped ${file.name}: Only images and videos are allowed`);
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');

                const response = await fetch(`${API_URL}/showcase/${postId}/media`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                if (response.ok) {
                    uploadedCount++;
                }
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
            }
        }

        if (uploadedCount > 0) {
            toast.success(`Uploaded ${uploadedCount} file(s)`);
            loadPost(); // Reload to get updated media list
        }

        setIsUploadingMedia(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteMedia = async (mediaId: string) => {
        try {
            const response = await fetch(`${API_URL}/showcase/${postId}/media/${mediaId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setMedia(prev => prev.filter(m => m.id !== mediaId));
                toast.success('Media deleted');
            }
        } catch (error) {
            console.error('Failed to delete media:', error);
            toast.error('Failed to delete media');
        }
    };

    const handleSetThumbnail = (url: string) => {
        setThumbnailUrl(url);
        toast.success('Thumbnail updated - save to apply');
    };

    const handleMoveMedia = async (mediaId: string, direction: 'up' | 'down') => {
        const currentIndex = media.findIndex(m => m.id === mediaId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= media.length) return;

        const newMedia = [...media];
        [newMedia[currentIndex], newMedia[newIndex]] = [newMedia[newIndex]!, newMedia[currentIndex]!];

        // Update order values
        const reordered = newMedia.map((m, i) => ({ ...m, order: i }));
        setMedia(reordered);

        // Send reorder to backend
        try {
            await fetch(`${API_URL}/showcase/${postId}/media/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    mediaIds: reordered.map(m => m.id),
                }),
            });
        } catch (error) {
            console.error('Failed to reorder:', error);
        }
    };

    const categories = Object.entries(SHOWCASE_CATEGORIES) as [ShowcaseCategory, typeof SHOWCASE_CATEGORIES[ShowcaseCategory]][];

    if (isLoadingSession || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin">
                    <Icon icon="mdi:loading" className="text-4xl text-[#109EB1]" />
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center gap-2 text-[#C7F4FA]/70 hover:text-[#C7F4FA] transition-colors mb-4"
                >
                    <Icon icon="mdi:arrow-left" />
                    <span className="font-nunito">Back to Dashboard</span>
                </Link>
                <h1 className="font-hebden text-3xl text-[#C7F4FA]">Edit Showcase Post</h1>
                <p className="mt-2 text-[#C7F4FA]/60 font-nunito">
                    Update your post details and manage media
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Media Management Section */}
                <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-hebden text-lg text-[#C7F4FA]">Media</h2>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingMedia}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#109EB1] text-white rounded-lg font-nunito text-sm font-semibold hover:bg-[#109EB1]/80 transition-colors disabled:opacity-50"
                        >
                            <Icon icon={isUploadingMedia ? "mdi:loading" : "mdi:plus"} className={isUploadingMedia ? "animate-spin" : ""} />
                            {isUploadingMedia ? 'Uploading...' : 'Add Media'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    {media.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-[#109EB1]/20 rounded-lg">
                            <Icon icon="mdi:image-plus-outline" className="text-4xl text-[#C7F4FA]/30 mx-auto mb-2" />
                            <p className="text-[#C7F4FA]/50 font-nunito">No media yet. Click "Add Media" to upload.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {media.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-4 p-3 bg-[#032125] rounded-lg border ${thumbnailUrl === item.url ? 'border-[#109EB1]' : 'border-transparent'}`}
                                >
                                    {/* Preview */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#041518] flex-shrink-0">
                                        {item.type === 'VIDEO' ? (
                                            <video src={item.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Icon
                                                icon={item.type === 'VIDEO' ? 'mdi:video-outline' : 'mdi:image-outline'}
                                                className="text-[#C7F4FA]/50"
                                            />
                                            <span className="text-sm text-[#C7F4FA]/70 font-nunito capitalize">
                                                {item.type.toLowerCase()}
                                            </span>
                                            {thumbnailUrl === item.url && (
                                                <span className="px-2 py-0.5 bg-[#109EB1] text-white text-xs font-nunito rounded">
                                                    Thumbnail
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {/* Set as thumbnail (only for images) */}
                                        {item.type === 'IMAGE' && thumbnailUrl !== item.url && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetThumbnail(item.url)}
                                                className="p-2 text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors"
                                                title="Set as thumbnail"
                                            >
                                                <Icon icon="mdi:image-check" className="text-lg" />
                                            </button>
                                        )}
                                        {/* Move up */}
                                        <button
                                            type="button"
                                            onClick={() => handleMoveMedia(item.id, 'up')}
                                            disabled={index === 0}
                                            className="p-2 text-[#C7F4FA]/50 hover:text-[#C7F4FA] transition-colors disabled:opacity-30"
                                            title="Move up"
                                        >
                                            <Icon icon="mdi:arrow-up" className="text-lg" />
                                        </button>
                                        {/* Move down */}
                                        <button
                                            type="button"
                                            onClick={() => handleMoveMedia(item.id, 'down')}
                                            disabled={index === media.length - 1}
                                            className="p-2 text-[#C7F4FA]/50 hover:text-[#C7F4FA] transition-colors disabled:opacity-30"
                                            title="Move down"
                                        >
                                            <Icon icon="mdi:arrow-down" className="text-lg" />
                                        </button>
                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMedia(item.id)}
                                            className="p-2 text-red-400/50 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Icon icon="mdi:delete-outline" className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6 space-y-6">
                    <h2 className="font-hebden text-lg text-[#C7F4FA]">Details</h2>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-sm font-nunito font-semibold text-[#C7F4FA]">
                            Title <span className="text-[#E9735B]">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your showcase a catchy title"
                            className="w-full px-4 py-3 bg-[#032125] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:border-[#109EB1]/40 font-nunito"
                            maxLength={200}
                        />
                        <p className="text-xs text-[#C7F4FA]/40 font-nunito">{title.length}/200 characters</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="block text-sm font-nunito font-semibold text-[#C7F4FA]">
                            Category <span className="text-[#E9735B]">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {categories.map(([key, info]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setCategory(key)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-nunito transition-all ${category === key
                                        ? 'text-[#032125] font-semibold'
                                        : 'bg-[#032125] text-[#C7F4FA]/70 hover:text-[#C7F4FA] hover:bg-[#032125]/80'
                                        }`}
                                    style={category === key ? { backgroundColor: info.color } : {}}
                                >
                                    <Icon icon={info.icon} className="text-lg" />
                                    {info.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-nunito font-semibold text-[#C7F4FA]">
                            Description
                        </label>
                        <p className="text-xs text-[#C7F4FA]/50 font-nunito mb-2">
                            Tell others about your project. You can use rich text formatting.
                        </p>
                        <TiptapEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Describe your creation, the process, tools used, inspiration..."
                            minHeight="250px"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    <Link
                        href="/dashboard/showcase"
                        className="px-6 py-3 text-[#C7F4FA]/70 hover:text-[#C7F4FA] font-nunito transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving || !title.trim()}
                        className="px-8 py-3 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#109EB1]/80 transition-colors flex items-center gap-2"
                    >
                        <Icon icon="mdi:content-save" className="text-xl" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
