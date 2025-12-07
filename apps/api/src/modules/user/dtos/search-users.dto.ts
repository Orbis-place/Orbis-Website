import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
    @ApiProperty({
        example: 'john',
        description: 'Search query (minimum 3 characters)',
        minLength: 3,
    })
    @IsString()
    @MinLength(3, { message: 'Search query must be at least 3 characters long' })
    query: string;

    @ApiProperty({
        example: 10,
        description: 'Maximum number of results to return',
        required: false,
        default: 10,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number;
}
