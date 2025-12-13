'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbisConfirmDialog, OrbisFormDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';

interface ServerCategory {
  id: string;
  name: string;
  slug: string;
}

interface ServerTag {
  id: string;
  name: string;
  slug: string;
}

interface Server {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  serverAddress: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';
  logo?: string;
  banner?: string;
  gameVersion: string;
  supportedVersions: string[];
  currentPlayers: number;
  maxPlayers: number;
  isOnline: boolean;
  voteCount: number;
  websiteUrl?: string;
  discordUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: Array<{
    category: ServerCategory;
    isPrimary: boolean;
  }>;
  tags?: Array<{
    tag: ServerTag;
  }>;
}

interface Team {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
}

export default function ServersPage() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<ServerCategory[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    serverAddress: '',
    gameVersion: '1.0.0',
    primaryCategoryId: '',
    teamId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchServers();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isCreateOpen) {
      fetchTeams();
    }
  }, [isCreateOpen]);

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

  const fetchServers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/me/servers`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setServers(data);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!deletingServerId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/servers/${deletingServerId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setServers(servers.filter(server => server.id !== deletingServerId));
      }
    } catch (error) {
      console.error('Failed to delete server:', error);
    } finally {
      setDeletingServerId(null);
    }
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateFormData({
      ...createFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    setIsCreating(true);

    try {
      const serverData = {
        name: createFormData.name,
        description: createFormData.description,
        serverAddress: createFormData.serverAddress,
        gameVersion: createFormData.gameVersion,
        primaryCategoryId: createFormData.primaryCategoryId,
        supportedVersions: [createFormData.gameVersion],
        teamId: createFormData.teamId,
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
        throw new Error('Failed to create server');
      }

      const data = await response.json();
      console.log('Server created:', data);

      // Reset form and close dialog
      setCreateFormData({
        name: '',
        description: '',
        serverAddress: '',
        gameVersion: '1.0.0',
        primaryCategoryId: '',
        teamId: undefined,
      });
      setIsCreateOpen(false);

      toast.success('Server created successfully!');

      // Refresh the servers list
      fetchServers();
    } catch (error) {
      console.error('Error creating server:', error);
      toast.error('Failed to create server. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: Server['status']) => {
    switch (status) {
      case 'APPROVED': return 'text-[#10b981]';
      case 'PENDING': return 'text-[#f59e0b]';
      case 'REJECTED': return 'text-destructive';
      case 'SUSPENDED': return 'text-[#f97316]';
      case 'ARCHIVED': return 'text-[#6b7280]';
      default: return 'text-muted-foreground';
    }
  };
  const getStatusIcon = (status: Server['status']) => {
    switch (status) {
      case 'APPROVED': return 'mdi:check-circle';
      case 'PENDING': return 'mdi:clock-outline';
      case 'REJECTED': return 'mdi:close-circle';
      case 'SUSPENDED': return 'mdi:pause-circle';
      case 'ARCHIVED': return 'mdi:archive';
      default: return 'mdi:help-circle';
    }
  };

  const totalServers = servers.length;
  const onlineServers = servers.filter(s => s.isOnline).length;
  const totalPlayers = servers.reduce((acc, s) => acc + s.currentPlayers, 0);

  const generateChartData = (server: Server) => {
    const days = 7;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        players: i === 0 ? server.currentPlayers : 0,
        votes: i === 0 ? server.voteCount : 0,
      });
    }

    return data;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">My Servers</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Manage your Hytale servers and monitor their status
          </p>
        </div>
        <OrbisFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={
            <Button className="font-hebden">
              <Icon icon="mdi:plus" width="20" height="20" />
              Add Server
            </Button>
          }
          title="Add New Server"
          description="Fill in the details to add your server"
          size="lg"
          onSubmit={handleCreateServer}
          submitText="Add Server"
          submitLoading={isCreating}
          onCancel={() => setIsCreateOpen(false)}
        >
          <div className="space-y-4">
            {/* Owner Selection */}
            <div className="space-y-2">
              <Label htmlFor="owner">
                Owner *
              </Label>
              <Select
                value={createFormData.teamId || 'personal'}
                onValueChange={(value) => setCreateFormData({ ...createFormData, teamId: value === 'personal' ? undefined : value })}
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
                Choose whether this server belongs to you or one of your teams
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
                value={createFormData.name}
                onChange={handleCreateInputChange}
                placeholder="My Awesome Server"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={createFormData.description}
                onChange={handleCreateInputChange}
                placeholder="A brief description of your server..."
                rows={3}
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground/60 font-nunito">
                {createFormData.description.length}/200 characters (minimum 10)
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
                value={createFormData.serverAddress}
                onChange={handleCreateInputChange}
                placeholder="1.1.1.1:25565 or play.myserver.com"
                required
              />
              <p className="text-xs text-muted-foreground/60 font-nunito">
                Enter IP:port or domain:port (port defaults to 25565)
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
                value={createFormData.gameVersion}
                onChange={handleCreateInputChange}
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
                value={createFormData.primaryCategoryId}
                onValueChange={(value) => setCreateFormData({ ...createFormData, primaryCategoryId: value })}
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:server" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">{totalServers}</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Servers</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-green-500/20 rounded-lg">
              <Icon icon="mdi:check-circle" width="24" height="24" className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">{onlineServers}</p>
              <p className="text-sm text-foreground/70 font-nunito">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:account-multiple" width="24" height="24" className="text-primary" />
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
        <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Your Servers</h2>
        {servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <div key={server.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {server.logo ? (
                      <Image src={server.logo} alt={server.name} width={64} height={64} className="rounded-lg object-cover" />
                    ) : (
                      <Icon icon="mdi:server" width="32" height="32" className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-hebden text-lg font-semibold text-foreground">{server.name}</h3>
                      {server.featured && (
                        <Icon icon="mdi:star" width="16" height="16" className="text-yellow-500" />
                      )}
                      {server.verified && (
                        <Icon icon="mdi:check-decagram" width="16" height="16" className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito mb-2">
                      <Icon icon={getStatusIcon(server.status)} width="16" height="16" className={getStatusColor(server.status)} />
                      <span className={getStatusColor(server.status)}>{server.status}</span>
                      <span>•</span>
                      <span className={server.isOnline ? 'text-green-500' : 'text-destructive'}>
                        {server.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {server.shortDesc && (
                      <p className="text-sm text-foreground/70 font-nunito line-clamp-2 mb-3">{server.shortDesc}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito mb-2">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account-multiple" width="16" height="16" />
                        {server.currentPlayers}/{server.maxPlayers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:thumb-up" width="16" height="16" />
                        {server.voteCount} votes
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-nunito">
                      {server.serverAddress}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-background/50 rounded-lg">
                  <h4 className="font-nunito text-sm font-semibold text-foreground mb-3">Player Activity (Last 7 Days)</h4>
                  <ChartContainer
                    config={{
                      players: {
                        label: 'Players',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-[120px] w-full"
                  >
                    <AreaChart data={generateChartData(server)}>
                      <defs>
                        <linearGradient id={`gradient-${server.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="players"
                        stroke="hsl(var(--primary))"
                        fill={`url(#gradient-${server.id})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="font-nunito text-sm" onClick={() => router.push(`/servers/${server.slug}`)}>
                    <Icon icon="mdi:eye" width="16" height="16" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="font-nunito text-sm" onClick={() => router.push(`/servers/${server.slug}/manage`)}>
                    <Icon icon="mdi:pencil" width="16" height="16" />
                    Manage
                  </Button>
                  <Button size="sm" variant="destructive" className="font-nunito text-sm" onClick={() => setDeletingServerId(server.id)}>
                    <Icon icon="mdi:delete" width="16" height="16" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon icon="mdi:server" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No servers yet</p>
            <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
              Add your Hytale servers to track their status, manage players, and showcase them to the community.
            </p>
            <Button className="font-hebden" onClick={() => setIsCreateOpen(true)}>
              <Icon icon="mdi:plus" width="20" height="20" />
              Add Your First Server
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
