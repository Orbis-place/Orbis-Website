'use client'

import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';

export default function ServersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-hebden text-3xl font-bold text-foreground">My Servers</h1>
          <p className="text-muted-foreground mt-1 font-nunito">
            Manage your Hytale servers and monitor their status
          </p>
        </div>
        <Button className="font-hebden">
          <Icon icon="mdi:plus" width="20" height="20" />
          Add Server
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:server" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">0</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Servers</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Icon icon="mdi:check-circle" width="24" height="24" className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">0</p>
              <p className="text-sm text-foreground/70 font-nunito">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Icon icon="mdi:account-multiple" width="24" height="24" className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-hebden text-foreground">0</p>
              <p className="text-sm text-foreground/70 font-nunito">Total Players</p>
            </div>
          </div>
        </div>
      </div>

      {/* Servers List */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Your Servers</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-accent rounded-full mb-4">
            <Icon icon="mdi:server" width="48" height="48" className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-nunito text-lg mb-2">No servers yet</p>
          <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
            Add your Hytale servers to track their status, manage players, and showcase them to the community.
          </p>
          <Button className="font-hebden">
            <Icon icon="mdi:plus" width="20" height="20" />
            Add Your First Server
          </Button>
        </div>
      </div>

      {/* Server Stats */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Server Analytics</h2>
        <div className="flex flex-col items-center justify-center py-8">
          <Icon icon="mdi:chart-line" width="40" height="40" className="text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-nunito text-sm">
            Analytics will appear here once you add a server
          </p>
        </div>
      </div>
    </div>
  );
}
