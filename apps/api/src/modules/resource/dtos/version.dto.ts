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
import { ReleaseChannel, VersionStatus } from '@repo/db';

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
        description: 'Compatible Hytale versions',
        example: ['1.0', '1.1'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    compatibleVersions: string[];

    @ApiProperty({
        description: 'Changelog in Markdown format',
        example: '# Version 1.0.0\n\n- Added new features\n- Fixed bugs',
    })
    @IsString()
    @IsNotEmpty()
    changelog: string;
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
        description: 'Compatible Hytale versions',
        example: ['1.0', '1.1'],
        type: [String],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    compatibleVersions?: string[];

    @ApiPropertyOptional({
        description: 'Changelog in Markdown format',
        example: '# Version 1.0.0\n\n- Added new features\n- Fixed bugs',
    })
    @IsString()
    @IsOptional()
    changelog?: string;

    @ApiPropertyOptional({
        description: 'Version status',
        enum: VersionStatus,
        example: VersionStatus.APPROVED,
    })
    @IsEnum(VersionStatus)
    @IsOptional()
    status?: VersionStatus;
}

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