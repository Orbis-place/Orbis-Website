'use client'

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type NotificationFilter = 'all' | 'unread';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter === 'unread') {
        params.append('read', 'false');
      }

      const response = await fetch(`${API_URL}/notifications?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Implement mark all as read endpoint
      console.log('Mark all as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const filters = [
    { id: 'all' as NotificationFilter, name: 'All', icon: 'mdi:bell' },
    { id: 'unread' as NotificationFilter, name: 'Unread', icon: 'mdi:bell-badge' },
  ];

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      NEW_FOLLOWER: 'mdi:account-plus',
      NEW_CREATOR_UPLOAD: 'mdi:upload',
      LIKED_PROJECT_UPDATE: 'mdi:heart',
      VERSION_APPROVED: 'mdi:check-circle',
      VERSION_REJECTED: 'mdi:close-circle',
      SHOWCASE_LIKE: 'mdi:heart',
      SHOWCASE_COMMENT: 'mdi:comment',
      COLLECTION_ADDITION: 'mdi:folder-plus',
    };
    return icons[type] || 'mdi:bell';
  };

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
        {notifications.some(n => !n.read) && (
          <Button variant="outline" className="font-hebden" onClick={markAllAsRead}>
            <Icon ssr={true} icon="mdi:check-all" width="20" height="20" />
            Mark All Read
          </Button>
        )}
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
            <Icon ssr={true} icon={f.icon} width="18" height="18" />
            {f.name}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-secondary/30 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Icon ssr={true} icon="mdi:loading" width="48" height="48" className="text-muted-foreground animate-spin" />
            <p className="text-foreground font-nunito text-lg mt-4">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Icon ssr={true} icon="mdi:alert-circle" width="48" height="48" className="text-destructive" />
            <p className="text-foreground font-nunito text-lg mt-4">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchNotifications}>
              <Icon ssr={true} icon="mdi:refresh" width="20" height="20" />
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-accent rounded-full mb-4">
              <Icon ssr={true} icon="mdi:bell-outline" width="48" height="48" className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-nunito text-lg mb-2">No notifications</p>
            <p className="text-muted-foreground font-nunito text-sm text-center max-w-md">
              When you get notifications, they will appear here. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={cn(
                  "p-4 hover:bg-accent transition-colors cursor-pointer flex gap-4",
                  !notification.read && "bg-accent/30"
                )}
              >
                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                  <Icon ssr={true} icon={getNotificationIcon(notification.type)}
                    width="24"
                    height="24"
                    className="text-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito text-foreground mb-1 font-semibold">
                    {notification.title}
                  </p>
                  <p className="font-nunito text-foreground mb-1">
                    {notification.message}
                  </p>
                  <p className="text-sm text-muted-foreground font-nunito">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
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
