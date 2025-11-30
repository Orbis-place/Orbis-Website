import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateGalleryImageDto {
    @ApiProperty({ description: 'Image URL' })
    @IsNotEmpty()
    @IsUrl()
    url: string;

    @ApiProperty({ description: 'Storage key for the image' })
    @IsNotEmpty()
    @IsString()
    storageKey: string;

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

    @ApiProperty({ description: 'Display order', default: 0 })
    @IsInt()
    @Min(0)
    order: number = 0;

    @ApiProperty({ description: 'File size in bytes' })
    @IsInt()
    @Min(0)
    size: number;
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
