import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateBadgeDto {
  @ApiProperty({ description: 'Badge name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Badge description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Badge icon URL or identifier', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Badge color (hex)', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Badge rarity', enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'], required: false })
  @IsOptional()
  @IsIn(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'])
  rarity?: string;

  @ApiProperty({ description: 'Is badge active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
