'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Resource {
    id: string;
    licenseType: string;
    customLicenseName?: string;
    licenseSpdxId?: string;
    licenseUrl?: string;
}

const LICENSE_TYPES = [
    { value: 'MIT', label: 'MIT License' },
    { value: 'APACHE_2_0', label: 'Apache License 2.0' },
    { value: 'GPL_3_0', label: 'GNU GPL v3.0' },
    { value: 'LGPL_3_0', label: 'GNU LGPL v3.0' },
    { value: 'BSD_3_CLAUSE', label: 'BSD 3-Clause' },
    { value: 'BSD_2_CLAUSE', label: 'BSD 2-Clause' },
    { value: 'MPL_2_0', label: 'Mozilla Public License 2.0' },
    { value: 'CC_BY_4_0', label: 'CC BY 4.0' },
    { value: 'CC_BY_SA_4_0', label: 'CC BY-SA 4.0' },
    { value: 'CC_BY_NC_4_0', label: 'CC BY-NC 4.0' },
    { value: 'CC_BY_NC_SA_4_0', label: 'CC BY-NC-SA 4.0' },
    { value: 'CC_BY_ND_4_0', label: 'CC BY-ND 4.0' },
    { value: 'CC_BY_NC_ND_4_0', label: 'CC BY-NC-ND 4.0' },
    { value: 'CC0_1_0', label: 'CC0 1.0 Universal' },
    { value: 'ALL_RIGHTS_RESERVED', label: 'All Rights Reserved' },
    { value: 'CUSTOM', label: 'Custom License' },
];

export default function ManageLicensePage() {
    const params = useParams();
    const resourceSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resource, setResource] = useState<Resource | null>(null);
    const [formData, setFormData] = useState({
        licenseType: 'MIT',
        customLicenseName: '',
        licenseSpdxId: '',
        licenseUrl: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchResource();
    }, [resourceSlug]);

    const fetchResource = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${resourceSlug}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                const res = data.resource as Resource;
                setResource(res);
                setFormData({
                    licenseType: res.licenseType,
                    customLicenseName: res.customLicenseName || '',
                    licenseSpdxId: res.licenseSpdxId || '',
                    licenseUrl: res.licenseUrl || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.licenseType === 'CUSTOM' && !formData.licenseUrl) {
            newErrors.licenseUrl = 'License URL is required for custom licenses';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !resource) {
            return;
        }

        setSaving(true);

        try {
            const updateData: any = {
                licenseType: formData.licenseType,
            };

            if (formData.licenseType === 'CUSTOM') {
                updateData.customLicenseName = formData.customLicenseName;
                updateData.licenseSpdxId = formData.licenseSpdxId;
                updateData.licenseUrl = formData.licenseUrl;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update license');
            }

            toast.success('License updated successfully!');
        } catch (error) {
            console.error('Failed to update license:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update license');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" width="48" height="48" className="text-[#109EB1] animate-spin" />
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-[#C7F4FA]">
                <p className="font-nunito text-lg mb-4">Resource not found</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="font-hebden text-xl font-semibold mb-6 text-[#C7F4FA]">License Configuration</h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="licenseType" className="font-nunito text-[#C7F4FA]">License Type *</Label>
                        <Select
                            value={formData.licenseType}
                            onValueChange={(value) => setFormData({ ...formData, licenseType: value })}
                        >
                            <SelectTrigger className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#032125] border-[#084B54] text-[#C7F4FA]">
                                {LICENSE_TYPES.map((license) => (
                                    <SelectItem key={license.value} value={license.value}>
                                        {license.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.licenseType === 'CUSTOM' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="customLicenseName" className="font-nunito text-[#C7F4FA]">Custom License Name</Label>
                                <Input
                                    id="customLicenseName"
                                    value={formData.customLicenseName}
                                    onChange={(e) => setFormData({ ...formData, customLicenseName: e.target.value })}
                                    placeholder="My Custom License"
                                    className="bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="licenseSpdxId" className="font-nunito text-[#C7F4FA]">SPDX Identifier (optional)</Label>
                                <Input
                                    id="licenseSpdxId"
                                    value={formData.licenseSpdxId}
                                    onChange={(e) => setFormData({ ...formData, licenseSpdxId: e.target.value })}
                                    placeholder="e.g., MIT, GPL-3.0"
                                    className="bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="licenseUrl" className="font-nunito text-[#C7F4FA]">License URL *</Label>
                                <Input
                                    id="licenseUrl"
                                    type="url"
                                    value={formData.licenseUrl}
                                    onChange={(e) => setFormData({ ...formData, licenseUrl: e.target.value })}
                                    placeholder="https://example.com/license"
                                    className={cn(
                                        "bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1]",
                                        errors.licenseUrl ? 'border-red-500' : ''
                                    )}
                                />
                                {errors.licenseUrl && <p className="text-sm text-red-500 font-nunito">{errors.licenseUrl}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-[#084B54]">
                <Button
                    type="submit"
                    disabled={saving}
                    className="font-hebden bg-[#109EB1] hover:bg-[#0D8A9A] text-[#C7F4FA]"
                >
                    {saving ? (
                        <>
                            <Icon icon="mdi:loading" width="20" height="20" className="animate-spin mr-2" />
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Icon icon="mdi:check" width="20" height="20" className="mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
