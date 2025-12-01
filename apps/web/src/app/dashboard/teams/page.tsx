'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/useSessionStore';
import Image from 'next/image';

interface TeamMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

interface Team {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  websiteUrl?: string;
  discordUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  members: TeamMember[];
  _count?: {
    members: number;
    resources: number;
  };
}

export default function TeamsPage() {
  const { session } = useSessionStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    websiteUrl: '',
    discordUrl: '',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/user/my-teams`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTeam = await response.json();
        setTeams([...teams, newTeam]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          displayName: '',
          description: '',
          websiteUrl: '',
          discordUrl: '',
        });
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/${teamId}/leave`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setTeams(teams.filter(team => team.id !== teamId));
      }
    } catch (error) {
      console.error('Failed to leave team:', error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/${teamId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTeams(teams.filter(team => team.id !== teamId));
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const getUserRole = (team: Team): string => {
    const member = team.members?.find(m => m.user.email === session?.user?.email);
    return member?.role || 'MEMBER';
  };

  const ownedTeams = teams.filter(team => getUserRole(team) === 'OWNER');
  const joinedTeams = teams.filter(team => getUserRole(team) !== 'OWNER');

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
          <h1 className="font-hebden text-3xl font-bold text-foreground">My Teams</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Collaborate with other creators and manage team projects
          </p>
        </div>
        <Button className="font-hebden" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Icon icon="mdi:plus" width="20" height="20" />
          Create Team
        </Button>
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Create New Team</h2>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-nunito text-foreground mb-2">Team Name (URL)*</label>
                <input
                  type="text"
                  required
                  placeholder="my-awesome-team"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1 font-nunito">Lowercase letters, numbers, and hyphens only</p>
              </div>

              <div>
                <label className="block text-sm font-nunito text-foreground mb-2">Display Name*</label>
                <input
                  type="text"
                  required
                  placeholder="My Awesome Team"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-nunito text-foreground mb-2">Description</label>
              <textarea
                rows={3}
                placeholder="Describe your team..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-nunito text-foreground mb-2">Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-nunito text-foreground mb-2">Discord URL</label>
                <input
                  type="url"
                  placeholder="https://discord.gg/example"
                  value={formData.discordUrl}
                  onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-nunito focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="font-hebden">
                <Icon icon="mdi:check" width="20" height="20" />
                Create Team
              </Button>
              <Button type="button" variant="outline" className="font-hebden" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Owned Teams */}
      {ownedTeams.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Teams You Own</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownedTeams.map((team) => (
              <div key={team.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {team.logoUrl ? (
                      <Image src={team.logoUrl} alt={team.displayName} width={64} height={64} className="rounded-lg" />
                    ) : (
                      <Icon icon="mdi:account-group" width="32" height="32" className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-hebden text-lg font-semibold text-foreground">{team.displayName}</h3>
                    <p className="text-sm text-muted-foreground font-nunito mb-2">@{team.name}</p>
                    {team.description && (
                      <p className="text-sm text-foreground/70 font-nunito line-clamp-2 mb-3">{team.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account-multiple" width="16" height="16" />
                        {team._count?.members || team.members.length} members
                      </span>
                      {team._count?.resources !== undefined && (
                        <span className="flex items-center gap-1">
                          <Icon icon="mdi:package-variant" width="16" height="16" />
                          {team._count.resources} resources
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {team.websiteUrl && (
                        <a href={team.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          <Icon icon="mdi:web" width="16" height="16" className="inline" />
                        </a>
                      )}
                      {team.discordUrl && (
                        <a href={team.discordUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          <Icon icon="mdi:discord" width="16" height="16" className="inline" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="font-nunito text-sm">
                    <Icon icon="mdi:cog" width="16" height="16" />
                    Manage
                  </Button>
                  <Button size="sm" variant="destructive" className="font-nunito text-sm" onClick={() => handleDeleteTeam(team.id)}>
                    <Icon icon="mdi:delete" width="16" height="16" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Joined Teams */}
      {joinedTeams.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Teams You're In</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedTeams.map((team) => (
              <div key={team.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {team.logoUrl ? (
                      <Image src={team.logoUrl} alt={team.displayName} width={64} height={64} className="rounded-lg" />
                    ) : (
                      <Icon icon="mdi:account-group" width="32" height="32" className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-hebden text-lg font-semibold text-foreground">{team.displayName}</h3>
                    <p className="text-sm text-muted-foreground font-nunito mb-2">
                      @{team.name} · {getUserRole(team)}
                    </p>
                    {team.description && (
                      <p className="text-sm text-foreground/70 font-nunito line-clamp-2 mb-3">{team.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account-multiple" width="16" height="16" />
                        {team._count?.members || team.members.length} members
                      </span>
                      {team._count?.resources !== undefined && (
                        <span className="flex items-center gap-1">
                          <Icon icon="mdi:package-variant" width="16" height="16" />
                          {team._count.resources} resources
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {team.websiteUrl && (
                        <a href={team.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          <Icon icon="mdi:web" width="16" height="16" className="inline" />
                        </a>
                      )}
                      {team.discordUrl && (
                        <a href={team.discordUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          <Icon icon="mdi:discord" width="16" height="16" className="inline" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="font-nunito text-sm">
                    <Icon icon="mdi:eye" width="16" height="16" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="font-nunito text-sm text-destructive" onClick={() => handleLeaveTeam(team.id)}>
                    <Icon icon="mdi:logout" width="16" height="16" />
                    Leave
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {teams.length === 0 && !showCreateForm && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon icon="mdi:account-group" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No teams yet</p>
            <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
              Create or join teams to collaborate on projects, share resources, and work together with other creators.
            </p>
            <Button className="font-hebden" onClick={() => setShowCreateForm(true)}>
              <Icon icon="mdi:plus" width="20" height="20" />
              Create Your First Team
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
