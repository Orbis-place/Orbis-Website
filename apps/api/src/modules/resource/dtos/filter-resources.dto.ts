import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ResourceType } from './create-resource.dto';

export enum ResourceSortOption {
    DOWNLOADS = 'downloads',
    LIKES = 'likes',
    DATE = 'date',
    UPDATED = 'updated',
    NAME = 'name',
}

export class FilterResourcesDto {
    @ApiPropertyOptional({
        description: 'Resource type to filter by',
        enum: ResourceType,
        example: ResourceType.PLUGIN,
    })
    @IsEnum(ResourceType)
    @IsOptional()
    type?: ResourceType;

    @ApiPropertyOptional({
        description: 'Search query for name or description',
        example: 'economy plugin',
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({
        description: 'Sort option',
        enum: ResourceSortOption,
        example: ResourceSortOption.DOWNLOADS,
        default: ResourceSortOption.DATE,
    })
    @IsEnum(ResourceSortOption)
    @IsOptional()
    sortBy?: ResourceSortOption = ResourceSortOption.DATE;

    @ApiPropertyOptional({
        description: 'Filter by tag slugs or IDs (OR logic)',
        type: [String],
        example: ['economy', 'admin-tools'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') return [value];
        return value;
    })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Filter by category slugs or IDs (OR logic)',
        type: [String],
        example: ['gameplay', 'utilities'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') return [value];
        return value;
    })
    categories?: string[];

    @ApiPropertyOptional({
        description: 'Filter by Hytale version strings (OR logic)',
        type: [String],
        example: ['1.0.0', '1.1.0'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') return [value];
        return value;
    })
    versions?: string[];

    @ApiPropertyOptional({
        description: 'Page number (1-based)',
        example: 1,
        default: 1,
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 20,
        default: 20,
        minimum: 1,
        maximum: 100,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;
}
