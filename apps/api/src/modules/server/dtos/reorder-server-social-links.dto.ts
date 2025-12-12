import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderServerSocialLinksDto {
    @ApiProperty({
        description: 'Array of social link IDs in the desired order',
        example: ['link-id-1', 'link-id-2', 'link-id-3'],
    })
    @IsArray()
    @IsString({ each: true })
    linkIds: string[];
}
