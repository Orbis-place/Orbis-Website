import { ReactNode } from 'react';
import { generateShowcaseMetadata } from '@/lib/metadata-helpers';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return generateShowcaseMetadata(id);
}

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
