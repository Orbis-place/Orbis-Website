import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ShowcaseCategory } from '@repo/db';

export class FilterShowcasePostsDto {
    @ApiPropertyOptional({ enum: ShowcaseCategory, description: 'Filter by category' })
    @IsEnum(ShowcaseCategory)
    @IsOptional()
    category?: ShowcaseCategory;

    @ApiPropertyOptional({ description: 'Filter by author ID' })
    @IsString()
    @IsOptional()
    authorId?: string;

    @ApiPropertyOptional({ description: 'Filter by author username' })
    @IsString()
    @IsOptional()
    authorUsername?: string;

    @ApiPropertyOptional({ description: 'Show only featured posts', default: false })
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    featured?: boolean;

    @ApiPropertyOptional({ description: 'Search in title and description' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Sort by field', enum: ['createdAt', 'likeCount', 'viewCount'] })
    @IsString()
    @IsOptional()
    sortBy?: 'createdAt' | 'likeCount' | 'viewCount';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc';

    @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', default: 20 })
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;
}
