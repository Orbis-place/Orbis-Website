'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { InputWithPrefix } from '@/components/ui/input-with-prefix';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSessionStore } from '@/stores/useSessionStore';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function NewTeamPageContent() {
    const router = useRouter();
    const { session, isLoading: isLoadingSession } = useSessionStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        slug: '',
        description: '',
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

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login?redirect=/teams/new');
        }
    }, [session, isLoadingSession, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.displayName.trim()) {
            toast.error('Team name is required');
            return;
        }
        if (!formData.slug.trim()) {
            toast.error('URL slug is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const teamData = {
                slug: formData.slug.replace(/^-+|-+$/g, ''),
                name: formData.displayName,
                description: formData.description,
            };

            const response = await fetch(`${API_URL}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(teamData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create team');
            }

            const newTeam = await response.json();
            toast.success('Team created successfully!');

            // Redirect to the team page
            router.push(`/team/${newTeam.slug}`);
        } catch (error) {
            console.error('Error creating team:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create team. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin">
                    <Icon ssr={true} icon="mdi:loading" className="text-4xl text-primary" />
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-4"
                >
                    <Icon ssr={true} icon="mdi:arrow-left" />
                    <span className="font-nunito">Back</span>
                </button>
                <h1 className="font-hebden text-3xl text-foreground">Create New Team</h1>
                <p className="mt-2 text-foreground/60 font-nunito">
                    Start a team to collaborate with others on Orbis
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Team Info Section */}
                <div className="bg-accent/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
                    <h2 className="font-hebden text-lg text-foreground">Team Information</h2>

                    {/* Team Name */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">
                            Team Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="My Awesome Team"
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
                                onClick={() => setFormData({ ...formData, slug: generateSlug(formData.displayName) })}
                                disabled={!formData.displayName}
                                className="text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed font-nunito"
                            >
                                <Icon ssr={true} icon="mdi:auto-fix" width="14" height="14" className="inline mr-1" />
                                Generate from name
                            </button>
                        </div>
                        <InputWithPrefix
                            id="slug"
                            name="slug"
                            prefix="orbis.place/team/"
                            value={formData.slug}
                            onChange={(e) => {
                                const formatted = generateSlug(e.target.value);
                                setFormData({ ...formData, slug: formatted });
                            }}
                            required
                        />
                        <p className="text-xs text-muted-foreground font-nunito">
                            Lowercase letters, numbers, and hyphens only. This will be your team's URL.
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your team and what kind of projects you work on..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex gap-3">
                        <Icon ssr={true} icon="mdi:information" className="text-primary flex-shrink-0 mt-0.5" width="20" height="20" />
                        <p className="text-sm text-foreground/80 font-nunito">
                            Once created, you can invite members, add a logo, and create resources or servers under your team.
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
                        disabled={isSubmitting || !formData.displayName.trim() || !formData.slug.trim()}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Icon ssr={true} icon="mdi:loading" className="text-xl animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Icon ssr={true} icon="mdi:plus" className="text-xl" />
                                Create Team
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function NewTeamPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <NewTeamPageContent />
        </Suspense>
    );
}
