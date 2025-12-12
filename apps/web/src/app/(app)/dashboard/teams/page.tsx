'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSessionStore } from '@/stores/useSessionStore';
import Image from 'next/image';
import { OrbisFormDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';

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
  logo?: string;
  banner?: string;
  members: TeamMember[];
  _count?: {
    members: number;
    resources: number;
  };
}

interface TeamInvitation {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  team: {
    id: string;
    name: string;
    displayName: string;
    logo?: string;
  };
  inviter: {
    id: string;
    username: string;
    displayName?: string;
    image?: string;
  };
}

export default function TeamsPage() {
  const router = useRouter();
  const { session } = useSessionStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    websiteUrl: '',
    discordUrl: '',
  });
  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
    fetchInvitations();
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

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/invitations/me?status=PENDING`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const newTeam = await response.json();
      console.log('Team created:', newTeam);

      // Reset form and close dialog
      setFormData({
        name: '',
        displayName: '',
        description: '',
        websiteUrl: '',
        discordUrl: '',
      });
      setIsCreateOpen(false);

      toast.success('Team created successfully!');

      // Refresh the teams list
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!leavingTeamId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/${leavingTeamId}/leave`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setTeams(teams.filter(team => team.id !== leavingTeamId));
      }
    } catch (error) {
      console.error('Failed to leave team:', error);
    } finally {
      setLeavingTeamId(null);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeamId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/${deletingTeamId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTeams(teams.filter(team => team.id !== deletingTeamId));
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    } finally {
      setDeletingTeamId(null);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: 'ACCEPTED' }),
      });

      if (response.ok) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        await fetchTeams(); // Refresh teams list
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/teams/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: 'DECLINED' }),
      });

      if (response.ok) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Failed to decline invitation:', error);
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

        {/* Create Team Dialog */}
        <OrbisFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={
            <Button className="font-hebden">
              <Icon icon="mdi:plus" width="20" height="20" />
              Create Team
            </Button>
          }
          title="Create New Team"
          description="Fill in the details to create your team"
          size="lg"
          onSubmit={handleCreateTeam}
          submitText="Create Team"
          submitLoading={isLoading}
          onCancel={() => setIsCreateOpen(false)}
        >
          <div className="space-y-4">
            {/* Team Name (URL) */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Team Name (URL) *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="my-awesome-team"
                required
              />
              <p className="text-xs text-muted-foreground/60 font-nunito">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name *
              </Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="My Awesome Team"
                required
              />
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
                onChange={handleInputChange}
                placeholder="Describe your team..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </OrbisFormDialog>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="mdi:email" width="24" height="24" className="text-yellow-500" />
            <h2 className="font-hebden text-xl font-semibold text-foreground">Pending Invitations</h2>
            <span className="bg-yellow-500 text-background text-xs font-bold px-2 py-1 rounded-full">
              {invitations.length}
            </span>
          </div>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-background/50 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {invitation.team.logo ? (
                      <Image src={invitation.team.logo} alt={invitation.team.displayName} width={48} height={48} className="rounded-lg" />
                    ) : (
                      <Icon icon="mdi:account-group" width="24" height="24" className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-hebden text-lg font-semibold text-foreground">{invitation.team.displayName}</h3>
                    <p className="text-sm text-muted-foreground font-nunito mb-2">
                      <span className="font-semibold text-foreground">{invitation.inviter.displayName || invitation.inviter.username}</span>
                      {' '}invited you to join as{' '}
                      <span className="font-semibold text-primary">{invitation.role}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-nunito">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:clock-outline" width="14" height="14" />
                        Invited {new Date(invitation.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:calendar-clock" width="14" height="14" />
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="font-nunito text-sm bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                    >
                      <Icon icon="mdi:check" width="16" height="16" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-nunito text-sm text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                    >
                      <Icon icon="mdi:close" width="16" height="16" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                    {team.logo ? (
                      <Image src={team.logo} alt={team.displayName} width={64} height={64} className="rounded-lg" />
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
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="font-nunito text-sm" onClick={() => router.push(`/team/${team.name}/manage`)}>
                    <Icon icon="mdi:cog" width="16" height="16" />
                    Manage
                  </Button>
                  <Button size="sm" variant="destructive" className="font-nunito text-sm" onClick={() => setDeletingTeamId(team.id)}>
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
                    {team.logo ? (
                      <Image src={team.logo} alt={team.displayName} width={64} height={64} className="rounded-lg" />
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
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="font-nunito text-sm" onClick={() => router.push(`/team/${team.name}`)}>
                    <Icon icon="mdi:eye" width="16" height="16" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/team/${team.name}/manage`)}>
                    <Icon icon="mdi:cog" width="16" height="16" />
                    Manage
                  </Button>
                  <Button size="sm" variant="outline" className="font-nunito text-sm text-destructive" onClick={() => setLeavingTeamId(team.id)}>
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
      {teams.length === 0 && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon icon="mdi:account-group" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No teams yet</p>
            <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
              Create or join teams to collaborate on projects, share resources, and work together with other creators.
            </p>
            <Button className="font-hebden" onClick={() => setIsCreateOpen(true)}>
              <Icon icon="mdi:plus" width="20" height="20" />
              Create Your First Team
            </Button>
          </div>
        </div>
      )}

      {/* Leave Team Confirmation Dialog */}
      <OrbisConfirmDialog
        open={!!leavingTeamId}
        onOpenChange={(open) => !open && setLeavingTeamId(null)}
        title="Leave Team"
        description="Are you sure you want to leave this team?"
        confirmText="Leave Team"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleLeaveTeam}
        onCancel={() => setLeavingTeamId(null)}
      >
        <></>
      </OrbisConfirmDialog>

      {/* Delete Team Confirmation Dialog */}
      <OrbisConfirmDialog
        open={!!deletingTeamId}
        onOpenChange={(open) => !open && setDeletingTeamId(null)}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone."
        confirmText="Delete Team"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeletingTeamId(null)}
      >
        <></>
      </OrbisConfirmDialog>
    </div>
  );
}
