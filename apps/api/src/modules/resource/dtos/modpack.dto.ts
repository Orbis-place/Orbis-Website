import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';

// ============================================================================
// MODPACK MOD ENTRY DTOs
// ============================================================================

export class AddPlatformModDto {
    @ApiProperty({ description: 'Resource Version ID of the mod to add' })
    @IsString()
    @IsNotEmpty()
    modVersionId: string;

    @ApiPropertyOptional({ description: 'Notes about this mod in the modpack' })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    notes?: string;

    @ApiPropertyOptional({ description: 'Display order' })
    @IsInt()
    @Min(0)
    @IsOptional()
    order?: number;
}

export class AddCustomModDto {
    @ApiProperty({ description: 'Custom mod name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    customModName: string;

    @ApiProperty({ description: 'Custom mod version' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    customModVersion: string;

    @ApiPropertyOptional({ description: 'Notes about this mod in the modpack' })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    notes?: string;

    @ApiPropertyOptional({ description: 'Display order' })
    @IsInt()
    @Min(0)
    @IsOptional()
    order?: number;
}

export class UpdateModEntryDto {
    @ApiPropertyOptional({ description: 'New mod version ID (for platform mods)' })
    @IsString()
    @IsOptional()
    modVersionId?: string;

    @ApiPropertyOptional({ description: 'Custom mod version (for custom mods)' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    customModVersion?: string;

    @ApiPropertyOptional({ description: 'Notes about this mod' })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    notes?: string;

    @ApiPropertyOptional({ description: 'Display order' })
    @IsInt()
    @Min(0)
    @IsOptional()
    order?: number;
}

export class ReorderModEntriesDto {
    @ApiProperty({ description: 'Array of mod entry IDs in new order' })
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    modEntryIds: string[];
}

// ============================================================================
// FORK DTO
// ============================================================================

export class ForkModpackDto {
    @ApiProperty({ description: 'Name for the forked modpack' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({ description: 'Slug for the forked modpack' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @ApiPropertyOptional({ description: 'Tagline for the forked modpack' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    tagline?: string;

    @ApiPropertyOptional({ description: 'Team ID if forking to a team' })
    @IsString()
    @IsOptional()
    teamId?: string;
}
