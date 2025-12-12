'use client';

import { useParams } from 'next/navigation';
import { GalleryManagement } from '@/components/resources/GalleryManagement';
import { useState, useEffect } from 'react';

export default function GalleryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [resourceId, setResourceId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResourceId = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resources/slug/${slug}`,
                    {
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setResourceId(data.resource.id);
                }
            } catch (error) {
                console.error('Failed to fetch resource:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchResourceId();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!resourceId) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground font-nunito">Resource not found</p>
            </div>
        );
    }

    return <GalleryManagement resourceId={resourceId} />;
}
