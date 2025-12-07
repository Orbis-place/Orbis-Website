"use client";

import Image from 'next/image';
import { useResource } from '@/contexts/ResourceContext';

export default function GalleryPage() {
    const { resource } = useResource();

    if (!resource) return null;

    // Mock gallery images - will be replaced with real data from backend
    const gallery = [
    ] as string[];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gallery.map((image, i) => (
                <div key={i} className="relative aspect-video rounded-[25px] overflow-hidden border border-[#084B54] bg-[#06363D]">
                    <Image
                        src={image}
                        alt={`${resource.name} screenshot ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                </div>
            ))}
        </div>
    );
}
