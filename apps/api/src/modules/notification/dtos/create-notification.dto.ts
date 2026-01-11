import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '@repo/db';

export class CreateNotificationDto {
    @ApiProperty({
        description: 'User ID to send notification to',
        example: 'clx123456789'
    })
    @IsString()
    @IsNotEmpty()
    userId!: string;

    @ApiProperty({
        description: 'Type of notification',
        enum: NotificationType
    })
    @IsEnum(NotificationType)
    @IsNotEmpty()
    type!: NotificationType;

    @ApiProperty({
        description: 'Notification title',
        example: 'New Update Available'
    })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiProperty({
        description: 'Notification message',
        example: 'The resource "Amazing Plugin" has been updated to version 2.0'
    })
    @IsString()
    @IsNotEmpty()
    message!: string;

    @ApiPropertyOptional({
        description: 'Additional data (resource ID, user ID, etc.)',
        example: { resourceId: 'clx123456789', versionId: 'clx987654321' }
    })
    @IsObject()
    @IsOptional()
    data?: Record<string, any>;
}
