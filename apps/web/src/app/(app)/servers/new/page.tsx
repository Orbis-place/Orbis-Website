'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { InputWithPrefix } from '@/components/ui/input-with-prefix';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessionStore } from '@/stores/useSessionStore';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Team {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    memberRole?: string;
}

interface ServerCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

interface HytaleVersion {
    id: string;
    hytaleVersion: string;
    name?: string;
}

function NewServerPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTeamId = searchParams.get('teamId');
    const { session, isLoading: isLoadingSession } = useSessionStore();

    const [teams, setTeams] = useState<Team[]>([]);
    const [categories, setCategories] = useState<ServerCategory[]>([]);
    const [hytaleVersions, setHytaleVersions] = useState<HytaleVersion[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        shortDesc: '',
        serverAddress: '',
        gameVersionId: '',
        primaryCategoryId: '',
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

    // Fetch all required data
    useEffect(() => {
        async function loadData() {
            if (!session?.user?.id) return;
            setLoadingData(true);

            try {
                // Fetch teams
                const teamsRes = await fetch(`${API_URL}/teams/user/my-teams`, { credentials: 'include' });
                if (teamsRes.ok) {
                    const teamsData = await teamsRes.json();
                    const filteredTeams = teamsData.filter((team: Team) =>
                        team.memberRole === 'OWNER' || team.memberRole === 'ADMIN'
                    );
                    setTeams(filteredTeams);
                }

                // Fetch categories
                const catsRes = await fetch(`${API_URL}/server-categories`);
                if (catsRes.ok) {
                    const catsData = await catsRes.json();
                    setCategories(catsData);
                }

                // Fetch versions
                const versRes = await fetch(`${API_URL}/hytale-versions`);
                if (versRes.ok) {
                    const versData = await versRes.json();
                    setHytaleVersions(versData);
                    if (versData.length > 0) {
                        setFormData(prev => ({ ...prev, gameVersionId: versData[0]?.id || '' }));
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoadingData(false);
            }
        }
        loadData();
    }, [session]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login?redirect=/servers/new');
        }
    }, [session, isLoadingSession, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Server name is required');
            return;
        }
        if (!formData.slug.trim()) {
            toast.error('URL slug is required');
            return;
        }
        if (!formData.primaryCategoryId) {
            toast.error('Category is required');
            return;
        }
        if (!formData.serverAddress.trim()) {
            toast.error('Server address is required');
            return;
        }
        if (!formData.shortDesc.trim() || formData.shortDesc.length < 10) {
            toast.error('Short description must be at least 10 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const serverData = {
                name: formData.name,
                slug: formData.slug,
                shortDesc: formData.shortDesc,
                serverAddress: formData.serverAddress,
                ...(formData.gameVersionId && {
                    gameVersionId: formData.gameVersionId,
                    supportedVersionIds: [formData.gameVersionId],
                }),
                primaryCategoryId: formData.primaryCategoryId,
                teamId: formData.teamId,
            };

            const response = await fetch(`${API_URL}/servers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(serverData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create server');
            }

            const server = await response.json();
            toast.success('Server created successfully!');

            // Redirect to the server management page
            router.push(`/servers/${server.slug}/manage`);
        } catch (error) {
            console.error('Error creating server:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create server. Please try again.');
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
                <h1 className="font-hebden text-3xl text-foreground">Add New Server</h1>
                <p className="mt-2 text-foreground/60 font-nunito">
                    List your Hytale server on Orbis
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
                    <h2 className="font-hebden text-lg text-foreground">Basic Information</h2>

                    {/* Owner Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="teamId">
                            Owner <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.teamId || 'personal'}
                            onValueChange={(value) => setFormData({ ...formData, teamId: value === 'personal' ? undefined : value })}
                            disabled={!!defaultTeamId}
                        >
                            <SelectTrigger id="teamId" className="w-full">
                                <SelectValue placeholder={loadingData ? "Loading teams..." : "Select owner"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personal">
                                    <span className="flex items-center gap-2">
                                        <Icon icon="mdi:account" width="16" height="16" />
                                        Personal Server
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
                    </div>

                    {/* Two-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Server Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Server Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="My Awesome Server"
                                required
                            />
                        </div>

                        {/* Primary Category */}
                        <div className="space-y-2">
                            <Label htmlFor="primaryCategoryId">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.primaryCategoryId}
                                onValueChange={(value) => setFormData({ ...formData, primaryCategoryId: value })}
                                required
                            >
                                <SelectTrigger id="primaryCategoryId" className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            <span className="flex items-center gap-2">
                                                {category.icon && <Icon icon={category.icon} />}
                                                {category.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                            prefix="orbis.place/servers/"
                            value={formData.slug}
                            onChange={(e) => {
                                const formatted = generateSlug(e.target.value);
                                setFormData({ ...formData, slug: formatted });
                            }}
                            required
                        />
                        <p className="text-xs text-muted-foreground font-nunito">
                            Lowercase letters, numbers, and hyphens only.
                        </p>
                    </div>
                </div>

                {/* Connection Section */}
                <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
                    <h2 className="font-hebden text-lg text-foreground">Connection Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Server Address */}
                        <div className="space-y-2">
                            <Label htmlFor="serverAddress">
                                Server Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="serverAddress"
                                name="serverAddress"
                                value={formData.serverAddress}
                                onChange={handleInputChange}
                                placeholder="play.myserver.com:5520"
                                required
                            />
                            <p className="text-xs text-muted-foreground font-nunito">
                                IP or domain with optional port
                            </p>
                        </div>

                        {/* Game Version */}
                        <div className="space-y-2">
                            <Label htmlFor="gameVersionId">
                                Game Version <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.gameVersionId}
                                onValueChange={(value) => setFormData({ ...formData, gameVersionId: value })}
                                required
                            >
                                <SelectTrigger id="gameVersionId" className="w-full">
                                    <SelectValue placeholder="Select game version" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hytaleVersions.map((version) => (
                                        <SelectItem key={version.id} value={version.id}>
                                            {version.hytaleVersion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
                    <h2 className="font-hebden text-lg text-foreground">Description</h2>

                    <div className="space-y-2">
                        <Label htmlFor="shortDesc">
                            Short Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="shortDesc"
                            name="shortDesc"
                            value={formData.shortDesc}
                            onChange={handleInputChange}
                            placeholder="A brief description of your server..."
                            rows={4}
                            maxLength={200}
                            required
                        />
                        <p className="text-xs text-muted-foreground font-nunito">
                            {formData.shortDesc.length}/200 characters (minimum 10)
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex gap-3">
                        <Icon icon="mdi:information" className="text-primary flex-shrink-0 mt-0.5" width="20" height="20" />
                        <p className="text-sm text-foreground/80 font-nunito">
                            Your server will be created with <strong>pending</strong> status. You can add more details like tags, country, and images after creation.
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
                        disabled={isSubmitting || !formData.name.trim() || !formData.slug.trim() || !formData.primaryCategoryId || !formData.serverAddress.trim() || formData.shortDesc.length < 10}
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
                                Create Server
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function NewServerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <NewServerPageContent />
        </Suspense>
    );
}
