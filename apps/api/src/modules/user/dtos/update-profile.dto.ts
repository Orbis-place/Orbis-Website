import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsUrl,
    MaxLength,
    IsBoolean,
    Matches,
    MinLength,
    ValidateIf
} from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: 'Unique username',
        example: 'john_doe',
        minLength: 3,
        maxLength: 30
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores and hyphens'
    })
    username?: string;

    @ApiPropertyOptional({
        description: 'Display name',
        example: 'John Doe',
        maxLength: 100
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    displayName?: string;

    @ApiPropertyOptional({
        description: 'Profile banner image URL',
        example: 'https://example.com/banner.jpg'
    })
    @ValidateIf((o) => o.banner !== null && o.banner !== undefined && o.banner !== '')
    @IsUrl()
    @IsOptional()
    banner?: string;

    @ApiPropertyOptional({
        description: 'User biography',
        example: 'Full-stack developer passionate about web technologies',
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional({
        description: 'User location',
        example: 'Paris, France',
        maxLength: 100
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    location?: string;

    @ApiPropertyOptional({
        description: 'Personal website URL',
        example: 'https://johndoe.com'
    })
    @ValidateIf((o) => o.website !== null && o.website !== undefined && o.website !== '')
    @IsUrl()
    @IsOptional()
    website?: string;

    @ApiPropertyOptional({
        description: 'Enable email notifications',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    emailNotifications?: boolean;

    @ApiPropertyOptional({
        description: 'Enable marketing emails',
        example: false,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    marketingEmails?: boolean;

    @ApiPropertyOptional({
        description: 'Show email publicly',
        example: false,
        default: false
    })
    @IsBoolean()
    @IsOptional()
    showEmail?: boolean;

    @ApiPropertyOptional({
        description: 'Show location publicly',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    showLocation?: boolean;

    @ApiPropertyOptional({
        description: 'Show online status',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    showOnlineStatus?: boolean;

    @ApiPropertyOptional({
        description: 'Show followers list publicly',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    showFollowers?: boolean;

    @ApiPropertyOptional({
        description: 'Show following list publicly',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    showFollowing?: boolean;

    @ApiPropertyOptional({
        description: 'Allow team invitations',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    allowTeamInvitations?: boolean;

    @ApiPropertyOptional({
        description: 'UI theme preference',
        example: 'dark',
        enum: ['light', 'dark', 'auto'],
        default: 'dark'
    })
    @IsString()
    @IsOptional()
    @Matches(/^(light|dark|auto)$/, {
        message: 'Theme must be either light, dark, or auto'
    })
    theme?: string;

    @ApiPropertyOptional({
        description: 'Preferred language',
        example: 'en',
        default: 'en'
    })
    @IsString()
    @IsOptional()
    @MaxLength(10)
    language?: string;

    // Notification preferences
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