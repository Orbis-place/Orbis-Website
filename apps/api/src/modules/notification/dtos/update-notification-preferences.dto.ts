import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
    @ApiPropertyOptional({
        description: 'Enable notifications for liked project updates',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifLikedProjectUpdates?: boolean;

    @ApiPropertyOptional({
        description: 'Enable notifications for new creator uploads',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifNewCreatorUploads?: boolean;

    @ApiPropertyOptional({
        description: 'Enable notifications for new followers',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifNewFollowers?: boolean;

    @ApiPropertyOptional({
        description: 'Enable notifications for version approvals/rejections',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifVersionStatus?: boolean;

    @ApiPropertyOptional({
        description: 'Enable notifications for collection additions',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifCollectionAdditions?: boolean;

    @ApiPropertyOptional({
        description: 'Enable notifications for showcase interactions',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    notifShowcaseInteractions?: boolean;
}
