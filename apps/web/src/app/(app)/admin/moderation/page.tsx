'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface PendingReport {
    id: string;
    resourceType: string;
    reason: string;
    status: string;
    createdAt: string;
    reporter: {
        username: string;
        image: string | null;
    };
}

interface PendingResourceVersion {
    id: string;
    versionNumber: string;
    channel: string;
    createdAt: string;
    isFirstVersion: boolean;
    resource: {
        id: string;
        name: string;
        slug: string;
        type: string;
        ownerUser: {
            username: string;
            image: string | null;
        } | null;
    };
}

interface PendingServer {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    ownerUser: {
        username: string;
        image: string | null;
    } | null;
}

export default function ModerationPage() {
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
    const [pendingVersions, setPendingVersions] = useState<PendingResourceVersion[]>([]);
    const [pendingServers, setPendingServers] = useState<PendingServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchAllPending();
    }, []);

    const fetchAllPending = async () => {
        try {
            const [reportsRes, versionsRes, serversRes] = await Promise.all([
                fetch(`${API_URL}/reports?status=PENDING,UNDER_REVIEW`, { credentials: 'include' }),
                fetch(`${API_URL}/admin/moderation/pending-resource-versions`, { credentials: 'include' }),
                fetch(`${API_URL}/servers/moderation/pending`, { credentials: 'include' }),
            ]);

            if (reportsRes.ok) {
                const data = await reportsRes.json();
                setPendingReports(data.data || data || []);
            }
            if (versionsRes.ok) {
                const data = await versionsRes.json();
                setPendingVersions(data || []);
            }
            if (serversRes.ok) {
                const data = await serversRes.json();
                setPendingServers(data.data || data || []);
            }
        } catch (err: any) {
            console.error('Failed to fetch pending items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveVersion = async (versionId: string) => {
        setActionLoading(versionId);
        try {
            const response = await fetch(`${API_URL}/admin/moderation/resource-versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'APPROVE' }),
            });

            if (!response.ok) throw new Error('Failed to approve version');
            await fetchAllPending();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectVersion = async (versionId: string) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        setActionLoading(versionId);
        try {
            const response = await fetch(`${API_URL}/admin/moderation/resource-versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'REJECT', reason }),
            });

            if (!response.ok) throw new Error('Failed to reject version');
            await fetchAllPending();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveServer = async (serverId: string) => {
        setActionLoading(serverId);
        try {
            const response = await fetch(`${API_URL}/servers/${serverId}/moderate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'APPROVE' }),
            });

            if (!response.ok) throw new Error('Failed to approve server');
            await fetchAllPending();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectServer = async (serverId: string) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        setActionLoading(serverId);
        try {
            const response = await fetch(`${API_URL}/servers/${serverId}/moderate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action: 'REJECT', reason }),
            });

            if (!response.ok) throw new Error('Failed to reject server');
            await fetchAllPending();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="font-hebden text-3xl font-bold text-foreground">Moderation Queue</h1>
                <div className="flex items-center justify-center py-12">
                    <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
                </div>
            </div>
        );
    }

    const totalPending = pendingReports.length + pendingVersions.length + pendingServers.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-hebden text-3xl font-bold text-foreground mb-2">Moderation Queue</h1>
                <p className="font-nunito text-muted-foreground">
                    Review and moderate pending submissions ({totalPending} total)
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:flag" width="24" height="24" className="text-orange-400" />
                        <div>
                            <p className="font-hebden text-2xl font-bold text-foreground">{pendingReports.length}</p>
                            <p className="font-nunito text-sm text-muted-foreground">Pending Reports</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:package-variant" width="24" height="24" className="text-green-400" />
                        <div>
                            <p className="font-hebden text-2xl font-bold text-foreground">{pendingVersions.length}</p>
                            <p className="font-nunito text-sm text-muted-foreground">Pending Versions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:server" width="24" height="24" className="text-purple-400" />
                        <div>
                            <p className="font-hebden text-2xl font-bold text-foreground">{pendingServers.length}</p>
                            <p className="font-nunito text-sm text-muted-foreground">Pending Servers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Reports */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-hebden text-xl font-semibold text-foreground">Pending Reports</h2>
                </div>
                {pendingReports.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon icon="mdi:check-circle" width="48" height="48" className="text-green-500 mx-auto mb-2" />
                        <p className="font-nunito text-muted-foreground">No pending reports</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingReports.slice(0, 5).map((report) => (
                            <div key={report.id} className="bg-accent rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {report.reporter.image ? (
                                        <img src={report.reporter.image} alt={report.reporter.username} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Icon icon="mdi:account" width="20" height="20" className="text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-hebden font-semibold text-foreground">{report.reporter.username}</p>
                                        <p className="font-nunito text-sm text-muted-foreground">
                                            {report.resourceType} • {report.reason} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Resource Versions */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold text-foreground mb-4">Pending Resource Versions</h2>
                {pendingVersions.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon icon="mdi:check-circle" width="48" height="48" className="text-green-500 mx-auto mb-2" />
                        <p className="font-nunito text-muted-foreground">No pending versions</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingVersions.map((version) => (
                            <div key={version.id} className="bg-accent rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Icon icon="mdi:package-variant" width="24" height="24" className="text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-hebden font-semibold text-foreground">{version.resource.name}</p>
                                            <span className="text-xs font-nunito text-muted-foreground">v{version.versionNumber}</span>
                                            {version.isFirstVersion && (
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                                                    NEW
                                                </span>
                                            )}
                                            {!version.isFirstVersion && (
                                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                                                    UPDATE
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-nunito text-sm text-muted-foreground">
                                            By {version.resource.ownerUser?.username || 'Unknown'} • {version.resource.type} • {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(`/resources/${version.resource.slug}`, '_blank')}
                                        className="font-nunito"
                                    >
                                        <Icon icon="mdi:eye" width="16" height="16" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApproveVersion(version.id)}
                                        disabled={actionLoading === version.id}
                                        className="font-nunito bg-green-600 hover:bg-green-700"
                                    >
                                        <Icon icon="mdi:check" width="16" height="16" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleRejectVersion(version.id)}
                                        disabled={actionLoading === version.id}
                                        className="font-nunito"
                                    >
                                        <Icon icon="mdi:close" width="16" height="16" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Servers */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold text-foreground mb-4">Pending Servers</h2>
                {pendingServers.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon icon="mdi:check-circle" width="48" height="48" className="text-green-500 mx-auto mb-2" />
                        <p className="font-nunito text-muted-foreground">No pending servers</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingServers.map((server) => (
                            <div key={server.id} className="bg-accent rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Icon icon="mdi:server" width="24" height="24" className="text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-hebden font-semibold text-foreground">{server.name}</p>
                                        <p className="font-nunito text-sm text-muted-foreground">
                                            By {server.ownerUser?.username || 'Unknown'} • {formatDistanceToNow(new Date(server.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(`/servers/${server.id}`, '_blank')}
                                        className="font-nunito"
                                    >
                                        <Icon icon="mdi:eye" width="16" height="16" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApproveServer(server.id)}
                                        disabled={actionLoading === server.id}
                                        className="font-nunito bg-green-600 hover:bg-green-700"
                                    >
                                        <Icon icon="mdi:check" width="16" height="16" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleRejectServer(server.id)}
                                        disabled={actionLoading === server.id}
                                        className="font-nunito"
                                    >
                                        <Icon icon="mdi:close" width="16" height="16" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
