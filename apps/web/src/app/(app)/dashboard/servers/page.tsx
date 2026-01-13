'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import Image from 'next/image';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';

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
  ownerUser?: {
    id: string;
    username: string;
    displayName?: string;
    image?: string;
  };
  ownerTeam?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  categories?: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
    isPrimary: boolean;
  }>;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export default function ServersPage() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);

  useEffect(() => {
    fetchServers();
  }, []);

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
        toast.success('Server deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete server:', error);
      toast.error('Failed to delete server');
    } finally {
      setDeletingServerId(null);
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

  const ServerCard = ({ server }: { server: Server }) => (
    <div className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {server.logo ? (
            <Image src={server.logo} alt={server.name} width={64} height={64} className="rounded-lg object-cover" />
          ) : (
            <Icon ssr={true} icon="mdi:server" width="32" height="32" className="text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-hebden text-lg font-semibold text-foreground">{server.name}</h3>
            {server.featured && (
              <Icon ssr={true} icon="mdi:star" width="16" height="16" className="text-yellow-500" />
            )}
            {server.verified && (
              <Icon ssr={true} icon="mdi:check-decagram" width="16" height="16" className="text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito mb-2">
            <Icon ssr={true} icon={getStatusIcon(server.status)} width="16" height="16" className={getStatusColor(server.status)} />
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
              <Icon ssr={true} icon="mdi:account-multiple" width="16" height="16" />
              {server.currentPlayers}/{server.maxPlayers}
            </span>
            <span className="flex items-center gap-1">
              <Icon ssr={true} icon="mdi:thumb-up" width="16" height="16" />
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
          <Icon ssr={true} icon="mdi:eye" width="16" height="16" />
          View
        </Button>
        <Button size="sm" variant="outline" className="font-nunito text-sm" onClick={() => router.push(`/servers/${server.slug}/manage`)}>
          <Icon ssr={true} icon="mdi:pencil" width="16" height="16" />
          Manage
        </Button>
        <Button size="sm" variant="destructive" className="font-nunito text-sm" onClick={() => setDeletingServerId(server.id)}>
          <Icon ssr={true} icon="mdi:delete" width="16" height="16" />
          Delete
        </Button>
      </div>
    </div>
  );

  const totalServers = servers.length;
  const onlineServers = servers.filter(s => s.isOnline).length;
  const totalPlayers = servers.reduce((acc, s) => acc + s.currentPlayers, 0);

  // Group servers by team
  const personalServers = servers.filter(s => !s.ownerTeam);
  const teamServers = servers.filter(s => s.ownerTeam);

  // Group team servers by team
  const serversByTeam = teamServers.reduce((acc, server) => {
    const teamId = server.ownerTeam!.id;
    if (!acc[teamId]) {
      acc[teamId] = {
        team: server.ownerTeam!,
        servers: []
      };
    }
    acc[teamId].servers.push(server);
    return acc;
  }, {} as Record<string, { team: NonNullable<Server['ownerTeam']>, servers: Server[] }>);

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
          <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
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
        <Button className="font-hebden" onClick={() => router.push('/servers/new')}>
          <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
          Create Server
        </Button>
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

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-green-500/20 rounded-lg">
              <Icon ssr={true} icon="mdi:check-circle" width="24" height="24" className="text-green-500" />
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
              <Icon ssr={true} icon="mdi:account-multiple" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">{totalPlayers}</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Players</p>
            </div>
          </div>
        </div>
      </div>

      {/* Servers List */}
      <div className="space-y-6">
        {servers.length > 0 ? (
          <>
            {/* Personal Servers */}
            {personalServers.length > 0 && (
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Personal Servers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalServers.map((server) => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            )}

            {/* Team Servers */}
            {Object.values(serversByTeam).map(({ team, servers: teamServers }) => (
              <div key={team.id} className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {team.logo ? (
                      <Image src={team.logo} alt={team.name} width={40} height={40} className="rounded-lg object-cover" />
                    ) : (
                      <Icon ssr={true} icon="mdi:account-group" width="24" height="24" className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-hebden text-xl font-semibold text-foreground">
                      {team.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-nunito">
                      {teamServers.length} server{teamServers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamServers.map((server) => (
                    <ServerCard key={server.id} server={server} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="bg-secondary/30 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-accent rounded-full mb-4">
                <Icon ssr={true} icon="mdi:server" width="48" height="48" className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-nunito text-lg mb-2">No servers yet</p>
              <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
                Add your Hytale servers to track their status, manage players, and showcase them to the community.
              </p>
              <Button className="font-hebden" onClick={() => router.push('/servers/new')}>
                <Icon ssr={true} icon="mdi:plus" width="20" height="20" />
                Create Your First Server
              </Button>
            </div>
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
