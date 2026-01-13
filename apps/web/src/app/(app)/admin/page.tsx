'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Stats {
    users: {
        total: number;
        active: number;
        new: number;
    };
    resources: {
        total: number;
        pending: number;
    };
    servers: {
        total: number;
        pending: number;
    };
    reports: {
        total: number;
        pending: number;
    };
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/stats`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const data = await response.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="font-hebden text-3xl font-bold text-foreground">Admin Overview</h1>
                <div className="flex items-center justify-center py-12">
                    <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="space-y-4">
                <h1 className="font-hebden text-3xl font-bold text-foreground">Admin Overview</h1>
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
                    <p className="text-destructive font-nunito">{error || 'Failed to load statistics'}</p>
                </div>
            </div>
        );
    }

    const StatCard = ({
        title,
        value,
        subtitle,
        icon,
        color,
        link,
    }: {
        title: string;
        value: number;
        subtitle?: string;
        icon: string;
        color: string;
        link?: string;
    }) => {
        const content = (
            <div className={`bg-gradient-to-br ${color} rounded-lg p-6 transition-transform hover:scale-105`}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-nunito text-sm font-medium text-white/80 mb-1">{title}</p>
                        <p className="font-hebden text-4xl font-bold text-white">{value.toLocaleString()}</p>
                        {subtitle && (
                            <p className="font-nunito text-xs text-white/70 mt-2">{subtitle}</p>
                        )}
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                        <Icon ssr={true} icon={icon} width="32" height="32" className="text-white" />
                    </div>
                </div>
            </div>
        );

        return link ? <Link href={link}>{content}</Link> : content;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-hebden text-3xl font-bold text-foreground mb-2">Admin Overview</h1>
                <p className="font-nunito text-muted-foreground">
                    Platform statistics and moderation overview
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    subtitle={`${stats.users.new} new in last 30 days`}
                    icon="mdi:account-group"
                    color="from-blue-500 to-blue-600"
                    link="/admin/users"
                />
                <StatCard
                    title="Total Resources"
                    value={stats.resources.total}
                    subtitle={stats.resources.pending > 0 ? `${stats.resources.pending} pending approval` : 'All approved'}
                    icon="mdi:package-variant"
                    color="from-green-500 to-green-600"
                    link="/admin/moderation"
                />
                <StatCard
                    title="Total Servers"
                    value={stats.servers.total}
                    subtitle={stats.servers.pending > 0 ? `${stats.servers.pending} pending approval` : 'All approved'}
                    icon="mdi:server"
                    color="from-purple-500 to-purple-600"
                    link="/admin/servers"
                />
                <StatCard
                    title="Active Reports"
                    value={stats.reports.pending}
                    subtitle={`${stats.reports.total} total reports`}
                    icon="mdi:flag"
                    color="from-orange-500 to-orange-600"
                    link="/admin/moderation"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/70 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:account-supervisor" width="24" height="24" className="text-primary" />
                        <div>
                            <p className="font-hebden font-semibold text-foreground">Manage Users</p>
                            <p className="font-nunito text-xs text-muted-foreground">View and manage all users</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/moderation"
                        className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/70 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:shield-check" width="24" height="24" className="text-primary" />
                        <div>
                            <p className="font-hebden font-semibold text-foreground">Moderation Queue</p>
                            <p className="font-nunito text-xs text-muted-foreground">Review pending content</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/servers"
                        className="flex items-center gap-3 p-4 bg-accent rounded-lg hover:bg-accent/70 transition-colors"
                    >
                        <Icon ssr={true} icon="mdi:server-security" width="24" height="24" className="text-primary" />
                        <div>
                            <p className="font-hebden font-semibold text-foreground">Server Approval</p>
                            <p className="font-nunito text-xs text-muted-foreground">Approve pending servers</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
