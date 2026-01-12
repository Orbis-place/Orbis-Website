'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { InputWithPrefix } from '@/components/ui/input-with-prefix';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createResource, fetchUserTeams, type Team, type CreateResourceData, ResourceType } from '@/lib/api/resources';
import { useSessionStore } from '@/stores/useSessionStore';
import { toast } from 'sonner';

const RESOURCE_TYPES = [
    { value: ResourceType.PLUGIN, label: 'Plugin', icon: 'mdi:power-plug', description: 'Server-side functionality' },
    { value: ResourceType.MOD, label: 'Mod', icon: 'mdi:puzzle', description: 'Gameplay modifications' },
    { value: ResourceType.WORLD, label: 'World', icon: 'mdi:earth', description: 'Maps & environments' },
    { value: ResourceType.DATA_PACK, label: 'Data Pack', icon: 'mdi:database', description: 'Vanilla modifications' },
    { value: ResourceType.ASSET_PACK, label: 'Asset Pack', icon: 'mdi:image-multiple', description: 'Models, textures, sounds' },
    { value: ResourceType.PREFAB, label: 'Prefab', icon: 'mdi:cube-outline', description: 'Pre-built structures' },
    { value: ResourceType.MODPACK, label: 'Modpack', icon: 'mdi:package-variant', description: 'Curated mod collections' },
    { value: ResourceType.TOOLS_SCRIPTS, label: 'Tool / Script', icon: 'mdi:tools', description: 'External utilities' },
];

function NewResourcePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTeamId = searchParams.get('teamId');
    const { session, isLoading: isLoadingSession } = useSessionStore();

    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateResourceData>({
        name: '',
        slug: '',
        tagline: '',
        type: ResourceType.PLUGIN,
        teamId: defaultTeamId || undefined,
    });

    // Helper function to generate slug from name
    const generateSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Map ResourceType to URL path
    const getResourcePath = (type: ResourceType): string => {
        const pathMap: Record<ResourceType, string> = {
            [ResourceType.PLUGIN]: 'plugins',
            [ResourceType.MOD]: 'mods',
            [ResourceType.WORLD]: 'worlds',
            [ResourceType.PREFAB]: 'prefabs',
            [ResourceType.ASSET_PACK]: 'asset-packs',
            [ResourceType.DATA_PACK]: 'data-packs',
            [ResourceType.MODPACK]: 'modpacks',
            [ResourceType.PREMADE_SERVER]: 'premade-servers',
            [ResourceType.TOOLS_SCRIPTS]: 'tools-scripts',
        };
        return `orbis.place/${pathMap[type]}/`;
    };

    // Fetch user's teams
    useEffect(() => {
        async function loadTeams() {
            if (!session?.user?.id) return;
            setLoadingTeams(true);
            try {
                const userTeams = await fetchUserTeams();
                setTeams(userTeams);
            } catch (error) {
                console.error('Failed to load teams:', error);
            } finally {
                setLoadingTeams(false);
            }
        }
        loadTeams();
    }, [session]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login?redirect=/resources/new');
        }
    }, [session, isLoadingSession, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Resource name is required');
            return;
        }
        if (!formData.slug.trim()) {
            toast.error('URL slug is required');
            return;
        }
        if (!formData.tagline.trim()) {
            toast.error('Tagline is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createResource(formData);
            toast.success('Resource created successfully!');

            // Redirect to the resource management page
            router.push(`/dashboard/resources/${result.resource.id}`);
        } catch (error) {
            console.error('Error creating resource:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create resource. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin">
                    <Icon icon="mdi:loading" className="text-4xl text-primary" />
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
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-4"
                >
                    <Icon icon="mdi:arrow-left" />
                    <span className="font-nunito">Back</span>
                </button>
                <h1 className="font-hebden text-3xl text-foreground">Create New Resource</h1>
                <p className="mt-2 text-foreground/60 font-nunito">
                    Share your creation with the Hytale community
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Resource Type Selection */}
                <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-xl p-6">
                    <h2 className="font-hebden text-lg text-foreground mb-4">
                        Resource Type <span className="text-destructive">*</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {RESOURCE_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type.value })}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${formData.type === type.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-accent text-foreground'
                                    }`}
                            >
                                <Icon icon={type.icon} width="24" height="24" />
                                <span className="font-nunito text-sm font-semibold">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
                    <h2 className="font-hebden text-lg text-foreground">Details</h2>

                    {/* Owner Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="owner">
                            Owner <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.teamId || 'personal'}
                            onValueChange={(value) => setFormData({ ...formData, teamId: value === 'personal' ? undefined : value })}
                            disabled={!!defaultTeamId}
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
                                {loadingTeams ? (
                                    <SelectItem value="loading" disabled>
                                        <span className="flex items-center gap-2">
                                            <Icon icon="mdi:loading" width="16" height="16" className="animate-spin" />
                                            Loading teams...
                                        </span>
                                    </SelectItem>
                                ) : (
                                    teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>
                                            <span className="flex items-center gap-2">
                                                <Icon icon="mdi:account-group" width="16" height="16" />
                                                {team.name}
                                            </span>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground font-nunito">
                            {defaultTeamId
                                ? 'Creating resource for this team'
                                : 'Choose whether this resource belongs to you or one of your teams'
                            }
                        </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Resource Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="My Awesome Plugin"
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="slug">
                                URL Slug <span className="text-destructive">*</span>
                            </Label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, slug: generateSlug(formData.name) })}
                                disabled={!formData.name}
                                className="text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed font-nunito"
                            >
                                <Icon icon="mdi:auto-fix" width="14" height="14" className="inline mr-1" />
                                Generate from name
                            </button>
                        </div>
                        <InputWithPrefix
                            id="slug"
                            name="slug"
                            prefix={getResourcePath(formData.type)}
                            value={formData.slug}
                            onChange={(e) => {
                                const formatted = generateSlug(e.target.value);
                                setFormData({ ...formData, slug: formatted });
                            }}
                            required
                        />
                        <p className="text-xs text-muted-foreground font-nunito">
                            Lowercase letters, numbers, and hyphens only. This will be your resource's URL.
                        </p>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                        <Label htmlFor="tagline">
                            Tagline <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="tagline"
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleInputChange}
                            maxLength={200}
                            placeholder="A short description of your resource"
                            required
                        />
                        <p className="text-xs text-muted-foreground font-nunito">
                            {formData.tagline.length}/200 characters
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex gap-3">
                        <Icon icon="mdi:information" className="text-primary flex-shrink-0 mt-0.5" width="20" height="20" />
                        <p className="text-sm text-foreground/80 font-nunito">
                            Your resource will be created as a <strong>draft</strong>. You can add versions, images, and other details before publishing.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-foreground/70 hover:text-foreground font-nunito transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.name.trim() || !formData.slug.trim() || !formData.tagline.trim()}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Icon icon="mdi:loading" className="text-xl animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:plus" className="text-xl" />
                                Create Resource
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function NewResourcePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <NewResourcePageContent />
        </Suspense>
    );
}
