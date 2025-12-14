import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsUrl,
    MinLength,
    MaxLength,
} from 'class-validator';

export class UpdateTeamDto {
    @ApiPropertyOptional({ example: 'hypixel', description: 'Unique team identifier (lowercase, no spaces)' })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(30)
    slug?: string;

    @ApiPropertyOptional({ example: 'Hypixel Studios', description: 'Display name for the team' })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(50)
    name?: string;

    @ApiPropertyOptional({
        example: 'A team dedicated to creating amazing Hytale servers...',
        description: 'Team description',
    })
    @IsString()
    @IsOptional()
    @IsOptional()
    @MaxLength(2000)
    description?: string;
}