import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AwardBadgeDto {
  @ApiProperty({ description: 'User ID to award badge to' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Badge ID to award' })
  @IsString()
  badgeId: string;

  @ApiProperty({ description: 'Reason for awarding badge', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
