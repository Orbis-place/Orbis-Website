'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  getUserCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getUserFavorites,
  type UserCollection,
} from '@/lib/api/resources';
import { toast } from 'sonner';

type CollectionView = 'grid' | 'list';

export default function CollectionsPage() {
  const router = useRouter();
  const [view, setView] = useState<CollectionView>('grid');
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Favorites count
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<UserCollection | null>(null);

  // Form states
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load collections and favorites on mount
  useEffect(() => {
    loadCollections();
    loadFavoritesCount();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await getUserCollections();
      setCollections(data.collections);
      setTotalItems(data.collections.reduce((sum, c) => sum + c.itemCount, 0));
    } catch (error) {
      console.error('Failed to load collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesCount = async () => {
    try {
      const data = await getUserFavorites();
      setFavoritesCount(data.count);
    } catch (error) {
      console.error('Failed to load favorites count:', error);
    }
  };

  // Filter collections by search
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    return collections.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setIsSubmitting(true);
    try {
      const collection = await createCollection(newCollectionName.trim(), newCollectionDescription.trim() || undefined);
      // Update with isPublic if supported
      if (newCollectionIsPublic) {
        await updateCollection(collection.id, { isPublic: true });
        collection.isPublic = true;
      }
      setCollections((prev) => [...prev, collection]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionIsPublic(false);
      setCreateModalOpen(false);
      toast.success('Collection created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCollection = async () => {
    if (!selectedCollection || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await updateCollection(selectedCollection.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        isPublic: editIsPublic,
      });
      setCollections((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditModalOpen(false);
      toast.success('Collection updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    setIsSubmitting(true);
    try {
      await deleteCollection(selectedCollection.id);
      setCollections((prev) => prev.filter((c) => c.id !== selectedCollection.id));
      setDeleteModalOpen(false);
      toast.success('Collection deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCollection = (collectionId: string) => {
    router.push(`/dashboard/collections/${collectionId}`);
  };

  const openEditModal = (collection: UserCollection) => {
    setSelectedCollection(collection);
    setEditName(collection.name);
    setEditDescription(collection.description || '');
    setEditIsPublic(collection.isPublic);
    setEditModalOpen(true);
  };

  const openDeleteModal = (collection: UserCollection) => {
    setSelectedCollection(collection);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Organize your saved resources
          </p>
        </div>
        <Button className="font-hebden" onClick={() => setCreateModalOpen(true)}>
          <Icon icon="mdi:plus" width="20" height="20" />
          New Collection
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="18" height="18" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="text-sm font-nunito">
            <span className="text-foreground font-semibold">{collections.length}</span>
            <span className="text-muted-foreground ml-1">Collections</span>
          </div>
          <div className="text-sm font-nunito">
            <span className="text-foreground font-semibold">{totalItems}</span>
            <span className="text-muted-foreground ml-1">Items</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              view === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-foreground hover:bg-accent'
            )}
          >
            <Icon icon="mdi:view-grid" width="20" height="20" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-foreground hover:bg-accent'
            )}
          >
            <Icon icon="mdi:view-list" width="20" height="20" />
          </button>
        </div>
      </div>

      {/* Collections Grid/List */}
      <div className="bg-secondary/30 rounded-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="mdi:loading" width="40" height="40" className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Favorites Card - Always First */}
                <div
                  onClick={() => handleViewCollection('favorites')}
                  className="bg-accent border border-border rounded-lg p-4 hover:border-red-500/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Icon icon="mdi:heart" width="24" height="24" className="text-red-500" />
                    </div>
                  </div>
                  <h3 className="font-hebden text-lg font-semibold text-foreground mb-1 truncate">
                    Favorites
                  </h3>
                  <p className="text-sm text-muted-foreground font-nunito mb-3 line-clamp-2">
                    Your liked resources
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito">
                    <Icon icon="mdi:package-variant" width="16" height="16" />
                    <span>{favoritesCount} {favoritesCount === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>

                {/* Regular Collections */}
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => handleViewCollection(collection.id)}
                    className="bg-accent border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon icon="mdi:folder" width="24" height="24" className="text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {collection.isDefault && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                        {collection.isPublic && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Public
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Icon icon="mdi:dots-vertical" width="20" height="20" className="text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(collection); }}>
                              <Icon icon="mdi:pencil" width="16" height="16" className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {!collection.isDefault && (
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); openDeleteModal(collection); }}
                                className="text-destructive"
                              >
                                <Icon icon="mdi:delete" width="16" height="16" className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <h3 className="font-hebden text-lg font-semibold text-foreground mb-1 truncate">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground font-nunito mb-3 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito">
                      <Icon icon="mdi:package-variant" width="16" height="16" />
                      <span>{collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>
                ))}

                {/* Empty state for collections (not including favorites) */}
                {filteredCollections.length === 0 && searchQuery && (
                  <div className="col-span-full flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground font-nunito text-sm">
                      No collections match your search
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Favorites Row */}
                <div
                  onClick={() => handleViewCollection('favorites')}
                  className="bg-accent border border-border rounded-lg p-4 hover:border-red-500/50 transition-colors cursor-pointer group flex items-center gap-4"
                >
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Icon icon="mdi:heart" width="24" height="24" className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-hebden text-lg font-semibold text-foreground truncate">
                      Favorites
                    </h3>
                    <p className="text-sm text-muted-foreground font-nunito truncate">
                      Your liked resources
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground font-nunito flex-shrink-0">
                    {favoritesCount} {favoritesCount === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {/* Regular Collections */}
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => handleViewCollection(collection.id)}
                    className="bg-accent border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group flex items-center gap-4"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon icon="mdi:folder" width="24" height="24" className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-hebden text-lg font-semibold text-foreground truncate">
                          {collection.name}
                        </h3>
                        {collection.isDefault && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded flex-shrink-0">
                            Default
                          </span>
                        )}
                        {collection.isPublic && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded flex-shrink-0">
                            Public
                          </span>
                        )}
                      </div>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground font-nunito truncate">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-sm text-muted-foreground font-nunito">
                        {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon icon="mdi:dots-vertical" width="20" height="20" className="text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(collection); }}>
                            <Icon icon="mdi:pencil" width="16" height="16" className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!collection.isDefault && (
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(collection); }}
                              className="text-destructive"
                            >
                              <Icon icon="mdi:delete" width="16" height="16" className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Collection Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-hebden">Create Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="My Favorites"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <Input
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="A collection of my favorite resources"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">Public</label>
                <p className="text-xs text-muted-foreground">Visible on your profile</p>
              </div>
              <Switch
                checked={newCollectionIsPublic}
                onCheckedChange={setNewCollectionIsPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim() || isSubmitting}>
              {isSubmitting ? <Icon icon="mdi:loading" className="animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-hebden">Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">Public</label>
                <p className="text-xs text-muted-foreground">Visible on your profile</p>
              </div>
              <Switch
                checked={editIsPublic}
                onCheckedChange={setEditIsPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCollection} disabled={!editName.trim() || isSubmitting}>
              {isSubmitting ? <Icon icon="mdi:loading" className="animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-hebden">Delete Collection</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Are you sure you want to delete "{selectedCollection?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection} disabled={isSubmitting}>
              {isSubmitting ? <Icon icon="mdi:loading" className="animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
