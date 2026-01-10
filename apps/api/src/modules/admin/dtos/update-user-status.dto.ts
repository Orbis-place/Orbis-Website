import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AccountStatus } from '@repo/db';

export class UpdateUserStatusDto {
    @ApiProperty({
        description: 'New status for the user account',
        enum: AccountStatus,
        example: AccountStatus.ACTIVE,
    })
    @IsEnum(AccountStatus)
    status: AccountStatus;
}
