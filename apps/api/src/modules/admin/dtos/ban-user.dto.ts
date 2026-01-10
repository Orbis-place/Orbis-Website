import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BanUserDto {
    @ApiProperty({
        description: 'Whether to ban or unban the user',
        example: true,
    })
    @IsBoolean()
    banned: boolean;

    @ApiProperty({
        description: 'Reason for banning (required when banning)',
        example: 'Violation of community guidelines',
        required: false,
    })
    @IsOptional()
    @IsString()
    reason?: string;
}
