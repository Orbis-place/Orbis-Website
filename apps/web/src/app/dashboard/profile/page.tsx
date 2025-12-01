'use client'

import { Icon } from '@iconify-icon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/useSessionStore';

export default function ProfilePage() {
  const { session } = useSessionStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg h-48 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="-mt-32 mb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 px-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
              <AvatarFallback className="bg-primary text-white font-hebden text-3xl">
                {session?.user?.name ? getInitials(session.user.name) : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left mb-4">
              <h1 className="font-hebden text-3xl font-bold text-foreground">
                {session?.user?.name || 'User'}
              </h1>
              <p className="text-muted-foreground font-nunito">
                {session?.user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                <span className="text-sm font-nunito text-muted-foreground">
                  <Icon icon="mdi:calendar" className="inline mr-1" />
                  Joined December 2024
                </span>
              </div>
            </div>

            <Button className="font-hebden">
              <Icon icon="mdi:pencil" width="20" height="20" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 text-center">
            <Icon icon="mdi:package-variant" width="32" height="32" className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-hebden text-foreground">0</p>
            <p className="text-sm text-foreground/70 font-nunito">Resources</p>
          </div>

          <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6 text-center">
            <Icon icon="mdi:heart" width="32" height="32" className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-hebden text-foreground">0</p>
            <p className="text-sm text-foreground/70 font-nunito">Favorites</p>
          </div>

          <div className="bg-gradient-to-br from-accent/80 to-accent/40 rounded-lg p-6 text-center">
            <Icon icon="mdi:download" width="32" height="32" className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-hebden text-foreground">0</p>
            <p className="text-sm text-foreground/70 font-nunito">Downloads</p>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 text-center">
            <Icon icon="mdi:account-group" width="32" height="32" className="text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold font-hebden text-foreground">0</p>
            <p className="text-sm text-foreground/70 font-nunito">Teams</p>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-secondary/30 rounded-lg p-6">
              <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">About</h2>
              <p className="text-muted-foreground font-nunito text-sm">
                No bio added yet. Click Edit Profile to add a description about yourself.
              </p>
            </div>

            {/* Recent Activity */}
            <div className="bg-secondary/30 rounded-lg p-6">
              <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
              <div className="flex flex-col items-center justify-center py-8">
                <Icon icon="mdi:history" width="40" height="40" className="text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-nunito text-sm">No recent activity</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            <div className="bg-secondary/30 rounded-lg p-6">
              <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Social Links</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start font-nunito">
                  <Icon icon="mdi:twitter" width="20" height="20" />
                  Add Twitter
                </Button>
                <Button variant="outline" className="w-full justify-start font-nunito">
                  <Icon icon="mdi:github" width="20" height="20" />
                  Add GitHub
                </Button>
                <Button variant="outline" className="w-full justify-start font-nunito">
                  <Icon icon="mdi:youtube" width="20" height="20" />
                  Add YouTube
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-secondary/30 rounded-lg p-6">
              <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Badges</h2>
              <div className="flex flex-col items-center justify-center py-6">
                <Icon icon="mdi:trophy" width="40" height="40" className="text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-nunito text-sm text-center">
                  No badges earned yet
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
