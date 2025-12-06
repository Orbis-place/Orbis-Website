import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSocialLinkDto {
    @ApiProperty({ description: 'URL of the social link', required: false })
    @IsOptional()
    @IsUrl()
    url?: string;

    @ApiProperty({ description: 'Optional custom label', required: false })
    @IsOptional()
    @IsString()
    label?: string;
}
