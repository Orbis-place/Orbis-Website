'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { InputWithPrefix } from '@/components/ui/input-with-prefix';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbisFormDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';

interface Team {
    id: string;
    name: string;
    displayName: string;
    logo?: string;
}

interface ServerCategory {
    id: string;
    name: string;
    slug: string;
}

interface CreateServerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    defaultTeamId?: string; // Pre-select and lock this team
}

export function CreateServerDialog({ open, onOpenChange, trigger, onSuccess, defaultTeamId }: CreateServerDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [categories, setCategories] = useState<ServerCategory[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        serverAddress: '',  // Changed from serverIp + port
        gameVersion: '1.0.0',
        primaryCategoryId: '',
        teamId: defaultTeamId,
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

    useEffect(() => {
        if (open) {
            fetchTeams();
            fetchCategories();
        }
    }, [open]);

    const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/user/my-teams`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                // Filter to only teams where user is owner or admin
                const filteredTeams = data.filter((team: any) =>
                    team.memberRole === 'OWNER' || team.memberRole === 'ADMIN'
                );
                setTeams(filteredTeams);
            }
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        } finally {
            setLoadingTeams(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/server-categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateServer = async () => {
        setIsLoading(true);

        try {
            const serverData = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                serverAddress: formData.serverAddress,
                gameVersion: formData.gameVersion,
                primaryCategoryId: formData.primaryCategoryId,
                supportedVersions: [formData.gameVersion],
                teamId: formData.teamId,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/servers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(serverData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create server');
            }

            // Reset form and close dialog
            setFormData({
                name: '',
                slug: '',
                description: '',
                serverAddress: '',
                gameVersion: '1.0.0',
                primaryCategoryId: '',
                teamId: defaultTeamId,
            });
            onOpenChange(false);

            toast.success('Server created successfully!');

            // Call onSuccess callback if provided
            onSuccess?.();
        } catch (error) {
            console.error('Error creating server:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OrbisFormDialog
            open={open}
            onOpenChange={onOpenChange}
            trigger={trigger}
            title="Create New Server"
            description="Fill in the details to create your server"
            size="lg"
            onSubmit={handleCreateServer}
            submitText="Create Server"
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
                                            {team.name}
                                        </span>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground/60 font-nunito">
                        {defaultTeamId
                            ? 'Creating server for this team'
                            : 'Choose whether this server belongs to you or one of your teams'
                        }
                    </p>
                </div>

                {/* Server Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Server Name *
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

                {/* Slug */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="slug">
                            URL Slug *
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
                    <p className="text-xs text-muted-foreground/60 font-nunito">
                        Lowercase letters, numbers, and hyphens only. This will be your server's URL.
                    </p>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">
                        Short description *
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="A brief description of your server..."
                        rows={3}
                        maxLength={200}
                        required
                    />
                    <p className="text-xs text-muted-foreground/60 font-nunito">
                        {formData.description.length}/200 characters (minimum 10)
                    </p>
                </div>


                {/* Server Address */}
                <div className="space-y-2">
                    <Label htmlFor="serverAddress">
                        Server Address *
                    </Label>
                    <Input
                        id="serverAddress"
                        name="serverAddress"
                        value={formData.serverAddress}
                        onChange={handleInputChange}
                        placeholder="1.1.1.1:5520 or play.myserver.com"
                        required
                    />
                    <p className="text-xs text-muted-foreground/60 font-nunito">
                        Enter IP:port or domain:port (port defaults to 5520)
                    </p>
                </div>

                {/* Game Version */}
                <div className="space-y-2">
                    <Label htmlFor="gameVersion">
                        Game Version *
                    </Label>
                    <Input
                        id="gameVersion"
                        name="gameVersion"
                        value={formData.gameVersion}
                        onChange={handleInputChange}
                        placeholder="1.0.0"
                        required
                    />
                </div>

                {/* Primary Category */}
                <div className="space-y-2">
                    <Label htmlFor="primaryCategoryId">
                        Primary Category *
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
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Info Box */}
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex gap-3">
                        <Icon icon="mdi:information" className="text-primary flex-shrink-0 mt-0.5" width="20" height="20" />
                        <p className="text-sm text-foreground/80 font-nunito">
                            Your server will be created with <strong>pending</strong> status. You can add more details and customize it after creation.
                        </p>
                    </div>
                </div>
            </div>
        </OrbisFormDialog>
    );
}
