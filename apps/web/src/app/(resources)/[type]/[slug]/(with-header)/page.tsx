"use client";

import ResourceContent from '@/components/marketplace/ResourceContent';
import { useResource } from '@/contexts/ResourceContext';

export default function ResourceDetailPage() {
    const { resource } = useResource();

    if (!resource) return null;

    return <ResourceContent content={resource.description || 'No description available.'} />;
}
