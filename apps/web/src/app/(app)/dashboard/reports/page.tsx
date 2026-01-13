'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { formatDistanceToNow } from 'date-fns';
import { OrbisDialog, OrbisConfirmDialog } from '@/components/OrbisDialog';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Report {
    id: string;
    resourceType: 'USER' | 'SERVER' | 'RESOURCE';
    resourceId: string;
    reason: string;
    description: string | null;
    status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
    createdAt: string;
    updatedAt: string;
    handledAt: string | null;
    response: string | null;
}

const reasonLabels: Record<string, string> = {
    SPAM: 'Spam or Advertising',
    REUPLOADED_WORK: 'Reuploaded Work',
    INAPPROPRIATE: 'Inappropriate Content',
    MALICIOUS: 'Malicious Content',
    NAME_SQUATTING: 'Name Squatting',
    POOR_DESCRIPTION: 'Poor Description',
    INVALID_METADATA: 'Invalid Metadata',
    OTHER: 'Other',
};

export default function MyReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [cancelingId, setCancelingId] = useState<string | null>(null);
    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch(`${API_URL}/reports/me`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }

            const data = await response.json();
            setReports(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReport = async () => {
        if (!confirmCancelId) return;
        setCancelingId(confirmCancelId);

        try {
            const response = await fetch(`${API_URL}/reports/${confirmCancelId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel report');
            }

            setReports((prev) => prev.filter((r) => r.id !== confirmCancelId));
            setConfirmCancelId(null);
        } catch (err: any) {
            alert(err.message || 'Failed to cancel report');
        } finally {
            setCancelingId(null);
        }
    };

    const getStatusIcon = (status: Report['status']) => {
        switch (status) {
            case 'PENDING': return 'mdi:clock-outline';
            case 'UNDER_REVIEW': return 'mdi:eye-outline';
            case 'RESOLVED': return 'mdi:check-circle';
            case 'DISMISSED': return 'mdi:close-circle';
        }
    };

    const getStatusColor = (status: Report['status']) => {
        switch (status) {
            case 'PENDING': return 'text-[#f59e0b]';
            case 'UNDER_REVIEW': return 'text-[#3b82f6]';
            case 'RESOLVED': return 'text-[#10b981]';
            case 'DISMISSED': return 'text-[#6b7280]';
        }
    };

    const getResourceTypeIcon = (type: Report['resourceType']) => {
        switch (type) {
            case 'USER': return 'mdi:account';
            case 'SERVER': return 'mdi:server';
            case 'RESOURCE': return 'mdi:package-variant';
        }
    };

    // Group reports by status
    const pendingReports = reports.filter(r => r.status === 'PENDING');
    const underReviewReports = reports.filter(r => r.status === 'UNDER_REVIEW');
    const resolvedReports = reports.filter(r => r.status === 'RESOLVED');
    const dismissedReports = reports.filter(r => r.status === 'DISMISSED');

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="font-hebden text-3xl font-bold text-foreground">My Reports</h1>
                <div className="flex items-center justify-center py-12">
                    <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="font-hebden text-3xl font-bold text-foreground">My Reports</h1>
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
                    <p className="text-destructive font-nunito">{error}</p>
                </div>
            </div>
        );
    }

    const ReportCard = ({ report }: { report: Report }) => {
        const isPending = report.status === 'PENDING';

        return (
            <div className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Icon ssr={true} icon={getResourceTypeIcon(report.resourceType)}
                                width="20"
                                height="20"
                                className="text-primary"
                            />
                            <span className="font-hebden text-sm font-semibold text-foreground">
                                {report.resourceType}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-nunito text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </span>
                        </div>

                        {/* Reason */}
                        <h3 className="font-hebden text-base font-semibold text-foreground mb-1">
                            {reasonLabels[report.reason] || report.reason}
                        </h3>

                        {/* Description Preview */}
                        {report.description && (
                            <p className="font-nunito text-sm text-foreground/70 line-clamp-2 mb-3">
                                {report.description}
                            </p>
                        )}

                        {/* Moderator Response */}
                        {report.response && (
                            <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="font-nunito text-xs font-semibold text-foreground/70 mb-1 flex items-center gap-1">
                                    <Icon ssr={true} icon="mdi:message-reply" width="14" height="14" />
                                    Moderator Response
                                </p>
                                <p className="font-nunito text-sm text-foreground/80 line-clamp-2">
                                    {report.response}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                            className="font-nunito text-sm"
                        >
                            <Icon ssr={true} icon="mdi:eye" width="16" height="16" />
                            View
                        </Button>
                        {isPending && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setConfirmCancelId(report.id)}
                                disabled={cancelingId === report.id}
                                className="font-nunito text-sm"
                            >
                                <Icon ssr={true} icon="mdi:delete" width="16" height="16" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const StatusSection = ({
        title,
        reports,
        icon,
        color
    }: {
        title: string;
        reports: Report[];
        icon: string;
        color: string;
    }) => {
        if (reports.length === 0) return null;

        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Icon ssr={true} icon={icon} width="20" height="20" className={color} />
                    <h2 className="font-hebden text-lg font-semibold text-foreground">
                        {title}
                    </h2>
                    <span className="font-nunito text-sm text-muted-foreground">
                        ({reports.length})
                    </span>
                </div>
                <div className="space-y-2">
                    {reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-hebden text-3xl font-bold text-foreground mb-2">My Reports</h1>
                    <p className="font-nunito text-muted-foreground">
                        Track and manage your submitted reports
                    </p>
                </div>

                {/* Reports List */}
                <div className="bg-secondary/30 rounded-lg p-6">
                    {reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="p-4 bg-accent rounded-full mb-4">
                                <Icon ssr={true} icon="mdi:flag" width="48" height="48" className="text-muted-foreground" />
                            </div>
                            <p className="text-foreground font-nunito text-lg mb-2">No Reports Yet</p>
                            <p className="text-muted-foreground font-nunito text-sm text-center max-w-md">
                                You haven't submitted any reports. When you report users, servers, or resources for violating community guidelines, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <StatusSection
                                title="Pending"
                                reports={pendingReports}
                                icon="mdi:clock-outline"
                                color="text-[#f59e0b]"
                            />
                            <StatusSection
                                title="Under Review"
                                reports={underReviewReports}
                                icon="mdi:eye-outline"
                                color="text-[#3b82f6]"
                            />
                            <StatusSection
                                title="Resolved"
                                reports={resolvedReports}
                                icon="mdi:check-circle"
                                color="text-[#10b981]"
                            />
                            <StatusSection
                                title="Dismissed"
                                reports={dismissedReports}
                                icon="mdi:close-circle"
                                color="text-[#6b7280]"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Details Dialog */}
            <OrbisDialog
                open={!!selectedReport}
                onOpenChange={(open) => !open && setSelectedReport(null)}
                title="Report Details"
                size="lg"
            >
                {selectedReport && (
                    <div className="space-y-4">
                        {/* Status & Type */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full">
                                <Icon ssr={true} icon={getResourceTypeIcon(selectedReport.resourceType)} width="16" height="16" className="text-primary" />
                                <span className="font-hebden text-sm font-semibold text-primary">
                                    {selectedReport.resourceType}
                                </span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedReport.status === 'PENDING' ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/30' :
                                    selectedReport.status === 'UNDER_REVIEW' ? 'bg-[#3b82f6]/10 border border-[#3b82f6]/30' :
                                        selectedReport.status === 'RESOLVED' ? 'bg-[#10b981]/10 border border-[#10b981]/30' :
                                            'bg-[#6b7280]/10 border border-[#6b7280]/30'
                                }`}>
                                <Icon ssr={true} icon={getStatusIcon(selectedReport.status)} width="16" height="16" className={getStatusColor(selectedReport.status)} />
                                <span className={`font-hebden text-sm font-semibold ${getStatusColor(selectedReport.status)}`}>
                                    {selectedReport.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <p className="font-nunito text-xs font-semibold text-muted-foreground mb-1">Reason</p>
                            <p className="font-hebden text-lg font-semibold text-foreground">
                                {reasonLabels[selectedReport.reason] || selectedReport.reason}
                            </p>
                        </div>

                        {/* Description */}
                        {selectedReport.description && (
                            <div>
                                <p className="font-nunito text-xs font-semibold text-muted-foreground mb-2">Description</p>
                                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                                    <p className="font-nunito text-sm text-foreground/90 whitespace-pre-wrap">
                                        {selectedReport.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Moderator Response */}
                        {selectedReport.response && (
                            <div>
                                <p className="font-nunito text-xs font-semibold text-muted-foreground mb-2">Moderator Response</p>
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                    <p className="font-nunito text-sm text-foreground/90 whitespace-pre-wrap">
                                        {selectedReport.response}
                                    </p>
                                    {selectedReport.handledAt && (
                                        <p className="font-nunito text-xs text-muted-foreground mt-3">
                                            Handled {formatDistanceToNow(new Date(selectedReport.handledAt), { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="pt-4 border-t border-border/30">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-nunito text-xs text-muted-foreground mb-1">Submitted</p>
                                    <p className="font-nunito text-sm text-foreground/80">
                                        {formatDistanceToNow(new Date(selectedReport.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-nunito text-xs text-muted-foreground mb-1">Resource ID</p>
                                    <p className="font-mono text-xs text-foreground/60 break-all">
                                        {selectedReport.resourceId.slice(0, 12)}...
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cancel Button in Dialog */}
                        {selectedReport.status === 'PENDING' && (
                            <div className="pt-4 border-t border-border/30">
                                <Button
                                    variant="destructive"
                                    className="w-full font-hebden"
                                    onClick={() => {
                                        setConfirmCancelId(selectedReport.id);
                                        setSelectedReport(null);
                                    }}
                                >
                                    <Icon ssr={true} icon="mdi:delete" width="18" height="18" />
                                    Cancel This Report
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </OrbisDialog>

            {/* Confirm Cancel Dialog */}
            <OrbisConfirmDialog
                open={!!confirmCancelId}
                onOpenChange={(open) => !open && setConfirmCancelId(null)}
                title="Cancel Report?"
                description="Are you sure you want to cancel this report? This action cannot be undone."
                confirmText="Cancel Report"
                cancelText="Keep Report"
                variant="destructive"
                confirmLoading={!!cancelingId}
                onConfirm={handleCancelReport}
                onCancel={() => setConfirmCancelId(null)}
            />
        </>
    );
}
