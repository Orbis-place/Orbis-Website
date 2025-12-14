import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderResourceExternalLinksDto {
    @ApiProperty({ type: [String], description: 'Array of link IDs in the desired order' })
    @IsArray()
    @IsString({ each: true })
    linkIds: string[];
}
