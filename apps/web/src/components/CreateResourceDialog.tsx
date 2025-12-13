'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbisFormDialog } from '@/components/OrbisDialog';
import { createResource, fetchUserTeams, type Team, type CreateResourceData, ResourceType } from '@/lib/api/resources';
import { toast } from 'sonner';

interface CreateResourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    defaultTeamId?: string; // Pre-select and lock this team
}

export function CreateResourceDialog({ open, onOpenChange, trigger, onSuccess, defaultTeamId }: CreateResourceDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [formData, setFormData] = useState<CreateResourceData>({
        name: '',
        tagline: '',
        type: ResourceType.PLUGIN,
        visibility: 'PUBLIC',
        teamId: defaultTeamId, // Use default team if provided
    });

    useEffect(() => {
        if (open) {
            loadTeams();
        }
    }, [open]);

    const loadTeams = async () => {
        setLoadingTeams(true);
        try {
            const userTeams = await fetchUserTeams();
            setTeams(userTeams);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        } finally {
            setLoadingTeams(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateResource = async () => {
        setIsLoading(true);

        try {
            await createResource(formData);

            // Reset form and close dialog
            setFormData({
                name: '',
                tagline: '',
                type: ResourceType.PLUGIN,
                visibility: 'PUBLIC',
                teamId: undefined,
            });
            onOpenChange(false);

            toast.success('Resource created successfully!');

            // Call onSuccess callback if provided
            onSuccess?.();
        } catch (error) {
            console.error('Error creating resource:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create resource. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OrbisFormDialog
            open={open}
            onOpenChange={onOpenChange}
            trigger={trigger}
            title="Create New Resource"
            description="Fill in the details to create your resource"
            size="lg"
            onSubmit={handleCreateResource}
            submitText="Create Resource"
            submitLoading={isLoading}
            onCancel={() => onOpenChange(false)}
        >
            <div className="space-y-4">
                {/* Owner Selection */}
                <div className="space-y-2">
                    <Label htmlFor="owner">
                        Owner *
                    </Label>
                    <Select
                        value={formData.teamId || 'personal'}
                        onValueChange={(value) => setFormData({ ...formData, teamId: value === 'personal' ? undefined : value })}
                        disabled={!!defaultTeamId} // Lock selector if creating for specific team
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
                                            {team.displayName}
                                        </span>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground/60 font-nunito">
                        {defaultTeamId
                            ? 'Creating resource for this team'
                            : 'Choose whether this resource belongs to you or one of your teams'
                        }
                    </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Resource Name *
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

                {/* Tagline */}
                <div className="space-y-2">
                    <Label htmlFor="tagline">
                        Tagline *
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
                    <p className="text-xs text-muted-foreground/60 font-nunito">
                        {formData.tagline.length}/200 characters
                    </p>
                </div>

                {/* Type */}
                <div className="space-y-2">
                    <Label htmlFor="type">
                        Resource Type *
                    </Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as ResourceType })}
                        required
                    >
                        <SelectTrigger id="type" className="w-full">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ResourceType.PLUGIN}>Plugin</SelectItem>
                            <SelectItem value={ResourceType.MOD}>Mod</SelectItem>
                            <SelectItem value={ResourceType.WORLD}>World</SelectItem>
                            <SelectItem value={ResourceType.DATA_PACK}>Data Pack</SelectItem>
                            <SelectItem value={ResourceType.ASSET_PACK}>Asset Pack</SelectItem>
                            <SelectItem value={ResourceType.PREFAB}>Prefab</SelectItem>
                            <SelectItem value={ResourceType.MODPACK}>Modpack</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                    <Label htmlFor="visibility">
                        Visibility *
                    </Label>
                    <Select
                        value={formData.visibility}
                        onValueChange={(value) => setFormData({ ...formData, visibility: value as 'PUBLIC' | 'UNLISTED' | 'PRIVATE' })}
                        required
                    >
                        <SelectTrigger id="visibility" className="w-full">
                            <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PUBLIC">
                                <span className="flex items-center gap-2">
                                    <Icon icon="mdi:earth" width="16" height="16" />
                                    Public - Visible to everyone
                                </span>
                            </SelectItem>
                            <SelectItem value="UNLISTED">
                                <span className="flex items-center gap-2">
                                    <Icon icon="mdi:link-variant" width="16" height="16" />
                                    Unlisted - Accessible via link only
                                </span>
                            </SelectItem>
                            <SelectItem value="PRIVATE">
                                <span className="flex items-center gap-2">
                                    <Icon icon="mdi:lock" width="16" height="16" />
                                    Private - Only visible to you
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
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
            </div>
        </OrbisFormDialog>
    );
}
