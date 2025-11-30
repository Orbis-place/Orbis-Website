import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateBadgeDto {
  @ApiProperty({ description: 'Badge name', example: 'Early Adopter' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Badge slug', example: 'early-adopter' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Badge description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Badge icon URL or identifier', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Badge color (hex)', example: '#69a024', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Badge rarity', enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'], default: 'COMMON', required: false })
  @IsOptional()
  @IsIn(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'])
  rarity?: string;

  @ApiProperty({ description: 'Is badge active', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
