'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/TiptapEditor';
import { useServer } from '@/contexts/ServerContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ServerDescriptionPage() {
    const router = useRouter();
    const { server: contextServer, isLoading: contextLoading, isOwner } = useServer();

    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(contextLoading);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (contextServer) {
            setDescription(contextServer.description || '');
        }
    }, [contextServer]);

    useEffect(() => {
        setLoading(contextLoading);
    }, [contextLoading]);

    const handleSave = async () => {
        if (!contextServer?.id) return;

        try {
            setIsSaving(true);
            const response = await fetch(`${API_URL}/servers/${contextServer.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                throw new Error('Failed to update server description');
            }

            toast.success('Description updated successfully!');
        } catch (error) {
            console.error('Error updating description:', error);
            toast.error('Failed to update description');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    if (!contextServer) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Icon icon="mdi:server-off" width="48" height="48" className="text-muted-foreground" />
                <p className="text-foreground font-nunito text-lg mt-4">Server not found</p>
                <Button onClick={() => router.push('/dashboard/servers')} className="mt-4 font-hebden">
                    Back to Servers
                </Button>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Icon icon="mdi:lock" width="48" height="48" className="text-muted-foreground" />
                <p className="text-foreground font-nunito text-lg mt-4">You don't have permission to edit this server</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-hebden text-foreground">Description</h1>
                    <p className="text-sm text-muted-foreground font-nunito mt-1">
                        Write a detailed description for your server. You can use rich text formatting and add images.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    className="font-hebden"
                    disabled={isSaving}
                >
                    {isSaving && <Icon icon="mdi:loading" className="animate-spin" width="20" height="20" />}
                    {!isSaving && <Icon icon="mdi:content-save" width="20" height="20" />}
                    Save Changes
                </Button>
            </div>

            {/* Editor */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <Label htmlFor="description" className="mb-3 block">Server Description</Label>
                <TiptapEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Write a detailed description of your server..."
                    minHeight="500px"
                    serverId={contextServer.id}
                />
            </div>
        </div>
    );
}
