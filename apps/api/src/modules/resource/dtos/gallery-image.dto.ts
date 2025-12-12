import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateGalleryImageDto {
    @ApiPropertyOptional({ description: 'Image caption' })
    @IsOptional()
    @IsString()
    caption?: string;

    @ApiPropertyOptional({ description: 'Image title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Image description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Display order', default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number = 0;
}

export class UpdateGalleryImageDto {
    @ApiPropertyOptional({ description: 'Image caption' })
    @IsOptional()
    @IsString()
    caption?: string;

    @ApiPropertyOptional({ description: 'Image title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Image description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Display order' })
    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;
}

export class ReorderGalleryImagesDto {
    @ApiProperty({
        description: 'Array of image IDs in the desired order',
        type: [String],
    })
    @IsNotEmpty()
    imageIds: string[];
}
