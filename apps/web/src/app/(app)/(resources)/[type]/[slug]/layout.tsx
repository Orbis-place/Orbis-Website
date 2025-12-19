import { ReactNode } from 'react';
import { ResourceProvider } from '@/contexts/ResourceContext';
import { generateResourceMetadata } from '@/lib/metadata-helpers';
import { getResourceType, getResourceTypeBySingular } from '@/config/resource-types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; type: string }> }) {
    const { slug, type } = await params;
    const resourceType = getResourceType(type) || getResourceTypeBySingular(type);
    return generateResourceMetadata(slug, type, resourceType?.labelSingular || 'Resource');
}

export default function ResourceProviderLayout({ children }: { children: ReactNode }) {
    return (
        <ResourceProvider>
            {children}
        </ResourceProvider>
    );
}
