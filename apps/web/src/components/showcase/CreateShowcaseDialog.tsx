'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { OrbisDialog } from '@/components/OrbisDialog';
import { SHOWCASE_CATEGORIES, type ShowcaseCategory } from '@/lib/api/showcase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CreateShowcaseDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateShowcaseDialog({ isOpen, onClose }: CreateShowcaseDialogProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ShowcaseCategory>('THREE_D_MODEL');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'form' | 'uploading'>('form');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        // Validate file types
        const validFiles = selectedFiles.filter(file =>
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );

        if (validFiles.length !== selectedFiles.length) {
            setError('Some files were skipped. Only images and videos are allowed.');
        }

        setFiles(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (files.length === 0) {
            setError('At least one image or video is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setStep('uploading');

        try {
            // Step 1: Create the post
            const createResponse = await fetch(`${API_URL}/showcase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    category,
                }),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create post');
            }

            const post = await createResponse.json();
            setUploadProgress(10);

            // Step 2: Upload media files
            const totalFiles = files.length;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file) continue;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');

                const uploadResponse = await fetch(`${API_URL}/showcase/${post.id}/media`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    console.error(`Failed to upload file ${file.name}`);
                }

                setUploadProgress(10 + Math.round(((i + 1) / totalFiles) * 80));
            }

            // Step 3: Publish the post
            const publishResponse = await fetch(`${API_URL}/showcase/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: 'PUBLISHED' }),
            });

            if (!publishResponse.ok) {
                throw new Error('Failed to publish post');
            }

            setUploadProgress(100);

            // Success - redirect to the new post
            setTimeout(() => {
                onClose();
                router.push(`/showcase/${post.id}`);
            }, 500);

        } catch (err) {
            console.error('Error creating post:', err);
            setError(err instanceof Error ? err.message : 'Failed to create post');
            setStep('form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('THREE_D_MODEL');
        setFiles([]);
        setPreviews([]);
        setError(null);
        setStep('form');
        setUploadProgress(0);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    const categories = Object.entries(SHOWCASE_CATEGORIES) as [ShowcaseCategory, typeof SHOWCASE_CATEGORIES[ShowcaseCategory]][];

    return (
        <OrbisDialog
            open={isOpen}
            onOpenChange={handleClose}
            title="Create Showcase Post"
            size="xl"
        >

            {step === 'uploading' ? (
                <div className="py-12 space-y-6">
                    <div className="text-center">
                        <Icon icon="mdi:cloud-upload-outline" className="text-6xl text-[#109EB1] mx-auto mb-4" />
                        <h3 className="font-hebden text-lg text-[#C7F4FA]">Uploading your showcase...</h3>
                        <p className="text-[#C7F4FA]/60 font-nunito text-sm mt-2">
                            Please wait while we upload your files
                        </p>
                    </div>
                    <div className="w-full bg-[#032125] rounded-full h-3">
                        <div
                            className="bg-[#109EB1] h-3 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-center text-[#C7F4FA]/60 font-nunito text-sm">
                        {uploadProgress}% complete
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-nunito">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-sm font-nunito font-semibold text-[#C7F4FA]">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your showcase a catchy title"
                            className="w-full px-4 py-3 bg-[#032125] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:border-[#109EB1]/40 font-nunito"
                            maxLength={200}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="block text-sm font-nunito font-semibold text-[#C7F4FA]">
                            Category *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {categories.map(([key, info]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setCategory(key)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-nunito transition-all ${category === key
                                        ? 'text-[#032125]'
                                        : 'bg-[#032125] text-[#C7F4FA]/70 hover:text-[#C7F4FA]'
                                        }`}
                                    style={category === key ? { backgroundColor: info.color } : {}}
                                >
                                    <Icon icon={info.icon} />
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
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell others about your project..."
                            className="w-full px-4 py-3 bg-[#032125] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:border-[#109EB1]/40 resize-none font-nunito"
                            rows={4}
                        />
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-nunito font-semibold text-[#C7F4FA]">
                            Images & Videos *
                        </label>

                        {/* Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#109EB1]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#109EB1]/50 hover:bg-[#109EB1]/5 transition-all"
                        >
                            <Icon icon="mdi:cloud-upload-outline" className="text-4xl text-[#109EB1] mx-auto mb-3" />
                            <p className="font-nunito text-[#C7F4FA]">
                                Click to upload or drag and drop
                            </p>
                            <p className="font-nunito text-sm text-[#C7F4FA]/50 mt-1">
                                PNG, JPG, GIF, MP4 up to 10MB each
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Previews */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[#032125]">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                        >
                                            <Icon icon="mdi:close" className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#109EB1]/10">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-[#C7F4FA]/70 hover:text-[#C7F4FA] font-nunito transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || files.length === 0}
                            className="px-6 py-2 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#109EB1]/80 transition-colors flex items-center gap-2"
                        >
                            <Icon icon="mdi:upload" />
                            Publish
                        </button>
                    </div>
                </form>
            )}
        </OrbisDialog>
    );
}
