import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsUrl,
    MaxLength,
    ValidateIf,
} from 'class-validator';
import { DependencyType } from '@repo/db';

// ============================================
// CREATE DEPENDENCY
// ============================================

export class CreateDependencyDto {
    @ApiProperty({
        description: 'Type of dependency',
        enum: DependencyType,
        example: DependencyType.REQUIRED,
    })
    @IsEnum(DependencyType)
    dependencyType: DependencyType;

    // ========== INTERNAL DEPENDENCY FIELDS ==========

    @ApiPropertyOptional({
        description: 'Resource ID for internal dependency (from marketplace)',
        example: 'clxx123abc...',
    })
    @IsString()
    @IsOptional()
    dependencyResourceId?: string;

    @ApiPropertyOptional({
        description: 'Minimum version ID for internal dependency (references a ResourceVersion)',
        example: 'clxxversion123...',
    })
    @IsString()
    @IsOptional()
    @ValidateIf((o) => !!o.dependencyResourceId)
    minVersionId?: string;

    // ========== EXTERNAL DEPENDENCY FIELDS ==========

    @ApiPropertyOptional({
        description: 'Name of the external dependency (required if external)',
        example: 'Fabric API',
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    @ValidateIf((o) => !o.dependencyResourceId)
    externalName?: string;

    @ApiPropertyOptional({
        description: 'URL to find/download the external dependency (required if external)',
        example: 'https://www.curseforge.com/hytale/mods/advanced-item-info',
    })
    @IsString()
    @IsOptional()
    @IsUrl()
    @ValidateIf((o) => !o.dependencyResourceId)
    externalUrl?: string;

    @ApiPropertyOptional({
        description: 'Minimum version for external dependency (free text)',
        example: '0.90.0',
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    @ValidateIf((o) => !o.dependencyResourceId)
    externalMinVersion?: string;
}

// ============================================
// UPDATE DEPENDENCY
// ============================================

export class UpdateDependencyDto {
    @ApiPropertyOptional({
        description: 'Type of dependency',
        enum: DependencyType,
        example: DependencyType.OPTIONAL,
    })
    @IsEnum(DependencyType)
    @IsOptional()
    dependencyType?: DependencyType;

    @ApiPropertyOptional({
        description: 'Minimum version ID for internal dependency',
        example: 'clxxversion456...',
    })
    @IsString()
    @IsOptional()
    minVersionId?: string;

    @ApiPropertyOptional({
        description: 'Minimum version for external dependency (free text)',
        example: '2.0.0',
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    externalMinVersion?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class InternalDependencyResourceDto {
    @ApiProperty({ description: 'Resource ID' })
    id: string;

    @ApiProperty({ description: 'Resource name' })
    name: string;

    @ApiProperty({ description: 'Resource slug' })
    slug: string;

    @ApiPropertyOptional({ description: 'Resource icon URL' })
    iconUrl?: string | null;
}

export class MinVersionDto {
    @ApiProperty({ description: 'Version ID' })
    id: string;

    @ApiProperty({ description: 'Version number' })
    versionNumber: string;
}

export class DependencyResponseDto {
    @ApiProperty({ description: 'Dependency ID' })
    id: string;

    @ApiProperty({
        description: 'Type of dependency',
        enum: DependencyType,
    })
    dependencyType: DependencyType;

    @ApiProperty({ description: 'Whether this is an internal dependency' })
    isInternal: boolean;

    // ========== INTERNAL DEPENDENCY RESPONSE ==========

    @ApiPropertyOptional({
        description: 'Internal dependency resource (if internal)',
    })
    dependencyResource?: InternalDependencyResourceDto | null;

    @ApiPropertyOptional({
        description: 'Minimum version reference (if internal)',
    })
    minVersion?: MinVersionDto | null;

    // ========== EXTERNAL DEPENDENCY RESPONSE ==========

    @ApiPropertyOptional({
        description: 'External dependency name (if external)',
    })
    externalName?: string | null;

    @ApiPropertyOptional({
        description: 'External dependency URL (if external)',
    })
    externalUrl?: string | null;

    @ApiPropertyOptional({
        description: 'External minimum version (if external)',
    })
    externalMinVersion?: string | null;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;
}
