import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateServerDto } from "./create-server.dto";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateServerDto extends PartialType(CreateServerDto) {
    @ApiPropertyOptional({
        example: ['PvP', 'Roleplay'],
        description: 'Tag names to add (will be created if they don\'t exist)',
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    addTags?: string[];

    @ApiPropertyOptional({
        example: ['Economy', 'Custom Items'],
        description: 'Tag names or slugs to remove',
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    removeTags?: string[];
}