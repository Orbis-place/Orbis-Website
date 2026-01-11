import { Injectable } from '@nestjs/common';
import { prisma, NotificationType } from '@repo/db';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { UpdateNotificationPreferencesDto } from './dtos/update-notification-preferences.dto';

@Injectable()
export class NotificationService {

    /**
     * Create a new notification
     */
    async createNotification(dto: CreateNotificationDto): Promise<any> {
        console.log('[NotificationService] createNotification called:', { userId: dto.userId, type: dto.type });

        // Check if user wants this type of notification
        const userPref = await this.checkUserPreference(dto.userId, dto.type);
        console.log('[NotificationService] User preference check:', { userId: dto.userId, type: dto.type, enabled: userPref });

        if (!userPref) {
            console.log('[NotificationService] Notification blocked by user preferences');
            return null; // User has disabled this notification type
        }

        const notification = await prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data || {},
            },
        });

        console.log('[NotificationService] Notification created:', notification.id);
        return notification;
    }

    /**
     * Get notifications for a user with pagination and filters
     */
    async getNotifications(userId: string, query: NotificationQueryDto): Promise<any> {
        const { type, read, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = { userId };

        if (type !== undefined) {
            where.type = type;
        }

        if (read !== undefined) {
            where.read = read;
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<any> {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        return prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<any> {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        return prisma.notification.delete({
            where: { id: notificationId },
        });
    }

    /**
     * Get user notification preferences
     */
    async getPreferences(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                notifLikedProjectUpdates: true,
                notifNewCreatorUploads: true,
                notifNewFollowers: true,
                notifVersionStatus: true,
                notifCollectionAdditions: true,
                notifShowcaseInteractions: true,
            },
        });

        return user;
    }

    /**
     * Update user notification preferences
     */
    async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
        return prisma.user.update({
            where: { id: userId },
            data: dto,
            select: {
                notifLikedProjectUpdates: true,
                notifNewCreatorUploads: true,
                notifNewFollowers: true,
                notifVersionStatus: true,
                notifCollectionAdditions: true,
                notifShowcaseInteractions: true,
            },
        });
    }

    /**
     * Check if user wants to receive this type of notification
     */
    async checkUserPreference(userId: string, type: NotificationType): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                notifLikedProjectUpdates: true,
                notifNewCreatorUploads: true,
                notifNewFollowers: true,
                notifVersionStatus: true,
                notifCollectionAdditions: true,
                notifShowcaseInteractions: true,
            },
        });

        if (!user) return false;

        // Map notification types to preference fields
        const preferenceMap: Record<NotificationType, keyof typeof user> = {
            LIKED_PROJECT_UPDATE: 'notifLikedProjectUpdates',
            NEW_CREATOR_UPLOAD: 'notifNewCreatorUploads',
            NEW_FOLLOWER: 'notifNewFollowers',
            VERSION_APPROVED: 'notifVersionStatus',
            VERSION_REJECTED: 'notifVersionStatus',
            COLLECTION_ADDITION: 'notifCollectionAdditions',
            SHOWCASE_LIKE: 'notifShowcaseInteractions',
            SHOWCASE_COMMENT: 'notifShowcaseInteractions',
        };

        const preferenceKey = preferenceMap[type];
        return user[preferenceKey] ?? true;
    }
}
