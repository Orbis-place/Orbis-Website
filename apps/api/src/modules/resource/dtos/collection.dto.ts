import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
    @ApiProperty({ description: 'Name of the collection', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ description: 'Description of the collection', maxLength: 300 })
    @IsString()
    @IsOptional()
    @MaxLength(300)
    description?: string;

    @ApiPropertyOptional({ description: 'Whether the collection is publicly visible', default: false })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}

export class UpdateCollectionDto {
    @ApiPropertyOptional({ description: 'New name for the collection', maxLength: 100 })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ description: 'New description for the collection', maxLength: 300 })
    @IsString()
    @IsOptional()
    @MaxLength(300)
    description?: string;

    @ApiPropertyOptional({ description: 'Whether the collection is publicly visible' })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}
