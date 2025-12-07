import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ReorderSocialLinksDto {
    @ApiProperty({ description: 'Array of social link IDs in the desired order', type: [String] })
    @IsArray()
    linkIds: string[];
}
