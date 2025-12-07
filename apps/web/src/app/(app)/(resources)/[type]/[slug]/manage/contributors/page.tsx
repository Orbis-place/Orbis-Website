'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Trash2, Search } from 'lucide-react';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';

interface Contributor {
    user: {
        id: string;
        username: string;
        displayName: string;
        image: string | null;
    };
    role: string;
    createdAt: string;
}

interface SearchUser {
    id: string;
    username: string;
    displayName: string;
    image: string | null;
}

export default function ManageContributorsPage() {
    const params = useParams();
    const resourceSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [resourceId, setResourceId] = useState<string>('');
    const [contributors, setContributors] = useState<Contributor[]>([]);

    // Add contributor state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
    const [newRole, setNewRole] = useState('');
    const [adding, setAdding] = useState(false);

    // Edit contributor state
    const [editingContributor, setEditingContributor] = useState<string | null>(null);
    const [editRole, setEditRole] = useState('');
    const [updating, setUpdating] = useState(false);

    // Delete state
    const [deletingContributor, setDeletingContributor] = useState<Contributor | null>(null);

    useEffect(() => {
        fetchResource();
    }, [resourceSlug]);

    useEffect(() => {
        if (resourceId) {
            fetchContributors();
        }
    }, [resourceId]);

    const fetchResource = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${resourceSlug}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setResourceId(data.resource.id);
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to load resource');
        }
    };

    const fetchContributors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/contributors`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                // Handle both array and object responses
                setContributors(Array.isArray(data) ? data : (data.contributors || []));
            }
        } catch (error) {
            console.error('Failed to fetch contributors:', error);
            toast.error('Failed to load contributors');
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/search?query=${encodeURIComponent(query)}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Failed to search users:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddContributor = async () => {
        if (!selectedUser || !newRole.trim()) {
            toast.error('Please select a user and provide a role');
            return;
        }

        setAdding(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/contributors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: selectedUser.id,
                    role: newRole,
                }),
            });

            if (response.ok) {
                toast.success('Contributor added successfully!');
                setSelectedUser(null);
                setNewRole('');
                setSearchQuery('');
                setSearchResults([]);
                fetchContributors();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to add contributor');
            }
        } catch (error) {
            console.error('Failed to add contributor:', error);
            toast.error('Failed to add contributor');
        } finally {
            setAdding(false);
        }
    };

    const handleUpdateRole = async (userId: string) => {
        if (!editRole.trim()) {
            toast.error('Please provide a role');
            return;
        }

        setUpdating(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/contributors/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: editRole }),
            });

            if (response.ok) {
                toast.success('Role updated successfully!');
                setEditingContributor(null);
                setEditRole('');
                fetchContributors();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update role');
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error('Failed to update role');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveContributor = async (userId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resourceId}/contributors/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Contributor removed successfully!');
                setDeletingContributor(null);
                fetchContributors();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to remove contributor');
            }
        } catch (error) {
            console.error('Failed to remove contributor:', error);
            toast.error('Failed to remove contributor');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Add Contributor Section */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-lg font-semibold mb-6 text-foreground">Add Contributor</h2>

                <div className="space-y-4">
                    {!selectedUser ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="search" className="font-nunito">Search Users</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            searchUsers(e.target.value);
                                        }}
                                        placeholder="Search by username..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {searching && (
                                <div className="text-sm text-muted-foreground font-nunito">Searching...</div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setSearchResults([]);
                                                setSearchQuery('');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                                        >
                                            {user.image ? (
                                                <img src={user.image} alt={user.username} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                    <Icon icon="mdi:account" width="24" height="24" />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <div className="font-nunito font-semibold text-foreground">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                {selectedUser.image ? (
                                    <img src={selectedUser.image} alt={selectedUser.username} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                        <Icon icon="mdi:account" width="24" height="24" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="font-nunito font-semibold text-foreground">{selectedUser.displayName}</div>
                                    <div className="text-sm text-muted-foreground">@{selectedUser.username}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    <Icon icon="mdi:close" width="20" height="20" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="font-nunito">Role</Label>
                                <Input
                                    id="role"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    placeholder="e.g., Developer, Artist, Tester"
                                />
                            </div>

                            <Button
                                onClick={handleAddContributor}
                                disabled={adding || !newRole.trim()}
                                className="w-full font-hebden"
                            >
                                {adding ? (
                                    <>
                                        <Icon icon="mdi:loading" width="20" height="20" className="animate-spin mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5 mr-2" />
                                        Add Contributor
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contributors List */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-lg font-semibold mb-6 text-foreground">Contributors ({contributors.length})</h2>

                {contributors.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="bg-secondary p-4 rounded-full mb-4 inline-block">
                            <Icon icon="mdi:account-group" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-nunito">No contributors yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contributors.map((contributor) => (
                            <div key={contributor.user.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                                {contributor.user.image ? (
                                    <img src={contributor.user.image} alt={contributor.user.username} className="w-12 h-12 rounded-full" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                        <Icon icon="mdi:account" width="28" height="28" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="font-nunito font-semibold text-foreground">{contributor.user.displayName}</div>
                                    <div className="text-sm text-muted-foreground">@{contributor.user.username}</div>
                                </div>

                                {editingContributor === contributor.user.id ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            placeholder="Role"
                                            className="w-40"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdateRole(contributor.user.id)}
                                            disabled={updating}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setEditingContributor(null);
                                                setEditRole('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-nunito font-semibold">
                                            {contributor.role}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingContributor(contributor.user.id);
                                                    setEditRole(contributor.role);
                                                }}
                                            >
                                                <Icon icon="mdi:pencil" width="18" height="18" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setDeletingContributor(contributor)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <OrbisConfirmDialog
                open={!!deletingContributor}
                onOpenChange={(open) => !open && setDeletingContributor(null)}
                title="Remove Contributor"
                description={`Are you sure you want to remove ${deletingContributor?.user.displayName} from this resource?`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={() => deletingContributor && handleRemoveContributor(deletingContributor.user.id)}
            />
        </div>
    );
}
