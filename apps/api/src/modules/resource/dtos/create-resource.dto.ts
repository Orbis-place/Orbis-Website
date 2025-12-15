import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    MinLength,
    MaxLength,
} from 'class-validator';

export enum ResourceType {
    PLUGIN = 'PLUGIN',
    ASSET_PACK = 'ASSET_PACK',
    MOD = 'MOD',
    MODPACK = 'MODPACK',
    PREMADE_SERVER = 'PREMADE_SERVER',
    WORLD = 'WORLD',
    PREFAB = 'PREFAB',
    DATA_PACK = 'DATA_PACK',
    TOOLS_SCRIPTS = 'TOOLS_SCRIPTS',
}


export class CreateResourceDto {
    @ApiProperty({ example: 'My Awesome Plugin', description: 'Resource name' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        example: 'The best plugin for your server',
        description: 'Short tagline (max 200 chars)',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    tagline: string;

    @ApiProperty({
        example: 'PLUGIN',
        description: 'Resource type',
        enum: ResourceType,
    })
    @IsEnum(ResourceType)
    @IsNotEmpty()
    type: ResourceType;

    @ApiProperty({
        example: 'my-awesome-plugin',
        description: 'URL-friendly slug',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    slug: string;

    @ApiPropertyOptional({
        example: 'team-id-123',
        description: 'Team ID (if resource belongs to a team)',
    })
    @IsString()
    @IsOptional()
    teamId?: string;
}