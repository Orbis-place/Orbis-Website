'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { OrbisDialog } from '@/components/OrbisDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';

interface User {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    image: string | null;
    role: UserRole;
    status: AccountStatus;
    banned: boolean;
    banReason: string | null;
    bannedAt: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    _count: {
        ownedResources: number;
        showcasePosts: number;
        submittedReports: number;
    };
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update role');
            }

            await fetchUsers();
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBan = async (userId: string, banned: boolean, reason?: string) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ banned, reason }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update ban status');
            }

            await fetchUsers();
            setSelectedUser(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'ADMIN': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'MODERATOR': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusBadgeColor = (status: AccountStatus) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'BANNED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'SUSPENDED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="font-hebden text-3xl font-bold text-foreground">Users Management</h1>
                <div className="flex items-center justify-center py-12">
                    <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-hebden text-3xl font-bold text-foreground mb-2">Users Management</h1>
                <p className="font-nunito text-muted-foreground">
                    Manage user accounts, roles, and permissions
                </p>
            </div>

            {/* Filters */}
            <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="font-nunito text-sm font-medium text-foreground mb-2 block">Search</label>
                        <Input
                            placeholder="Username, email, or display name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="font-nunito"
                        />
                    </div>
                    <div>
                        <label className="font-nunito text-sm font-medium text-foreground mb-2 block">Role</label>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="font-nunito">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="MODERATOR">Moderator</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="font-nunito text-sm font-medium text-foreground mb-2 block">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="font-nunito">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="BANNED">Banned</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-secondary/30 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-6 py-3 text-left font-hebden text-sm font-semibold text-foreground">User</th>
                                <th className="px-6 py-3 text-left font-hebden text-sm font-semibold text-foreground">Role</th>
                                <th className="px-6 py-3 text-left font-hebden text-sm font-semibold text-foreground">Status</th>
                                <th className="px-6 py-3 text-left font-hebden text-sm font-semibold text-foreground">Joined</th>
                                <th className="px-6 py-3 text-left font-hebden text-sm font-semibold text-foreground">Stats</th>
                                <th className="px-6 py-3 text-right font-hebden text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img src={user.image} alt={user.username} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Icon icon="mdi:account" width="24" height="24" className="text-primary" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-hebden font-semibold text-foreground">{user.username}</p>
                                                <p className="font-nunito text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-nunito font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-nunito font-semibold border ${getStatusBadgeColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-nunito text-sm text-foreground">
                                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-nunito text-xs text-muted-foreground">
                                            <p>{user._count.ownedResources} resources</p>
                                            <p>{user._count.showcasePosts} posts</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedUser(user)}
                                            className="font-nunito"
                                        >
                                            <Icon icon="mdi:cog" width="16" height="16" />
                                            Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="text-center py-12">
                        <p className="font-nunito text-muted-foreground">No users found</p>
                    </div>
                )}
            </div>

            {/* Manage User Modal */}
            <OrbisDialog
                open={!!selectedUser}
                onOpenChange={(open) => !open && setSelectedUser(null)}
                title={`Manage ${selectedUser?.username}`}
                size="lg"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {selectedUser.image && (
                                <img src={selectedUser.image} alt={selectedUser.username} className="w-16 h-16 rounded-full" />
                            )}
                            <div>
                                <p className="font-hebden text-lg font-semibold text-foreground">{selectedUser.displayName || selectedUser.username}</p>
                                <p className="font-nunito text-sm text-muted-foreground">@{selectedUser.username}</p>
                                <p className="font-nunito text-sm text-muted-foreground">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/30">
                            <label className="font-nunito text-sm font-medium text-foreground mb-2 block">Change Role</label>
                            <Select
                                value={selectedUser.role}
                                onValueChange={(value) => handleRoleChange(selectedUser.id, value as UserRole)}
                                disabled={actionLoading}
                            >
                                <SelectTrigger className="font-nunito">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 border-t border-border/30">
                            {selectedUser.banned ? (
                                <div>
                                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                                        <p className="font-nunito text-sm font-semibold text-destructive mb-1">User is banned</p>
                                        {selectedUser.banReason && (
                                            <p className="font-nunito text-xs text-foreground/70">{selectedUser.banReason}</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleBan(selectedUser.id, false)}
                                        disabled={actionLoading}
                                        className="w-full font-hebden"
                                    >
                                        <Icon icon="mdi:account-check" width="18" height="18" />
                                        Unban User
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        const reason = prompt('Reason for banning this user:');
                                        if (reason) {
                                            handleBan(selectedUser.id, true, reason);
                                        }
                                    }}
                                    disabled={actionLoading}
                                    className="w-full font-hebden"
                                >
                                    <Icon icon="mdi:account-cancel" width="18" height="18" />
                                    Ban User
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </OrbisDialog>
        </div>
    );
}
