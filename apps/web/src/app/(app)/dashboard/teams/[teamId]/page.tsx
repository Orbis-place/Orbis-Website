'use client'

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/useSessionStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrbisDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image?: string;
  };
}

interface TeamInvitation {
  id: string;
  teamId: string;
  inviterId: string;
  inviteeId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  inviter: {
    id: string;
    username: string;
    displayName?: string;
    image?: string;
  };
  invitee: {
    id: string;
    username: string;
    displayName?: string;
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
  logo?: string;
  banner?: string;
  members: TeamMember[];
  _count?: {
    members: number;
    resources: number;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TeamManagePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useSessionStore();
  const teamName = params.teamId as string;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [team, setTeam] = useState<Team | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    websiteUrl: '',
    discordUrl: '',
  });

  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    displayName?: string;
    image?: string;
  } | null>(null);
  const [invitationRole, setInvitationRole] = useState<'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER'>('MEMBER');

  // Confirmation dialogs state
  const [showCancelInviteDialog, setShowCancelInviteDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [showLeaveTeamDialog, setShowLeaveTeamDialog] = useState(false);
  const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const userRole = team?.members?.find(m => m.user.id === session?.user?.id)?.role;
  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';
  const isOwner = userRole === 'OWNER';

  useEffect(() => {
    fetchTeam();
  }, [teamName]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      // Utiliser le name pour récupérer la team (l'endpoint retourne l'ID)
      const response = await fetch(`${API_URL}/teams/${teamName}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }

      const data = await response.json();
      setTeam(data);
      setFormData({
        displayName: data.displayName,
        description: data.description || '',
        websiteUrl: data.websiteUrl || '',
        discordUrl: data.discordUrl || '',
      });

      // Fetch invitations if user can edit
      if (data.id) {
        await fetchInvitations(data.id);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async (teamId: string) => {
    try {
      setLoadingInvitations(true);
      const response = await fetch(`${API_URL}/teams/${teamId}/invitations?status=PENDING`, {
        credentials: 'include',
      });

      if (!response.ok) {
        // Si l'utilisateur n'a pas les permissions, on ignore silencieusement
        if (response.status === 403) {
          return;
        }
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team?.id) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update team');
      }

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
    if (!team?.id) return;

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await fetch(`${API_URL}/teams/${team.id}/${type}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      await fetchTeam();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    }
  };

  const handleDeleteFile = async (type: 'logo' | 'banner') => {
    if (!team?.id) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}/${type}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      await fetchTeam();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleSendInvitation = async () => {
    if (!team?.id || !selectedUser) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          inviteeId: selectedUser.id,
          role: invitationRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to send invitation');
        return;
      }

      toast.success(`Invitation sent to ${selectedUser.displayName || selectedUser.username}!`);
      setShowAddMember(false);
      setSelectedUser(null);
      setInvitationRole('MEMBER');

      // Refresh invitations list
      if (team.id) {
        await fetchInvitations(team.id);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleCancelInvitation = async () => {
    if (!team?.id || !selectedInvitationId) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}/invitations/${selectedInvitationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invitation');
      }

      toast.success('Invitation cancelled!');
      // Refresh invitations list
      await fetchInvitations(team.id);
      setShowCancelInviteDialog(false);
      setSelectedInvitationId(null);
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
      setShowCancelInviteDialog(false);
      setSelectedInvitationId(null);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    if (!team?.id) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      await fetchTeam();
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!team?.id || !selectedMemberId) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}/members/${selectedMemberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      await fetchTeam();
      setShowRemoveMemberDialog(false);
      setSelectedMemberId(null);
    } catch (error) {
      console.error('Error removing member:', error);
      setShowRemoveMemberDialog(false);
      setSelectedMemberId(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team?.id) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}/leave`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to leave team');
      }

      router.push('/dashboard/teams');
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    } finally {
      setShowLeaveTeamDialog(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team?.id) return;

    try {
      const response = await fetch(`${API_URL}/teams/${team.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      router.push('/dashboard/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    } finally {
      setShowDeleteTeamDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="mdi:loading" className="animate-spin" width="48" height="48" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon icon="mdi:account-group-outline" width="48" height="48" className="text-muted-foreground" />
        <p className="text-foreground font-nunito text-lg mt-4">Team not found</p>
        <Button onClick={() => router.push('/dashboard/teams')} className="mt-4 font-hebden">
          Back to Teams
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/dashboard/teams')}
            className="font-hebden"
            variant="ghost"
            size="icon"
          >
            <Icon icon="mdi:arrow-left" width="20" height="20" />
          </Button>
          <h1 className="text-3xl font-bold font-hebden text-foreground">Team Management</h1>
        </div>
        {!isOwner && (
          <Button
            onClick={() => setShowLeaveTeamDialog(true)}
            variant="destructive"
            className="font-hebden"
          >
            <Icon icon="mdi:exit-to-app" width="20" height="20" />
            Leave Team
          </Button>
        )}
      </div>

      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden">
        {team.banner && (
          <Image
            src={team.banner}
            alt={`${team.displayName} banner`}
            fill
            className="object-cover"
          />
        )}
        {canEdit && (
          <div className="absolute top-4 right-4 flex gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
            />
            <Button
              size="icon-sm"
              className="font-hebden"
              onClick={() => bannerInputRef.current?.click()}
            >
              <Icon icon="mdi:upload" width="16" height="16" />
            </Button>
            {team.banner && (
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={() => handleDeleteFile('banner')}
                className="font-hebden"
              >
                <Icon icon="mdi:delete" width="16" height="16" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Team Info */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="relative">
            {team.logo ? (
              <Image
                src={team.logo}
                alt={team.displayName}
                width={96}
                height={96}
                className="rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon icon="mdi:account-group" width="48" height="48" />
              </div>
            )}
            {canEdit && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                />
                <Button
                  size="icon-sm"
                  className="font-hebden"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Icon icon="mdi:upload" width="16" height="16" />
                </Button>
                {team.logo && (
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => handleDeleteFile('logo')}
                    className="font-hebden"
                  >
                    <Icon icon="mdi:delete" width="16" height="16" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-hebden text-foreground">{team.displayName}</h2>
                    <p className="text-muted-foreground font-nunito">@{team.name}</p>
                  </div>
                  {canEdit && (
                    <Button onClick={() => setIsEditing(true)} className="font-hebden">
                      <Icon icon="mdi:pencil" width="20" height="20" />
                      Edit
                    </Button>
                  )}
                </div>
                {team.description && (
                  <p className="text-foreground font-nunito">{team.description}</p>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground font-nunito">
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:account-group" width="16" height="16" />
                    {team._count?.members || team.members.length} members
                  </span>
                  {team._count?.resources !== undefined && (
                    <span className="flex items-center gap-1">
                      <Icon icon="mdi:package-variant" width="16" height="16" />
                      {team._count.resources} resources
                    </span>
                  )}
                </div>
                {(team.websiteUrl || team.discordUrl) && (
                  <div className="flex gap-3">
                    {team.websiteUrl && (
                      <a
                        href={team.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-nunito text-sm flex items-center gap-1"
                      >
                        <Icon icon="mdi:web" width="16" height="16" />
                        Website
                      </a>
                    )}
                    {team.discordUrl && (
                      <a
                        href={team.discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-nunito text-sm flex items-center gap-1"
                      >
                        <Icon icon="mdi:discord" width="16" height="16" />
                        Discord
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-nunito text-foreground mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg font-nunito"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-nunito text-foreground mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg font-nunito"
                  />
                </div>
                <div>
                  <label className="block text-sm font-nunito text-foreground mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg font-nunito"
                  />
                </div>
                <div>
                  <label className="block text-sm font-nunito text-foreground mb-1">Discord URL</label>
                  <input
                    type="url"
                    value={formData.discordUrl}
                    onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg font-nunito"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="font-hebden">
                    <Icon icon="mdi:check" width="20" height="20" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        displayName: team.displayName,
                        description: team.description || '',
                        websiteUrl: team.websiteUrl || '',
                        discordUrl: team.discordUrl || '',
                      });
                    }}
                    variant="outline"
                    className="font-hebden"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-hebden text-foreground">Team Members</h3>
          {canEdit && (
            <Button onClick={() => setShowAddMember(!showAddMember)} className="font-hebden">
              <Icon icon="mdi:email-plus" width="20" height="20" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Invite Member Dialog */}
        <OrbisDialog
          open={showAddMember}
          onOpenChange={setShowAddMember}
          title="Invite Team Member"
          description="Search for a user and send them an invitation to join your team."
          size="md"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedUser(null);
                  setInvitationRole('MEMBER');
                }}
                className="font-hebden"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendInvitation}
                disabled={!selectedUser}
                className="font-hebden"
              >
                <Icon icon="mdi:email-send" width="20" height="20" />
                Send Invitation
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-nunito text-foreground">Search User</label>
              <UserSearchCombobox
                onSelect={(user) => setSelectedUser(user)}
                placeholder="Type at least 3 characters..."
                excludeUserIds={team?.members.map(m => m.user.id) || []}
              />
            </div>

            {selectedUser && (
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedUser.image} alt={selectedUser.username} />
                  <AvatarFallback>{selectedUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold font-nunito text-foreground">
                    {selectedUser.displayName || selectedUser.username}
                  </p>
                  <p className="text-sm text-muted-foreground font-nunito">@{selectedUser.username}</p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setSelectedUser(null)}
                >
                  <Icon icon="mdi:close" width="16" height="16" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-nunito text-foreground">Role</label>
              <Select value={invitationRole} onValueChange={(value) => setInvitationRole(value as any)}>
                <SelectTrigger className="font-nunito">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER" className="font-nunito">Member</SelectItem>
                  <SelectItem value="MODERATOR" className="font-nunito">Moderator</SelectItem>
                  <SelectItem value="ADMIN" className="font-nunito">Admin</SelectItem>
                  {isOwner && <SelectItem value="OWNER" className="font-nunito">Owner</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </OrbisDialog>

        {/* Members List */}
        <div className="space-y-3">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-background/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user.image} alt={member.user.username} />
                  <AvatarFallback>{member.user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-nunito font-semibold text-foreground">{member.user.username}</p>
                  <p className="text-sm text-muted-foreground font-nunito">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {canEdit && member.user.id !== session?.user?.id ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as 'OWNER' | 'ADMIN' | 'MEMBER')}
                    className="px-3 py-1 bg-background border border-border rounded-lg font-nunito text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    {isOwner && <option value="OWNER">Owner</option>}
                  </select>
                ) : (
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg font-nunito text-sm">
                    {member.role}
                  </span>
                )}
                {canEdit && member.user.email !== session?.user?.email && (
                  <Button
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowRemoveMemberDialog(true);
                    }}
                    variant="destructive"
                    size="icon-sm"
                    className="font-hebden"
                  >
                    <Icon icon="mdi:delete" width="16" height="16" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {canEdit && invitations.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-hebden text-foreground">Pending Invitations</h3>
            <span className="text-sm text-muted-foreground font-nunito">
              {invitations.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={invitation.invitee.image} alt={invitation.invitee.username} />
                    <AvatarFallback>{invitation.invitee.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-nunito font-semibold text-foreground">
                      {invitation.invitee.displayName || invitation.invitee.username}
                    </p>
                    <p className="text-sm text-muted-foreground font-nunito">
                      @{invitation.invitee.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-lg font-nunito text-sm">
                    {invitation.role}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg font-nunito text-sm">
                    Pending
                  </span>
                  <Button
                    onClick={() => {
                      setSelectedInvitationId(invitation.id);
                      setShowCancelInviteDialog(true);
                    }}
                    variant="destructive"
                    size="icon-sm"
                    className="font-hebden"
                    title="Cancel invitation"
                  >
                    <Icon icon="mdi:close" width="16" height="16" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {isOwner && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
          <h3 className="text-xl font-bold font-hebden text-destructive mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <p className="text-foreground font-nunito text-sm">
              Once you delete a team, there is no going back. Please be certain.
            </p>
            <Button
              onClick={() => setShowDeleteTeamDialog(true)}
              variant="destructive"
              className="font-hebden"
            >
              <Icon icon="mdi:delete-forever" width="20" height="20" />
              Delete Team
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <OrbisConfirmDialog
        open={showCancelInviteDialog}
        onOpenChange={setShowCancelInviteDialog}
        title="Cancel Invitation"
        description="Are you sure you want to cancel this invitation?"
        confirmText="Cancel Invitation"
        cancelText="Keep Invitation"
        variant="destructive"
        onConfirm={handleCancelInvitation}
        onCancel={() => {
          setShowCancelInviteDialog(false);
          setSelectedInvitationId(null);
        }}
      >
        {/* No additional content needed */}
      </OrbisConfirmDialog>

      <OrbisConfirmDialog
        open={showRemoveMemberDialog}
        onOpenChange={setShowRemoveMemberDialog}
        title="Remove Member"
        description="Are you sure you want to remove this member from the team?"
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleRemoveMember}
        onCancel={() => {
          setShowRemoveMemberDialog(false);
          setSelectedMemberId(null);
        }}
      >
        {/* No additional content needed */}
      </OrbisConfirmDialog>

      <OrbisConfirmDialog
        open={showLeaveTeamDialog}
        onOpenChange={setShowLeaveTeamDialog}
        title="Leave Team"
        description="Are you sure you want to leave this team?"
        confirmText="Leave Team"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleLeaveTeam}
        onCancel={() => setShowLeaveTeamDialog(false)}
      >
        {/* No additional content needed */}
      </OrbisConfirmDialog>

      <OrbisConfirmDialog
        open={showDeleteTeamDialog}
        onOpenChange={setShowDeleteTeamDialog}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone."
        confirmText="Delete Team"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteTeam}
        onCancel={() => setShowDeleteTeamDialog(false)}
      >
        {/* No additional content needed */}
      </OrbisConfirmDialog>
    </div>
  );
}