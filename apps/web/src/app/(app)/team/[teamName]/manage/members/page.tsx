'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/useSessionStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrbisDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserSearchCombobox } from '@/components/UserSearchCombobox';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

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
    slug: string;
    members: TeamMember[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TeamMembersManagePage() {
    const params = useParams();
    const router = useRouter();
    const { session } = useSessionStore();
    const teamName = params.teamName as string;

    const [team, setTeam] = useState<Team | null>(null);
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingInvitations, setLoadingInvitations] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

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
            const response = await fetch(`${API_URL}/teams/${teamName}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch team');
            }

            const data = await response.json();
            setTeam(data);

            // Fetch invitations if user can edit
            if (data.id) {
                await fetchInvitations(data.id);
            }
        } catch (error) {
            console.error('Error fetching team:', error);
            toast.error('Failed to load team');
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
                // If user doesn't have permissions, ignore silently
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

            toast.success('Member role updated!');
            await fetchTeam();
        } catch (error) {
            console.error('Error updating member role:', error);
            toast.error('Failed to update member role');
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

            toast.success('Member removed!');
            await fetchTeam();
            setShowRemoveMemberDialog(false);
            setSelectedMemberId(null);
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Failed to remove member');
            setShowRemoveMemberDialog(false);
            setSelectedMemberId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
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
                <h1 className="text-2xl font-bold font-hebden text-foreground">Members</h1>
                {canEdit && (
                    <Button onClick={() => setShowAddMember(true)} className="font-hebden">
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
                        <Label>Search User</Label>
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
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedUser(null)}
                            >
                                <Icon icon="mdi:close" width="16" height="16" />
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Role</Label>
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
            <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-lg font-bold font-hebden text-foreground mb-4">Team Members ({team.members.length})</h3>
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
                                    <Select
                                        value={member.role}
                                        onValueChange={(value) => handleUpdateMemberRole(member.id, value as 'OWNER' | 'ADMIN' | 'MEMBER')}
                                    >
                                        <SelectTrigger className="w-32 font-nunito">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEMBER" className="font-nunito">Member</SelectItem>
                                            <SelectItem value="ADMIN" className="font-nunito">Admin</SelectItem>
                                            {isOwner && <SelectItem value="OWNER" className="font-nunito">Owner</SelectItem>}
                                        </SelectContent>
                                    </Select>
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
                                        size="sm"
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

            {/* Pending Invitations */}
            {canEdit && invitations.length > 0 && (
                <div className="bg-secondary/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold font-hebden text-foreground mb-4">
                        Pending Invitations ({invitations.length})
                    </h3>
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
                                            @{invitation.invitee.username} • Invited as {invitation.role}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 font-nunito">
                                            Expires {formatDate(invitation.expiresAt)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        setSelectedInvitationId(invitation.id);
                                        setShowCancelInviteDialog(true);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="font-hebden text-destructive"
                                >
                                    <Icon icon="mdi:close" width="16" height="16" />
                                    Cancel
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cancel Invitation Confirmation Dialog */}
            <OrbisConfirmDialog
                open={showCancelInviteDialog}
                onOpenChange={(open) => !open && setShowCancelInviteDialog(false)}
                title="Cancel Invitation"
                description="Are you sure you want to cancel this invitation?"
                confirmText="Cancel Invitation"
                cancelText="Keep Invitation"
                variant="destructive"
                onConfirm={handleCancelInvitation}
                onCancel={() => setShowCancelInviteDialog(false)}
            >
                <></>
            </OrbisConfirmDialog>

            {/* Remove Member Confirmation Dialog */}
            <OrbisConfirmDialog
                open={showRemoveMemberDialog}
                onOpenChange={(open) => !open && setShowRemoveMemberDialog(false)}
                title="Remove Member"
                description="Are you sure you want to remove this member from the team?"
                confirmText="Remove Member"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleRemoveMember}
                onCancel={() => setShowRemoveMemberDialog(false)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}
