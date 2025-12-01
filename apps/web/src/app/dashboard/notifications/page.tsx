'use client'

import { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NotificationFilter = 'all' | 'unread' | 'mentions' | 'teams';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const filters = [
    { id: 'all' as NotificationFilter, name: 'All', icon: 'mdi:bell' },
    { id: 'unread' as NotificationFilter, name: 'Unread', icon: 'mdi:bell-badge' },
    { id: 'mentions' as NotificationFilter, name: 'Mentions', icon: 'mdi:at' },
    { id: 'teams' as NotificationFilter, name: 'Teams', icon: 'mdi:account-group' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-hebden text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1 font-nunito">
              Stay updated with your activity
            </p>
          </div>
          <Button variant="outline" className="font-hebden">
            <Icon icon="mdi:check-all" width="20" height="20" />
            Mark All Read
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-nunito whitespace-nowrap',
                filter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/30 text-foreground hover:bg-accent'
              )}
            >
              <Icon icon={f.icon} width="18" height="18" />
              {f.name}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-secondary/30 rounded-lg overflow-hidden">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon icon="mdi:bell-outline" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No notifications</p>
            <p className="text-muted-foreground font-nunito text-sm text-center max-w-md">
              When you get notifications, they will appear here. Stay tuned!
            </p>
          </div>

          {/* Example notification items (commented out for empty state) */}
          {/*
          <div className="divide-y divide-border">
            <div className="p-4 hover:bg-accent transition-colors cursor-pointer flex gap-4">
              <div className="p-2 bg-primary/10 rounded-lg h-fit">
                <Icon icon="mdi:heart" width="24" height="24" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-nunito text-foreground mb-1">
                  <span className="font-semibold">John Doe</span> liked your resource <span className="font-semibold">Epic Mod Pack</span>
                </p>
                <p className="text-sm text-muted-foreground font-nunito">2 hours ago</p>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            </div>

            <div className="p-4 hover:bg-accent transition-colors cursor-pointer flex gap-4 bg-accent/30">
              <div className="p-2 bg-primary/10 rounded-lg h-fit">
                <Icon icon="mdi:comment" width="24" height="24" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-nunito text-foreground mb-1">
                  <span className="font-semibold">Jane Smith</span> commented on your resource
                </p>
                <p className="text-sm text-muted-foreground font-nunito line-clamp-2 mb-1">
                  This is amazing! I've been looking for something like this for ages. Great work!
                </p>
                <p className="text-sm text-muted-foreground font-nunito">5 hours ago</p>
              </div>
            </div>

            <div className="p-4 hover:bg-accent transition-colors cursor-pointer flex gap-4">
              <div className="p-2 bg-primary/10 rounded-lg h-fit">
                <Icon icon="mdi:account-group" width="24" height="24" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-nunito text-foreground mb-1">
                  You were added to <span className="font-semibold">Team Awesome</span>
                </p>
                <p className="text-sm text-muted-foreground font-nunito">1 day ago</p>
              </div>
            </div>

            <div className="p-4 hover:bg-accent transition-colors cursor-pointer flex gap-4">
              <div className="p-2 bg-primary/10 rounded-lg h-fit">
                <Icon icon="mdi:download" width="24" height="24" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-nunito text-foreground mb-1">
                  Your resource <span className="font-semibold">Cool Plugin</span> reached 1,000 downloads!
                </p>
                <p className="text-sm text-muted-foreground font-nunito">2 days ago</p>
              </div>
            </div>
          </div>
          */}
        </div>

      {/* Settings Link */}
      <div className="text-center">
        <a href="/dashboard/settings" className="text-sm text-primary hover:underline font-nunito">
          Manage notification preferences
        </a>
      </div>
    </div>
  );
}
