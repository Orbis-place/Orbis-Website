'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { CreateServerDialog } from '@/components/CreateServerDialog';
import { toast } from 'sonner';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Server {
    id: string;
    name: string;
    slug: string;
    shortDesc?: string;
    serverIp: string;
    port: number;
    logo?: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
}

export default function TeamServersPage() {
    const params = useParams();
    const router = useRouter();
    const teamName = params.teamName as string;

    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState<string>('');
    const [deletingServerId, setDeletingServerId] = useState<string | null>(null);
    const [isCreateServerOpen, setIsCreateServerOpen] = useState(false);

    useEffect(() => {
        fetchServers();
    }, [teamName]);

    const fetchServers = async () => {
        try {
            setLoading(true);

            // First, get the team ID from the team name
            const teamResponse = await fetch(`${API_URL}/teams/${teamName}`, {
                credentials: 'include',
            });

            if (!teamResponse.ok) {
                throw new Error('Failed to fetch team');
            }

            const teamData = await teamResponse.json();
            setTeamId(teamData.id);

            // Fetch servers
            const serversResponse = await fetch(`${API_URL}/teams/${teamData.id}/servers`, {
                credentials: 'include',
            });

            if (serversResponse.ok) {
                const serversData = await serversResponse.json();
                setServers(serversData);
            }
        } catch (error) {
            console.error('Error fetching team servers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteServer = async () => {
        if (!deletingServerId) return;

        try {
            const response = await fetch(`${API_URL}/servers/${deletingServerId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setServers(servers.filter(server => server.id !== deletingServerId));
                toast.success('Server deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete server:', error);
            toast.error('Failed to delete server');
        } finally {
            setDeletingServerId(null);
        }
    };

    const totalServers = servers.length;
    const onlineServers = servers.filter(s => s.isOnline).length;
    const totalPlayers = servers.reduce((acc, s) => acc + s.currentPlayers, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-hebden text-2xl font-bold text-foreground">Team Servers</h1>
                    <p className="text-muted-foreground mt-1 font-nunito text-sm">
                        Manage servers owned by this team
                    </p>
                </div>

                {/* Create Server Dialog */}
                <CreateServerDialog
                    open={isCreateServerOpen}
                    onOpenChange={setIsCreateServerOpen}
                    trigger={
                        <Button className="font-hebden">
                            <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
                            Create Server
                        </Button>
                    }
                    onSuccess={fetchServers}
                    defaultTeamId={teamId}
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon ssr={true} icon="mdi:server" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalServers}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Servers</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon ssr={true} icon="mdi:check-circle" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{onlineServers}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Online Servers</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-accent/80 to-accent/40 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon ssr={true} icon="mdi:account-group" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalPlayers}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Players</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Servers List */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Servers</h2>
                {servers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {servers.map((server) => (
                            <div key={server.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {server.logo ? (
                                            <Image src={server.logo} alt={server.name} width={64} height="64" className="rounded-lg object-cover" />
                                        ) : (
                                            <Icon ssr={true} icon="mdi:server" width="32" height="32" className="text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-hebden text-lg font-semibold text-foreground">{server.name}</h3>
                                            {server.isOnline && (
                                                <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-nunito mb-2">{server.serverIp}:{server.port}</p>
                                        {server.shortDesc && (
                                            <p className="text-sm text-foreground/70 font-nunito line-clamp-2 mb-3">{server.shortDesc}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito">
                                            <span className="flex items-center gap-1">
                                                <Icon ssr={true} icon="mdi:account" width="16" height="16" />
                                                {server.currentPlayers}/{server.maxPlayers}
                                            </span>
                                            <span className={server.isOnline ? 'text-green-500' : 'text-red-500'}>
                                                {server.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="font-nunito text-sm"
                                        onClick={() => router.push(`/servers/${server.slug}`)}
                                    >
                                        <Icon ssr={true} icon="mdi:eye" width="16" height="16" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="font-nunito text-sm"
                                        onClick={() => router.push(`/servers/${server.slug}/manage`)}
                                    >
                                        <Icon ssr={true} icon="mdi:cog" width="16" height="16" />
                                        Manage
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="font-nunito text-sm"
                                        onClick={() => setDeletingServerId(server.id)}
                                    >
                                        <Icon ssr={true} icon="mdi:delete" width="16" height="16" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            <Icon ssr={true} icon="mdi:server" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-nunito text-lg mb-2">No servers yet</p>
                        <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
                            This team doesn't have any servers yet. Create one to get started.
                        </p>
                        <Button className="font-hebden" onClick={() => setIsCreateServerOpen(true)}>
                            <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
                            Create First Server
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Server Confirmation Dialog */}
            <OrbisConfirmDialog
                open={!!deletingServerId}
                onOpenChange={(open) => !open && setDeletingServerId(null)}
                title="Delete Server"
                description="Are you sure you want to delete this server? This action cannot be undone."
                confirmText="Delete Server"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteServer}
                onCancel={() => setDeletingServerId(null)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}
