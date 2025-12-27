import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ShowcaseCategory } from '@repo/db';

export class CreateShowcasePostDto {
    @ApiProperty({ description: 'Title of the showcase post', maxLength: 200 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiPropertyOptional({ description: 'Description of the post (Markdown supported)' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: ShowcaseCategory, description: 'Category of the showcase' })
    @IsEnum(ShowcaseCategory)
    category: ShowcaseCategory;

    @ApiPropertyOptional({ description: 'ID of a linked resource (if applicable)' })
    @IsString()
    @IsOptional()
    linkedResourceId?: string;

    @ApiPropertyOptional({ description: 'Team ID if creating as a team (exclusive with user ownership)' })
    @IsString()
    @IsOptional()
    teamId?: string;
}
