import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    IsArray,
    IsUrl,
    MinLength,
    MaxLength,
    Min,
    Max,
    Matches,
} from 'class-validator';

export class CreateServerDto {
    @ApiProperty({ example: 'Hypixel Hytale', description: 'Server name' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @ApiPropertyOptional({
        example: 'The best Hytale server with incredible mini-games...',
        description: 'Full server description',
    })
    @IsString()
    @IsOptional()
    @MinLength(10)
    @MaxLength(5000)
    description?: string;

    @ApiPropertyOptional({
        example: 'Join the best Hytale server!',
        description: 'Short description (max 200 chars)',
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    shortDesc?: string;

    @ApiProperty({
        example: 'play.hypixel.net:5520',
        description: 'Server address (IP:port or domain:port, port defaults to 5520 if not specified)',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(
        /^(?:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(?::\d{1,5})?$/,
        { message: 'Invalid server address format. Use IP:port or domain:port (port is optional)' },
    )
    serverAddress: string;

    @ApiProperty({
        example: 'hytale-version-id-123',
        description: 'Primary game version ID (reference to HytaleVersion)'
    })
    @IsString()
    @IsOptional()
    gameVersionId?: string;

    @ApiProperty({
        example: 'hypixel-hytale',
        description: 'URL-friendly slug',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    slug: string;

    @ApiPropertyOptional({
        example: ['hytale-version-id-123', 'hytale-version-id-456'],
        description: 'Supported game version IDs (references to HytaleVersion)',
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    supportedVersionIds?: string[];

    @ApiPropertyOptional({
        example: 'https://example.com',
        description: 'Server website URL',
    })
    @IsUrl()
    @IsOptional()
    websiteUrl?: string;

    @ApiPropertyOptional({
        example: 'France',
        description: 'Server country/location',
    })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({
        example: 'category-id-123',
        description: 'Primary category ID',
    })
    @IsString()
    @IsNotEmpty()
    primaryCategoryId: string;


    @ApiPropertyOptional({
        example: ['category-id-456', 'category-id-789'],
        description: 'Additional category IDs (max 3 total)',
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    categoryIds?: string[];

    @ApiPropertyOptional({
        example: ['tag-id-123', 'tag-id-456'],
        description: 'Tag IDs (optional, max 10)',
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tagIds?: string[];

    @ApiPropertyOptional({
        example: ['PvP', 'Economy', 'Custom Items'],
        description: 'Tag names to create/assign (optional, max 10 total with tagIds)',
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tagNames?: string[];

    @ApiPropertyOptional({
        example: 'team-id-123',
        description: 'Team ID (if server belongs to a team)',
    })
    @IsString()
    @IsOptional()
    teamId?: string;
}