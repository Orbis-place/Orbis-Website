import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsArray,
    IsOptional,
    MaxLength,
    ArrayMinSize
} from 'class-validator';
import { ReleaseChannel } from '@repo/db';

// ============================================
// VERSION CREATION & UPDATE
// ============================================

export class CreateVersionDto {
    @ApiProperty({
        description: 'Version number (e.g., "1.0.0", "2.1.3-beta")',
        example: '1.0.0',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    versionNumber: string;

    @ApiPropertyOptional({
        description: 'Optional version name (e.g., "The Big Update")',
        example: 'The Adventure Update',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiProperty({
        description: 'Release channel',
        enum: ReleaseChannel,
        example: ReleaseChannel.RELEASE,
    })
    @IsEnum(ReleaseChannel)
    channel: ReleaseChannel;

    @ApiProperty({
        description: 'Compatible Hytale version IDs',
        example: ['clxx123...', 'clxx456...'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    compatibleHytaleVersionIds: string[];
}

export class UpdateVersionDto {
    @ApiPropertyOptional({
        description: 'Optional version name',
        example: 'The Adventure Update',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        description: 'Release channel',
        enum: ReleaseChannel,
        example: ReleaseChannel.RELEASE,
    })
    @IsEnum(ReleaseChannel)
    @IsOptional()
    channel?: ReleaseChannel;

    @ApiPropertyOptional({
        description: 'Compatible Hytale version IDs (only editable in DRAFT or REJECTED status)',
        example: ['clxx123...', 'clxx456...'],
        type: [String],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    compatibleHytaleVersionIds?: string[];
}

// ============================================
// CHANGELOG
// ============================================

export class UpdateChangelogDto {
    @ApiProperty({
        description: 'Changelog in HTML format (Tiptap editor output)',
        example: '<p>Version 1.0.0</p><ul><li>Added new features</li><li>Fixed bugs</li></ul>',
    })
    @IsString()
    @IsNotEmpty()
    changelog: string;
}

// ============================================
// VERSION WORKFLOW
// ============================================

export class SubmitVersionDto {
    @ApiPropertyOptional({
        description: 'Optional message for reviewers',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    submissionNote?: string;
}

export class RejectVersionDto {
    @ApiProperty({
        description: 'Reason for rejection',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    reason: string;
}

// ============================================
// FILE MANAGEMENT
// ============================================

export class UploadVersionFileDto {
    @ApiPropertyOptional({
        description: 'Display name for the file',
        example: 'MyPlugin-v1.0.0.jar',
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    displayName?: string;
}

export class SetPrimaryFileDto {
    @ApiProperty({
        description: 'ID of the file to set as primary',
        example: 'file_abc123',
    })
    @IsString()
    @IsNotEmpty()
    fileId: string;
}