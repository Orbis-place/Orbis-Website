'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { OrbisFormDialog } from '@/components/OrbisDialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export enum ReportReason {
    SPAM = 'SPAM',
    REUPLOADED_WORK = 'REUPLOADED_WORK',
    INAPPROPRIATE = 'INAPPROPRIATE',
    MALICIOUS = 'MALICIOUS',
    NAME_SQUATTING = 'NAME_SQUATTING',
    POOR_DESCRIPTION = 'POOR_DESCRIPTION',
    INVALID_METADATA = 'INVALID_METADATA',
    OTHER = 'OTHER',
}

const reasonLabels: Record<ReportReason, string> = {
    [ReportReason.SPAM]: 'Spam or Advertising',
    [ReportReason.REUPLOADED_WORK]: 'Reuploaded Work',
    [ReportReason.INAPPROPRIATE]: 'Inappropriate Content',
    [ReportReason.MALICIOUS]: 'Malicious Content',
    [ReportReason.NAME_SQUATTING]: 'Name Squatting',
    [ReportReason.POOR_DESCRIPTION]: 'Poor Description',
    [ReportReason.INVALID_METADATA]: 'Invalid Metadata',
    [ReportReason.OTHER]: 'Other',
};

interface ReportResourceDialogProps {
    resourceId: string;
    resourceName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReportResourceDialog({ resourceId, resourceName, open, onOpenChange }: ReportResourceDialogProps) {
    const [reason, setReason] = useState<ReportReason | ''>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        if (!reason) {
            setError('Please select a reason');
            return;
        }

        if (reason === ReportReason.OTHER && !description.trim()) {
            setError('Description is required when reason is "Other"');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/reports/resources/${resourceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    reason,
                    description: description.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit report');
            }

            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                // Reset form
                setReason('');
                setDescription('');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!isSubmitting && !success) {
            onOpenChange(newOpen);
            if (!newOpen) {
                // Reset form when closing
                setReason('');
                setDescription('');
                setError(null);
            }
        }
    };

    const handleCancel = () => {
        if (!isSubmitting && !success) {
            handleOpenChange(false);
        }
    };

    return (
        <OrbisFormDialog
            open={open}
            onOpenChange={handleOpenChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitText={isSubmitting ? 'Submitting...' : 'Submit Report'}
            submitLoading={isSubmitting}
            title="Report Resource"
            description={`Report "${resourceName}" for violating community guidelines.`}
            size="lg"
        >
            {success ? (
                <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="font-hebden text-xl font-bold text-foreground mb-2">
                        Report Submitted
                    </h3>
                    <p className="font-nunito text-sm text-foreground/60">
                        Thank you for helping keep our community safe.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="font-hebden text-foreground">
                            Reason <span className="text-destructive">*</span>
                        </Label>
                        <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
                            <SelectTrigger className="bg-secondary border-border font-nunito">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent className="bg-accent border-border">
                                {Object.entries(reasonLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value} className="font-nunito">
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-hebden text-foreground">
                            Additional Details {reason === ReportReason.OTHER && <span className="text-destructive">*</span>}
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={reason === ReportReason.OTHER
                                ? "Please provide details about your report..."
                                : "Provide any additional context (optional)..."
                            }
                            className="bg-secondary border-border font-nunito min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-foreground/40 font-nunito">
                            {description.length}/500 characters
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                            <p className="text-sm text-destructive font-nunito">{error}</p>
                        </div>
                    )}
                </div>
            )}
        </OrbisFormDialog>
    );
}
