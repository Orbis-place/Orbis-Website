import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { UpdateNotificationPreferencesDto } from './dtos/update-notification-preferences.dto';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiResponse({ status: 200, description: 'Returns paginated notifications' })
    async getNotifications(@Session() session: UserSession, @Query() query: NotificationQueryDto): Promise<any> {
        const userId = session.user.id;
        return this.notificationService.getNotifications(userId, query);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    @ApiResponse({ status: 200, description: 'Returns unread count' })
    async getUnreadCount(@Session() session: UserSession) {
        const userId = session.user.id;
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    async markAsRead(@Session() session: UserSession, @Param('id') id: string): Promise<any> {
        const userId = session.user.id;
        return this.notificationService.markAsRead(id, userId);
    }

    @Patch('read-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    async markAllAsRead(@Session() session: UserSession) {
        const userId = session.user.id;
        await this.notificationService.markAllAsRead(userId);
        return { success: true };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({ status: 200, description: 'Notification deleted' })
    async deleteNotification(@Session() session: UserSession, @Param('id') id: string) {
        const userId = session.user.id;
        await this.notificationService.deleteNotification(id, userId);
        return { success: true };
    }

    @Get('preferences')
    @ApiOperation({ summary: 'Get notification preferences' })
    @ApiResponse({ status: 200, description: 'Returns user notification preferences' })
    async getPreferences(@Session() session: UserSession) {
        const userId = session.user.id;
        return this.notificationService.getPreferences(userId);
    }

    @Patch('preferences')
    @ApiOperation({ summary: 'Update notification preferences' })
    @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
    async updatePreferences(
        @Session() session: UserSession,
        @Body() dto: UpdateNotificationPreferencesDto,
    ) {
        const userId = session.user.id;
        return this.notificationService.updatePreferences(userId, dto);
    }

    // Admin/System endpoint to create notifications
    @Post()
    @ApiOperation({ summary: 'Create a notification (admin/system)' })
    @ApiResponse({ status: 201, description: 'Notification created' })
    async createNotification(@Body() dto: CreateNotificationDto): Promise<any> {
        return this.notificationService.createNotification(dto);
    }
}
