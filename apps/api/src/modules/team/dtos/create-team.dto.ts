import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateTeamDto {
    @ApiProperty({ example: 'hypixel', description: 'Unique team identifier (lowercase, no spaces)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    slug: string;

    @ApiProperty({ example: 'Hypixel Studios', description: 'Display name for the team' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

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