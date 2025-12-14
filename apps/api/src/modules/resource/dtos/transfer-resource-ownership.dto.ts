import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferResourceOwnershipDto {
    @ApiProperty({
        description: 'User ID to transfer ownership to (mutually exclusive with transferToTeamId)',
        required: false,
        example: 'clxx1234567890abcdef',
    })
    @IsOptional()
    @IsString()
    @ValidateIf((o) => !o.transferToTeamId)
    transferToUserId?: string;

    @ApiProperty({
        description: 'Team ID to transfer ownership to (mutually exclusive with transferToUserId)',
        required: false,
        example: 'clxx0987654321fedcba',
    })
    @IsOptional()
    @IsString()
    @ValidateIf((o) => !o.transferToUserId)
    transferToTeamId?: string;

    // Custom validation to ensure exactly one is provided
    constructor() {
        if (!this.transferToUserId && !this.transferToTeamId) {
            throw new Error('Either transferToUserId or transferToTeamId must be provided');
        }
        if (this.transferToUserId && this.transferToTeamId) {
            throw new Error('Cannot provide both transferToUserId and transferToTeamId');
        }
    }
}
