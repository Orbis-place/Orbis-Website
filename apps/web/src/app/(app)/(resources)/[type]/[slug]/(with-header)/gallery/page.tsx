"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useResource } from '@/contexts/ResourceContext';
import { fetchGalleryImages, type GalleryImage } from '@/lib/api/resources';
import { Icon } from '@iconify-icon/react';
import { X } from 'lucide-react';

export default function GalleryPage() {
    const { resource } = useResource();
    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    useEffect(() => {
        if (!resource) return;

        const loadGallery = async () => {
            try {
                setLoading(true);
                const data = await fetchGalleryImages(resource.id);
                setGallery(data.galleryImages);
            } catch (error) {
                console.error('Failed to load gallery:', error);
            } finally {
                setLoading(false);
            }
        };

        loadGallery();
    }, [resource]);

    const openLightbox = (image: GalleryImage, index: number) => {
        setSelectedImage(image);
        setSelectedIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = () => {
        const nextIdx = selectedIndex + 1;
        if (nextIdx < gallery.length) {
            setSelectedIndex(nextIdx);
            setSelectedImage(gallery[nextIdx] || null);
        }
    };

    const prevImage = () => {
        const prevIdx = selectedIndex - 1;
        if (prevIdx >= 0) {
            setSelectedIndex(prevIdx);
            setSelectedImage(gallery[prevIdx] || null);
        }
    };

    if (!resource) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Icon icon="mdi:loading" width="48" height="48" className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div>
                {gallery.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-24 h-24 rounded-full bg-[#06363D] border-2 border-[#084B54] flex items-center justify-center mb-6">
                            <svg
                                className="w-12 h-12 text-[#C7F4FA]/30"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-2">
                            No Images Yet
                        </h3>
                        <p className="font-nunito text-sm text-[#C7F4FA]/60 max-w-md">
                            This resource doesn't have any gallery images at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gallery.map((image, i) => (
                            <div
                                key={image.id}
                                className="group bg-secondary/30 rounded-[25px] overflow-hidden border border-[#084B54] cursor-pointer transition-all hover:border-primary/50"
                                onClick={() => openLightbox(image, i)}
                            >
                                {/* Image */}
                                <div className="relative aspect-video bg-[#06363D]">
                                    <Image
                                        src={image.url}
                                        alt={image.title || image.caption || `${resource.name} image ${i + 1}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Hover overlay effect */}
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Info section - always visible */}
                                <div className="p-4 space-y-2">
                                    {image.title && (
                                        <h4 className="font-hebden text-foreground font-semibold text-sm line-clamp-1">
                                            {image.title}
                                        </h4>
                                    )}
                                    {image.caption && (
                                        <p className="font-nunito text-muted-foreground text-xs line-clamp-2">
                                            {image.caption}
                                        </p>
                                    )}
                                    <p className="font-nunito text-muted-foreground/60 text-xs">
                                        {new Date(image.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                    style={{ isolation: 'isolate' }}
                >
                    {/* Close button - top right */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-[#06363D] border border-[#084B54] hover:border-primary transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-[#C7F4FA]" />
                    </button>

                    {/* Centered content */}
                    <div
                        className="max-w-6xl w-full mx-4 flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image - Fixed height container */}
                        <div className="w-full h-[60vh] mb-4 rounded-[25px] overflow-hidden bg-[#06363D] border-2 border-[#084B54] flex items-center justify-center">
                            <Image
                                src={selectedImage.url}
                                alt={selectedImage.title || selectedImage.caption || 'Gallery image'}
                                width={1920}
                                height={1080}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Controls and info - centered below image */}
                        <div className="w-full max-w-2xl bg-[#06363D] border-2 border-[#084B54] rounded-[25px] p-6 space-y-4">
                            {/* Navigation controls */}
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    disabled={selectedIndex === 0}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/30 border border-[#084B54] hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Icon icon="mdi:chevron-left" width="24" height="24" className="text-[#C7F4FA]" />
                                </button>

                                <div className="px-6 py-2 bg-secondary/30 rounded-full border border-[#084B54]">
                                    <p className="font-hebden text-[#C7F4FA] font-semibold text-sm">
                                        {selectedIndex + 1} / {gallery.length}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    disabled={selectedIndex === gallery.length - 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/30 border border-[#084B54] hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Icon icon="mdi:chevron-right" width="24" height="24" className="text-[#C7F4FA]" />
                                </button>
                            </div>

                            {/* Image info */}
                            {(selectedImage.title || selectedImage.caption || selectedImage.description) && (
                                <div className="space-y-3 border-t border-[#084B54] pt-4">
                                    {selectedImage.title && (
                                        <h3 className="font-hebden text-xl font-bold text-[#C7F4FA]">
                                            {selectedImage.title}
                                        </h3>
                                    )}
                                    {selectedImage.caption && (
                                        <p className="font-nunito text-[#C7F4FA]/80">
                                            {selectedImage.caption}
                                        </p>
                                    )}
                                    {selectedImage.description && (
                                        <p className="font-nunito text-sm text-[#C7F4FA]/60">
                                            {selectedImage.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Date */}
                            <div className="border-t border-[#084B54] pt-3">
                                <p className="font-nunito text-xs text-[#C7F4FA]/40">
                                    {new Date(selectedImage.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
