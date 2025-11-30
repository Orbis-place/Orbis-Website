import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResourceStatus } from '@repo/db';

export class ModerateResourceDto {
    @ApiProperty({
        enum: ResourceStatus,
        description: 'New status for the resource',
        example: ResourceStatus.APPROVED,
    })
    @IsEnum(ResourceStatus)
    status: ResourceStatus;

    @ApiPropertyOptional({
        description: 'Reason for the moderation action (required for REJECTED/SUSPENDED)',
        example: 'Resource contains inappropriate content',
    })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiPropertyOptional({
        description: 'Internal moderation notes (not visible to resource owner)',
        example: 'Checked for malware, found suspicious code in version 1.2.3',
    })
    @IsOptional()
    @IsString()
    moderationNotes?: string;
}
