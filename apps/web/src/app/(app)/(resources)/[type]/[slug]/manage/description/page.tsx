'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from '@/components/TiptapEditor';
import { toast } from 'sonner';

interface Resource {
    id: string;
    description?: string;
}

export default function ManageDescriptionPage() {
    const params = useParams();
    const resourceSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resource, setResource] = useState<Resource | null>(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

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
                setResource(data.resource);
                setDescription(data.resource.description || '');
            }
        } catch (error) {
            console.error('Failed to fetch resource:', error);
            toast.error('Failed to load resource');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resource) return;

        if (description.length < 50) {
            setError('Description must be at least 50 characters');
            return;
        }
        if (description.length > 50000) {
            setError('Description must be maximum 50,000 characters');
            return;
        }
        setError('');

        setSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/${resource.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    description,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update description');
            }

            toast.success('Description updated successfully!');
        } catch (error) {
            console.error('Failed to update description:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update description');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-[#109EB1] animate-spin" />
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
                <h2 className="font-hebden text-2xl font-semibold mb-2 text-[#C7F4FA]">Description</h2>
                <p className="text-sm text-[#C7F4FA]/50 font-nunito mb-6">
                    Write a detailed description of your resource. You can paste images directly!
                </p>

                <div className="space-y-2">
                    <TiptapEditor
                        content={description}
                        onChange={setDescription}
                        placeholder="Write a detailed description of your resource..."
                        minHeight="500px"
                        resourceId={resource.id}
                        className={error ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between text-sm font-nunito">
                        <span className={error ? 'text-red-500' : 'text-[#C7F4FA]/50'}>
                            {error || (description.length < 50 ? 'Minimum 50 characters' : '')}
                        </span>
                        <span className="text-[#C7F4FA]/50">
                            {description.length} / 50,000 characters
                        </span>
                    </div>
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
                            <Icon ssr={true} icon="mdi:loading" width="20" height="20" className="animate-spin mr-2" />
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Icon ssr={true} icon="mdi:check" width="20" height="20" className="mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
