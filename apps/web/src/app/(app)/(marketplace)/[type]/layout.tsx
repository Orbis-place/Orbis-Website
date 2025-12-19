import type { Metadata, ResolvingMetadata } from 'next';
import { RESOURCE_TYPES, type ResourceTypeKey } from '@/config/resource-types';
import MarketplaceLayoutClient from './MarketplaceLayoutClient';

type Props = {
    params: Promise<{ type: string }>;
    children: React.ReactNode;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { type } = await params;

    // Check if it's a valid resource type
    const typeConfig = RESOURCE_TYPES[type as ResourceTypeKey];

    if (!typeConfig) {
        return {
            title: 'Marketplace',
            description: 'Browse Hytale resources on Orbis.',
        };
    }

    return {
        title: typeConfig.label,
        description: `Browse and download ${typeConfig.label.toLowerCase()} for Hytale. ${typeConfig.description} created by the community on Orbis.`,
    };
}

export default function MarketplaceTypeLayout({ children }: { children: React.ReactNode }) {
    return <MarketplaceLayoutClient>{children}</MarketplaceLayoutClient>;
}
