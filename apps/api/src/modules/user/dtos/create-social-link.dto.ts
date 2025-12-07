import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export enum SocialLinkType {
    TWITTER = 'TWITTER',
    GITHUB = 'GITHUB',
    DISCORD = 'DISCORD',
    YOUTUBE = 'YOUTUBE',
    TWITCH = 'TWITCH',
    LINKEDIN = 'LINKEDIN',
    INSTAGRAM = 'INSTAGRAM',
    FACEBOOK = 'FACEBOOK',
    REDDIT = 'REDDIT',
    TIKTOK = 'TIKTOK',
    CUSTOM = 'CUSTOM',
}

export class CreateSocialLinkDto {
    @ApiProperty({ enum: SocialLinkType, description: 'Type of social link' })
    @IsEnum(SocialLinkType)
    type: SocialLinkType;

    @ApiProperty({ description: 'URL of the social link' })
    @IsUrl()
    url: string;

    @ApiProperty({ description: 'Optional custom label', required: false })
    @IsOptional()
    @IsString()
    label?: string;
}
