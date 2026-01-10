'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Bookmark, Plus, Check, FolderPlus, Search, Loader2 } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
    getUserCollections,
    getResourceCollections,
    addResourceToCollection,
    removeResourceFromCollection,
    createCollection,
    saveResourceToDefault,
    type UserCollection,
} from '@/lib/api/resources';
import { toast } from 'sonner';

interface SaveToCollectionPopoverProps {
    resourceId: string;
    isLoggedIn?: boolean;
    onLoginRequired?: () => void;
}

export function SaveToCollectionPopover({
    resourceId,
    isLoggedIn = false,
    onLoginRequired,
}: SaveToCollectionPopoverProps) {
    const [open, setOpen] = useState(false);
    const [collections, setCollections] = useState<UserCollection[]>([]);
    const [savedInCollections, setSavedInCollections] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [savingCollectionId, setSavingCollectionId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if resource is saved in any collection
    const isSaved = savedInCollections.size > 0;

    // Load collections when popover opens
    useEffect(() => {
        if (open && isLoggedIn) {
            loadCollections();
        }
    }, [open, isLoggedIn]);

    const loadCollections = async () => {
        setLoading(true);
        try {
            const [allCollections, resourceCollections] = await Promise.all([
                getUserCollections(),
                getResourceCollections(resourceId),
            ]);

            setCollections(allCollections.collections);
            setSavedInCollections(new Set(resourceCollections.collections.map((c) => c.id)));
        } catch (error) {
            console.error('Failed to load collections:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSave = async () => {
        if (!isLoggedIn) {
            onLoginRequired?.();
            return;
        }

        try {
            const result = await saveResourceToDefault(resourceId);
            if (result.added) {
                setSavedInCollections((prev) => new Set(prev).add(result.collectionId));
                toast.success('Saved to your collection');
            } else {
                toast.info('Already saved');
            }
        } catch (error) {
            console.error('Failed to save:', error);
            toast.error('Failed to save resource');
        }
    };

    const handleToggleCollection = async (collection: UserCollection) => {
        setSavingCollectionId(collection.id);
        try {
            if (savedInCollections.has(collection.id)) {
                await removeResourceFromCollection(collection.id, resourceId);
                setSavedInCollections((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(collection.id);
                    return newSet;
                });
                toast.success(`Removed from "${collection.name}"`);
            } else {
                await addResourceToCollection(collection.id, resourceId);
                setSavedInCollections((prev) => new Set(prev).add(collection.id));
                toast.success(`Added to "${collection.name}"`);
            }
        } catch (error) {
            console.error('Failed to update collection:', error);
            toast.error('Failed to update collection');
        } finally {
            setSavingCollectionId(null);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;

        setIsCreating(true);
        try {
            const newCollection = await createCollection(newCollectionName.trim());
            // Add resource to the new collection
            await addResourceToCollection(newCollection.id, resourceId);

            // Update state
            setCollections((prev) => [newCollection, ...prev]);
            setSavedInCollections((prev) => new Set(prev).add(newCollection.id));
            setNewCollectionName('');
            toast.success(`Created "${newCollection.name}" and added resource`);
        } catch (error: any) {
            console.error('Failed to create collection:', error);
            toast.error(error.message || 'Failed to create collection');
        } finally {
            setIsCreating(false);
        }
    };

    // Filter collections by search query
    const filteredCollections = collections.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort to show default first, then by whether resource is in it
    const sortedCollections = filteredCollections.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        const aHas = savedInCollections.has(a.id);
        const bHas = savedInCollections.has(b.id);
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return 0;
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    onClick={(e) => {
                        if (!isLoggedIn) {
                            e.preventDefault();
                            onLoginRequired?.();
                            return;
                        }
                    }}
                    className={`group flex items-center justify-center w-12 h-12 border rounded-full transition-all duration-200 ${isSaved
                            ? 'bg-[#109EB1] border-[#109EB1]'
                            : 'bg-[#06363D] hover:bg-[#084B54] border-[#084B54]'
                        } hover:scale-105 active:scale-95`}
                >
                    <Bookmark
                        className={`w-5 h-5 transition-all duration-200 ${isSaved
                                ? 'text-white fill-white scale-110'
                                : 'text-[#C7F4FA] group-hover:scale-110'
                            }`}
                    />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 p-0 bg-[#032125] border border-[#084B54] rounded-xl overflow-hidden"
            >
                {/* Header with Search */}
                <div className="p-3 border-b border-[#084B54]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C7F4FA]/50" />
                        <Input
                            ref={inputRef}
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-[#06363D] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/50 focus:border-[#109EB1]"
                        />
                    </div>
                </div>

                {/* Collection List */}
                <div className="max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-[#109EB1] animate-spin" />
                        </div>
                    ) : sortedCollections.length === 0 ? (
                        <div className="py-6 text-center text-[#C7F4FA]/50 text-sm">
                            {searchQuery ? 'No collections found' : 'No collections yet'}
                        </div>
                    ) : (
                        sortedCollections.map((collection) => {
                            const isInCollection = savedInCollections.has(collection.id);
                            const isSaving = savingCollectionId === collection.id;

                            return (
                                <button
                                    key={collection.id}
                                    onClick={() => handleToggleCollection(collection)}
                                    disabled={isSaving}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#06363D] transition-colors disabled:opacity-50"
                                >
                                    {/* Checkbox */}
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isInCollection
                                                ? 'bg-[#109EB1] border-[#109EB1]'
                                                : 'border-[#084B54]'
                                            }`}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                                        ) : isInCollection ? (
                                            <Check className="w-3 h-3 text-white" />
                                        ) : null}
                                    </div>

                                    {/* Collection Info */}
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-hebden font-semibold text-sm text-[#C7F4FA] truncate">
                                                {collection.name}
                                            </span>
                                            {collection.isDefault && (
                                                <span className="px-1.5 py-0.5 bg-[#109EB1]/20 text-[#109EB1] text-xs font-medium rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-[#C7F4FA]/50">
                                            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Create New Collection */}
                <div className="p-3 border-t border-[#084B54]">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <FolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C7F4FA]/50" />
                            <Input
                                placeholder="New collection name..."
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateCollection();
                                    }
                                }}
                                className="pl-9 bg-[#06363D] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/50 focus:border-[#109EB1]"
                            />
                        </div>
                        <button
                            onClick={handleCreateCollection}
                            disabled={!newCollectionName.trim() || isCreating}
                            className="px-4 py-2 bg-[#109EB1] hover:bg-[#0D8A9A] disabled:bg-[#109EB1]/50 rounded-lg text-white font-semibold transition-colors disabled:cursor-not-allowed"
                        >
                            {isCreating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
