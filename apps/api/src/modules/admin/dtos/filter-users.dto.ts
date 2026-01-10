import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, AccountStatus } from '@repo/db';

export class FilterUsersDto {
    @ApiProperty({
        description: 'Search query (username, email, or display name)',
        required: false,
        example: 'john',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Filter by user role',
        enum: UserRole,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({
        description: 'Filter by account status',
        enum: AccountStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(AccountStatus)
    status?: AccountStatus;

    @ApiProperty({
        description: 'Page number (1-indexed)',
        required: false,
        default: 1,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        required: false,
        default: 20,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
