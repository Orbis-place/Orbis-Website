import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateShowcaseCommentDto {
    @ApiProperty({ description: 'Comment content', maxLength: 2000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    content: string;

    @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
    @IsString()
    @IsOptional()
    parentId?: string;
}
