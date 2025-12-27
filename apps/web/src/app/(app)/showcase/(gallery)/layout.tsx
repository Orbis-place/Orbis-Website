import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Showcase - Community Gallery',
    description: 'Discover amazing creations from the Hytale community. Browse 3D models, screenshots, artwork, videos, tutorials, and more shared by talented creators.',
    keywords: [
        'Hytale',
        'Showcase',
        'Community Gallery',
        '3D Models',
        'Screenshots',
        'Artwork',
        'Fan Art',
        'Tutorials',
        'Devlogs',
    ],
    openGraph: {
        title: 'Showcase - Community Gallery',
        description: 'Discover amazing creations from the Hytale community. Browse 3D models, screenshots, artwork, videos, tutorials, and more.',
        type: 'website',
        url: '/showcase',
        siteName: 'Orbis',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Showcase - Community Gallery | Orbis',
        description: 'Discover amazing creations from the Hytale community. Browse 3D models, screenshots, artwork, videos, tutorials, and more.',
    },
};

export default function ShowcaseGalleryLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
