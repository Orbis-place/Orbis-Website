// Notifications Store - Manages alerts and notifications
import { writable, derived, get } from 'svelte/store';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

function createNotificationsStore() {
    const { subscribe, set, update } = writable<Notification[]>([
        {
            id: 'notif-1',
            type: 'warning',
            title: 'Mod Update Available',
            message: 'EconomyCore has a new version (1.5.4) available.',
            timestamp: new Date(Date.now() - 3600000),
            read: false,
            action: {
                label: 'Update',
                href: '/browse/mod-2',
            },
        },
        {
            id: 'notif-2',
            type: 'info',
            title: 'Backup Completed',
            message: 'Automatic backup for "Orbis Survival" completed successfully.',
            timestamp: new Date(Date.now() - 7200000),
            read: true,
        },
        {
            id: 'notif-3',
            type: 'success',
            title: 'Server Online',
            message: '"Orbis Survival" is now online and accepting players.',
            timestamp: new Date(Date.now() - 86400000),
            read: true,
        },
    ]);

    return {
        subscribe,

        // Add a new notification
        add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
            const newNotification: Notification = {
                ...notification,
                id: `notif-${Date.now()}`,
                timestamp: new Date(),
                read: false,
            };
            update(notifications => [newNotification, ...notifications]);
            return newNotification.id;
        },

        // Mark notification as read
        markRead: (id: string) => {
            update(notifications => notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        },

        // Mark all as read
        markAllRead: () => {
            update(notifications => notifications.map(n => ({ ...n, read: true })));
        },

        // Remove a notification
        remove: (id: string) => {
            update(notifications => notifications.filter(n => n.id !== id));
        },

        // Clear all notifications
        clear: () => set([]),

        // Get unread count
        getUnreadCount: () => {
            return get({ subscribe }).filter(n => !n.read).length;
        },

        // Helper methods for common notification types
        info: (title: string, message: string, action?: Notification['action']) => {
            const store = createNotificationsStore();
            return store.add({ type: 'info', title, message, action });
        },

        success: (title: string, message: string, action?: Notification['action']) => {
            const store = createNotificationsStore();
            return store.add({ type: 'success', title, message, action });
        },

        warning: (title: string, message: string, action?: Notification['action']) => {
            const store = createNotificationsStore();
            return store.add({ type: 'warning', title, message, action });
        },

        error: (title: string, message: string, action?: Notification['action']) => {
            const store = createNotificationsStore();
            return store.add({ type: 'error', title, message, action });
        },
    };
}

export const notifications = createNotificationsStore();

// Derived stores
export const unreadCount = derived(notifications, $notifications =>
    $notifications.filter(n => !n.read).length
);

export const hasUnread = derived(unreadCount, $count => $count > 0);

// Toast notifications (temporary, auto-dismiss)
export interface Toast {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    return {
        subscribe,

        show: (type: NotificationType, message: string, duration = 4000) => {
            const id = `toast-${Date.now()}`;

            update(toasts => [...toasts, { id, type, message, duration }]);

            if (duration > 0) {
                setTimeout(() => {
                    update(toasts => toasts.filter(t => t.id !== id));
                }, duration);
            }

            return id;
        },

        dismiss: (id: string) => {
            update(toasts => toasts.filter(t => t.id !== id));
        },

        // Convenience methods
        info: (message: string, duration?: number) => {
            const store = createToastStore();
            return store.show('info', message, duration);
        },

        success: (message: string, duration?: number) => {
            const store = createToastStore();
            return store.show('success', message, duration);
        },

        warning: (message: string, duration?: number) => {
            const store = createToastStore();
            return store.show('warning', message, duration);
        },

        error: (message: string, duration?: number) => {
            const store = createToastStore();
            return store.show('error', message, duration);
        },
    };
}

export const toasts = createToastStore();
