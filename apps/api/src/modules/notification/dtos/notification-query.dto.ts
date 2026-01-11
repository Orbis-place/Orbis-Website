import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '@repo/db';

export class NotificationQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by notification type',
        enum: NotificationType
    })
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @ApiPropertyOptional({
        description: 'Filter by read status',
        example: false
    })
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    @IsOptional()
    read?: boolean;

    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1
    })
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 20,
        default: 20
    })
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 20;
}
