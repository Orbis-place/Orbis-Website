'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { TiptapEditor } from '@/components/TiptapEditor';
import { SHOWCASE_CATEGORIES, type ShowcaseCategory } from '@/lib/api/showcase';
import { useSessionStore } from '@/stores/useSessionStore';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TeamOption {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
}

export default function NewShowcasePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTeamId = searchParams.get('teamId');
    const { session, isLoading: isLoadingSession } = useSessionStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ShowcaseCategory>('THREE_D_MODEL');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'form' | 'uploading'>('form');
    const [uploadProgress, setUploadProgress] = useState(0);

    // Team ownership - pre-select from URL if provided
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(defaultTeamId);

    // Fetch user's teams
    useEffect(() => {
        async function loadTeams() {
            if (!session?.user?.id) return;
            try {
                const response = await fetch(`${API_URL}/teams/user/my-teams`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    // Filter teams where user can create content (OWNER, ADMIN, MODERATOR)
                    const editableTeams = data.filter((t: any) =>
                        ['OWNER', 'ADMIN', 'MODERATOR'].includes(t.memberRole)
                    ).map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        logo: t.logo,
                    }));
                    setTeams(editableTeams);
                }
            } catch (error) {
                console.error('Failed to load teams:', error);
            }
        }
        loadTeams();
    }, [session]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login?redirect=/showcase/new');
        }
    }, [session, isLoadingSession, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        // Validate file types
        const validFiles = selectedFiles.filter(file =>
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );

        if (validFiles.length !== selectedFiles.length) {
            toast.warning('Some files were skipped. Only images and videos are allowed.');
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
            toast.error('Title is required');
            return;
        }
        if (files.length === 0) {
            toast.error('At least one image or video is required');
            return;
        }

        setIsSubmitting(true);
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
                    teamId: selectedTeamId || undefined,
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
            toast.success('Post created successfully!');

            // Success - redirect to the new post
            setTimeout(() => {
                router.push(`/showcase/${post.id}`);
            }, 500);

        } catch (err) {
            console.error('Error creating post:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to create post');
            setStep('form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = Object.entries(SHOWCASE_CATEGORIES) as [ShowcaseCategory, typeof SHOWCASE_CATEGORIES[ShowcaseCategory]][];

    if (isLoadingSession) {
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
                    href="/showcase"
                    className="inline-flex items-center gap-2 text-[#C7F4FA]/70 hover:text-[#C7F4FA] transition-colors mb-4"
                >
                    <Icon icon="mdi:arrow-left" />
                    <span className="font-nunito">Back to Showcase</span>
                </Link>
                <h1 className="font-hebden text-3xl text-[#C7F4FA]">Create Showcase Post</h1>
                <p className="mt-2 text-[#C7F4FA]/60 font-nunito">
                    Share your Hytale creations with the community
                </p>
            </div>

            {step === 'uploading' ? (
                <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-12 space-y-6">
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
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Media Upload Section */}
                    <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6">
                        <h2 className="font-hebden text-lg text-[#C7F4FA] mb-4">
                            Images & Videos <span className="text-[#E9735B]">*</span>
                        </h2>
                        <p className="text-[#C7F4FA]/60 font-nunito text-sm mb-4">
                            Upload screenshots, renders, or videos of your creation. The first image will be used as the thumbnail.
                        </p>

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
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[#032125] group">
                                        {files[index]?.type.startsWith('video/') ? (
                                            <video src={preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {index === 0 && (
                                            <div className="absolute top-1 left-1 px-2 py-0.5 bg-[#109EB1] text-white text-xs font-nunito rounded">
                                                Thumbnail
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                        >
                                            <Icon icon="mdi:close" className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6 space-y-6">
                        <h2 className="font-hebden text-lg text-[#C7F4FA]">Details</h2>

                        {/* Owner Selection */}
                        {teams.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="owner" className="text-[#C7F4FA]">
                                    Publish as
                                </Label>
                                <Select
                                    value={selectedTeamId || 'personal'}
                                    onValueChange={(value) => setSelectedTeamId(value === 'personal' ? null : value)}
                                >
                                    <SelectTrigger id="owner" className="w-full">
                                        <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="personal">
                                            <span className="flex items-center gap-2">
                                                <Icon icon="mdi:account" width="16" height="16" />
                                                Personal
                                            </span>
                                        </SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                <span className="flex items-center gap-2">
                                                    <Icon icon="mdi:account-group" width="16" height="16" />
                                                    {team.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-[#C7F4FA]/50 font-nunito">
                                    Choose whether this showcase belongs to you or one of your teams
                                </p>
                            </div>
                        )}

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
                        <button
                            type="button"
                            onClick={() => router.push('/showcase')}
                            className="px-6 py-3 text-[#C7F4FA]/70 hover:text-[#C7F4FA] font-nunito transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || files.length === 0}
                            className="px-8 py-3 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#109EB1]/80 transition-colors flex items-center gap-2"
                        >
                            <Icon icon="mdi:publish" className="text-xl" />
                            Publish
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
