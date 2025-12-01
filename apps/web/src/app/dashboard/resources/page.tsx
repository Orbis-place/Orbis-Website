'use client'

import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">My Resources</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Manage your mods, plugins, and other creations
          </p>
        </div>
        <Button className="font-hebden">
          <Icon icon="mdi:plus" width="20" height="20" />
          Create Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:package-variant" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">0</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Resources</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:download" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">0</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Downloads</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/80 to-accent/40 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:star" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">0</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Favorites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Your Resources</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-accent rounded-full mb-4">
            <Icon icon="mdi:package-variant" width="48" height="48" className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-nunito text-lg mb-2">No resources yet</p>
          <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
            Start creating resources to share with the Orbis community. Upload mods, plugins, worlds, and more.
          </p>
          <Button className="font-hebden">
            <Icon icon="mdi:plus" width="20" height="20" />
            Create Your First Resource
          </Button>
        </div>
      </div>
    </div>
  );
}
