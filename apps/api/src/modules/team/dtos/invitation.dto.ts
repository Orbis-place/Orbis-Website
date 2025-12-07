import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TeamMemberRole, TeamInvitationStatus } from '@repo/db';

export class CreateInvitationDto {
    @ApiProperty({ example: 'user-id-123', description: 'User ID to invite to the team' })
    @IsString()
    @IsNotEmpty()
    inviteeId: string;

    @ApiProperty({
        example: TeamMemberRole.MEMBER,
        description: 'Role to assign when the invitation is accepted',
        enum: TeamMemberRole,
        default: TeamMemberRole.MEMBER,
    })
    @IsEnum(TeamMemberRole)
    @IsOptional()
    role?: TeamMemberRole;
}

export class RespondToInvitationDto {
    @ApiProperty({
        example: TeamInvitationStatus.ACCEPTED,
        description: 'Response to the invitation',
        enum: [TeamInvitationStatus.ACCEPTED, TeamInvitationStatus.DECLINED],
    })
    @IsEnum([TeamInvitationStatus.ACCEPTED, TeamInvitationStatus.DECLINED])
    @IsNotEmpty()
    response: TeamInvitationStatus;
}

export class FilterInvitationsDto {
    @ApiProperty({
        example: TeamInvitationStatus.PENDING,
        description: 'Filter by invitation status',
        enum: TeamInvitationStatus,
        required: false,
    })
    @IsEnum(TeamInvitationStatus)
    @IsOptional()
    status?: TeamInvitationStatus;
}
