'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { InputWithPrefix } from '@/components/ui/input-with-prefix';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrbisFormDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';

interface CreateTeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function CreateTeamDialog({ open, onOpenChange, trigger, onSuccess }: CreateTeamDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        slug: '',
        description: '',
        websiteUrl: '',
        discordUrl: '',
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

    const handleCreateTeam = async (e: React.FormEvent) => {
        setIsLoading(true);

        try {
            // Clean up team slug: remove leading/trailing hyphens before submission
            const cleanedFormData = {
                slug: formData.slug.replace(/^-+|-+$/g, ''),
                name: formData.displayName,
                description: formData.description,
                websiteUrl: formData.websiteUrl,
                discordUrl: formData.discordUrl,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(cleanedFormData),
            });

            if (!response.ok) {
                throw new Error('Failed to create team');
            }

            const newTeam = await response.json();

            // Reset form and close dialog
            setFormData({
                displayName: '',
                slug: '',
                description: '',
                websiteUrl: '',
                discordUrl: '',
            });
            onOpenChange(false);

            toast.success('Team created successfully!');

            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }

            // Navigate to the new team page
            router.push(`/team/${newTeam.slug}`);
        } catch (error) {
            console.error('Error creating team:', error);
            toast.error('Failed to create team. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OrbisFormDialog
            open={open}
            onOpenChange={onOpenChange}
            trigger={trigger}
            title="Create New Team"
            description="Fill in the details to create your team"
            size="lg"
            onSubmit={handleCreateTeam}
            submitText="Create Team"
            submitLoading={isLoading}
            onCancel={() => onOpenChange(false)}
        >
            <div className="space-y-4">
                {/* Display Name */}
                <div className="space-y-2">
                    <Label htmlFor="displayName">
                        Team Name *
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
                            URL Slug *
                        </Label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, slug: generateSlug(formData.displayName) })}
                            disabled={!formData.displayName}
                            className="text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed font-nunito"
                        >
                            <Icon icon="mdi:auto-fix" width="14" height="14" className="inline mr-1" />
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
                    <p className="text-xs text-muted-foreground/60 font-nunito">
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
                        placeholder="Describe your team..."
                        rows={3}
                        className="resize-none"
                    />
                </div>
            </div>
        </OrbisFormDialog>
    );
}
