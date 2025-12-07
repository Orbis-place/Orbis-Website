'use client'

import { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CollectionView = 'grid' | 'list';

export default function CollectionsPage() {
  const [view, setView] = useState<CollectionView>('grid');

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-hebden text-3xl font-bold text-foreground">Collections</h1>
            <p className="text-muted-foreground mt-1 font-nunito">
              Organize your favorite resources and mods
            </p>
          </div>
          <Button className="font-hebden">
            <Icon icon="mdi:plus" width="20" height="20" />
            New Collection
          </Button>
        </div>

        {/* View Toggle and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-4">
            <div className="text-sm font-nunito">
              <span className="text-foreground font-semibold">0</span>
              <span className="text-muted-foreground ml-1">Collections</span>
            </div>
            <div className="text-sm font-nunito">
              <span className="text-foreground font-semibold">0</span>
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
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon icon="mdi:folder-heart-outline" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No collections yet</p>
            <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
              Start organizing your favorite resources by creating collections. Group mods, plugins, and more!
            </p>
            <Button className="font-hebden">
              <Icon icon="mdi:plus" width="20" height="20" />
              Create Your First Collection
            </Button>
          </div>

          {/* Example collection items (commented out for empty state) */}
          {/*
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-accent border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon icon="mdi:folder" width="24" height="24" className="text-primary" />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="mdi:dots-vertical" width="20" height="20" className="text-muted-foreground" />
                  </button>
                </div>
                <h3 className="font-hebden text-lg font-semibold text-foreground mb-1">
                  Essential Mods
                </h3>
                <p className="text-sm text-muted-foreground font-nunito mb-3">
                  Must-have mods for every playthrough
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito">
                  <Icon icon="mdi:package-variant" width="16" height="16" />
                  <span>12 items</span>
                </div>
              </div>

              <div className="bg-accent border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon icon="mdi:folder" width="24" height="24" className="text-primary" />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="mdi:dots-vertical" width="20" height="20" className="text-muted-foreground" />
                  </button>
                </div>
                <h3 className="font-hebden text-lg font-semibold text-foreground mb-1">
                  RPG Enhancement
                </h3>
                <p className="text-sm text-muted-foreground font-nunito mb-3">
                  Mods that enhance the RPG experience
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito">
                  <Icon icon="mdi:package-variant" width="16" height="16" />
                  <span>8 items</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-accent border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon icon="mdi:folder" width="24" height="24" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-hebden text-lg font-semibold text-foreground">
                    Essential Mods
                  </h3>
                  <p className="text-sm text-muted-foreground font-nunito">
                    Must-have mods for every playthrough
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground font-nunito">
                    12 items
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="mdi:dots-vertical" width="20" height="20" className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="bg-accent border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon icon="mdi:folder" width="24" height="24" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-hebden text-lg font-semibold text-foreground">
                    RPG Enhancement
                  </h3>
                  <p className="text-sm text-muted-foreground font-nunito">
                    Mods that enhance the RPG experience
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground font-nunito">
                    8 items
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="mdi:dots-vertical" width="20" height="20" className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )}
          */}
        </div>

        {/* Favorites Section */}
        <div className="mt-8">
          <h2 className="font-hebden text-2xl font-bold text-foreground mb-4">Quick Access</h2>
          <div className="bg-secondary/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:heart" width="24" height="24" className="text-primary" />
              <h3 className="font-hebden text-xl font-semibold text-foreground">Favorites</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <Icon icon="mdi:heart-outline" width="40" height="40" className="text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-nunito text-sm">
                No favorite resources yet
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
