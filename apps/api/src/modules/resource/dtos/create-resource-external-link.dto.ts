import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ExternalLinkType } from '@repo/db';

export class CreateResourceExternalLinkDto {
    @ApiProperty({ enum: ExternalLinkType })
    @IsEnum(ExternalLinkType)
    type: ExternalLinkType;

    @ApiProperty()
    @IsUrl()
    url: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    label?: string;
}
