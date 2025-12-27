import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ShowcaseCategory, ShowcasePostStatus } from '@repo/db';

export class UpdateShowcasePostDto {
    @ApiPropertyOptional({ description: 'Title of the showcase post', maxLength: 200 })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({ description: 'Description of the post (Markdown supported)' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: ShowcaseCategory, description: 'Category of the showcase' })
    @IsEnum(ShowcaseCategory)
    @IsOptional()
    category?: ShowcaseCategory;

    @ApiPropertyOptional({ enum: ShowcasePostStatus, description: 'Status of the post' })
    @IsEnum(ShowcasePostStatus)
    @IsOptional()
    status?: ShowcasePostStatus;

    @ApiPropertyOptional({ description: 'ID of a linked resource (if applicable)' })
    @IsString()
    @IsOptional()
    linkedResourceId?: string;

    @ApiPropertyOptional({ description: 'URL of the thumbnail image' })
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;
}
