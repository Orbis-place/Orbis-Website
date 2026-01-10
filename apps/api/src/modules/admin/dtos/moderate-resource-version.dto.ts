import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ModerationAction {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
}

export class ModerateResourceVersionDto {
    @ApiProperty({ enum: ModerationAction, description: 'Action to take (approve or reject)' })
    @IsEnum(ModerationAction)
    action: ModerationAction;

    @ApiProperty({ description: 'Reason for rejection (required if rejecting)', required: false })
    @IsString()
    @IsOptional()
    reason?: string;
}
