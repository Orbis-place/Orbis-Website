import { ReactNode } from 'react';
import { generateTeamMetadata } from '@/lib/metadata-helpers';

export async function generateMetadata({ params }: { params: Promise<{ teamName: string }> }) {
    const { teamName } = await params;
    return generateTeamMetadata(teamName);
}

export default function TeamMetadataLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
