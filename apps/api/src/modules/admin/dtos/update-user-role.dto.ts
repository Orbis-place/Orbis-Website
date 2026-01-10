import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '@repo/db';

export class UpdateUserRoleDto {
    @ApiProperty({
        description: 'New role for the user',
        enum: UserRole,
        example: UserRole.MODERATOR,
    })
    @IsEnum(UserRole)
    role: UserRole;
}
