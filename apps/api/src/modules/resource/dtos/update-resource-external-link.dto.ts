import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateResourceExternalLinkDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl()
    url?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    label?: string;
}
