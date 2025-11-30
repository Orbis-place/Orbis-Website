import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsInt, Min, Max, IsString} from 'class-validator';
import {Type} from 'class-transformer';

export class PaginationDto {
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

    @ApiPropertyOptional({
        description: 'Search query for filtering by name',
        example: 'plugin',
    })
    @IsString()
    @IsOptional()
    name?: string;
}

export class PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };

    constructor(data: T[], total: number, page: number, limit: number) {
        const totalPages = Math.ceil(total / limit);

        this.data = data;
        this.meta = {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
}