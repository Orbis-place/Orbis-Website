'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    getPublicCollection,
    type Resource,
} from '@/lib/api/resources';
import { EntityAvatar } from '@/components/EntityAvatar';

interface CollectionItem {
    addedAt: string;
    resource: Resource;
}

interface CollectionData {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isPublic: boolean;
    itemCount: number;
    user?: {
        username: string;
        image?: string | null;
    };
}

const ITEMS_PER_PAGE = 12;

export default function PublicCollectionViewPage() {
    const params = useParams();
    const router = useRouter();
    const collectionId = params.id as string; // Look for 'id' param

    const [collection, setCollection] = useState<CollectionData | null>(null);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (collectionId) {
            loadCollection();
        }
    }, [collectionId]);

    const loadCollection = async () => {
        setLoading(true);
        try {
            const data = await getPublicCollection(collectionId) as any;
            setCollection({
                id: data.id,
                name: data.name,
                description: data.description,
                isDefault: data.isDefault,
                isPublic: data.isPublic,
                itemCount: data.itemCount,
                user: data.user
            });
            setItems(data.items);
        } catch (error) {
            console.error('Failed to load collection:', error);
        } finally {
            setLoading(false);
        }
    };

    const getResourceTypeSlug = (type: string) => {
        return type.toLowerCase().replace('_', '-');
    };

    // Filter items by search
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        return items.filter((item) =>
            item.resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.resource.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    // Paginated items
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="container max-w-7xl mx-auto space-y-6 py-8 px-4" >
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <Icon icon="mdi:arrow-left" width="20" height="20" />
                        Back
                    </Button>
                </div>
                <div className="flex items-center justify-center py-16">
                    <Icon icon="mdi:loading" width="40" height="40" className="animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="container max-w-7xl mx-auto space-y-6 py-8 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <Icon icon="mdi:arrow-left" width="20" height="20" />
                        Back
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center py-16">
                    <Icon icon="mdi:folder-off" width="48" height="48" className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Collection not found or is private (ID: {collectionId})</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto space-y-6 py-8 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                {collection.user && (
                    <Link href={`/user/${collection.user.username}/collections`}>
                        <Button variant="ghost">
                            <Icon icon="mdi:arrow-left" width="20" height="20" className="mr-2" />
                            See more from {collection.user.username}
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon
                            icon="mdi:folder-star"
                            width="32"
                            height="32"
                            className="text-primary"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-hebden text-3xl font-bold text-foreground">{collection.name}</h1>
                        </div>
                        {collection.description && (
                            <p className="text-muted-foreground mt-1 font-nunito">{collection.description}</p>
                        )}
                        {collection.user && (
                            <div className="flex items-center gap-2 mt-2">
                                <EntityAvatar
                                    src={collection.user.image || ''}
                                    name={collection.user.username}
                                    className="w-5 h-5 rounded-full"
                                />
                                <span className="text-sm text-foreground/60 font-nunito">by {collection.user.username}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm font-nunito text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
            </div>

            {/* Search */}
            {items.length > 0 && (
                <div className="relative max-w-sm">
                    <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="18" height="18" />
                    <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10"
                    />
                </div>
            )}

            {/* Items Grid */}
            <div className="bg-secondary/30 rounded-lg p-6">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Icon icon="mdi:package-variant-closed" width="48" height="48" className="text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            {searchQuery ? 'No resources match your search' : 'No resources in this collection'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedItems.map((item) => (
                                <div
                                    key={item.resource.id}
                                    className="flex items-start gap-4 p-4 bg-accent border border-border rounded-lg hover:border-primary transition-colors group"
                                >
                                    <EntityAvatar
                                        src={item.resource.iconUrl || ''}
                                        name={item.resource.name}
                                        variant="resource"
                                        className="w-14 h-14 rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/${getResourceTypeSlug(item.resource.type)}/${item.resource.slug}`}
                                            className="font-hebden font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                                        >
                                            {item.resource.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {item.resource.tagline}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:download" width="14" height="14" />
                                                {item.resource.downloadCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:heart" width="14" height="14" />
                                                {item.resource.likeCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <Icon icon="mdi:chevron-left" width="18" height="18" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <Icon icon="mdi:chevron-right" width="18" height="18" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
