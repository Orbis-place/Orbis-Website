import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { FilterTeamsDto } from './dtos/filter-teams.dto';
import { AddTeamMemberDto, UpdateTeamMemberDto } from './dtos/manage-member.dto';
import { CreateInvitationDto, RespondToInvitationDto, FilterInvitationsDto } from './dtos/invitation.dto';
import { CreateTeamSocialLinkDto } from './dtos/create-team-social-link.dto';
import { UpdateTeamSocialLinkDto } from './dtos/update-team-social-link.dto';
import { ReorderTeamSocialLinksDto } from './dtos/reorder-team-social-links.dto';


@ApiTags('teams')
@Controller('teams')
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    // ============================================
    // PUBLIC ENDPOINTS
    // ============================================

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all teams with filters and pagination' })
    async findAll(@Query() filterDto: FilterTeamsDto) {
        return this.teamService.findAll(filterDto);
    }

    @Get(':name')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get team by name' })
    @ApiParam({ name: 'name', description: 'Team name' })
    async findByName(@Param('name') name: string) {
        return this.teamService.findByName(name);
    }

    // ============================================
    // AUTHENTICATED ENDPOINTS - TEAM MANAGEMENT
    // ============================================

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new team' })
    async create(
        @Session() session: UserSession,
        @Body() createDto: CreateTeamDto,
    ) {
        return this.teamService.create(session.user.id, createDto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async update(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Body() updateDto: UpdateTeamDto,
    ) {
        return this.teamService.update(session.user.id, teamId, updateDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async delete(
        @Session() session: UserSession,
        @Param('id') teamId: string,
    ) {
        return this.teamService.delete(session.user.id, teamId);
    }

    // ============================================
    // FILE UPLOAD ENDPOINTS
    // ============================================

    @Post(':id/logo')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload team logo' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @UseInterceptors(FileInterceptor('logo'))
    async uploadLogo(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.teamService.uploadLogo(session.user.id, teamId, file);
    }

    @Post(':id/banner')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload team banner' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @UseInterceptors(FileInterceptor('banner'))
    async uploadBanner(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.teamService.uploadBanner(session.user.id, teamId, file);
    }

    @Delete(':id/logo')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team logo' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async deleteLogo(
        @Session() session: UserSession,
        @Param('id') teamId: string,
    ) {
        return this.teamService.deleteLogo(session.user.id, teamId);
    }

    @Delete(':id/banner')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team banner' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async deleteBanner(
        @Session() session: UserSession,
        @Param('id') teamId: string,
    ) {
        return this.teamService.deleteBanner(session.user.id, teamId);
    }

    // ============================================
    // INVITATION MANAGEMENT ENDPOINTS
    // ============================================

    @Post(':id/invitations')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create team invitation' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async createInvitation(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Body() createDto: CreateInvitationDto,
    ) {
        return this.teamService.createInvitation(session.user.id, teamId, createDto);
    }

    @Get(':id/invitations')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get team invitations' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async getTeamInvitations(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Query() filterDto: FilterInvitationsDto,
    ) {
        return this.teamService.getTeamInvitations(session.user.id, teamId, filterDto);
    }

    @Delete(':id/invitations/:invitationId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel team invitation' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiParam({ name: 'invitationId', description: 'Invitation ID' })
    async cancelInvitation(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Param('invitationId') invitationId: string,
    ) {
        return this.teamService.cancelInvitation(session.user.id, teamId, invitationId);
    }

    @Get('invitations/me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user received invitations' })
    async getUserInvitations(
        @Session() session: UserSession,
        @Query() filterDto: FilterInvitationsDto,
    ) {
        return this.teamService.getUserInvitations(session.user.id, filterDto);
    }

    @Post('invitations/:invitationId/respond')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Respond to team invitation' })
    @ApiParam({ name: 'invitationId', description: 'Invitation ID' })
    async respondToInvitation(
        @Session() session: UserSession,
        @Param('invitationId') invitationId: string,
        @Body() respondDto: RespondToInvitationDto,
    ) {
        return this.teamService.respondToInvitation(session.user.id, invitationId, respondDto);
    }

    // ============================================
    // MEMBER MANAGEMENT ENDPOINTS
    // ============================================

    @Patch(':id/members/:memberId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team member role' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiParam({ name: 'memberId', description: 'Team member ID' })
    async updateMember(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Param('memberId') memberId: string,
        @Body() updateDto: UpdateTeamMemberDto,
    ) {
        return this.teamService.updateMember(session.user.id, teamId, memberId, updateDto);
    }

    @Delete(':id/members/:memberId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove member from team' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiParam({ name: 'memberId', description: 'Team member ID' })
    async removeMember(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Param('memberId') memberId: string,
    ) {
        return this.teamService.removeMember(session.user.id, teamId, memberId);
    }

    @Post(':id/leave')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Leave team' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async leaveTeam(
        @Session() session: UserSession,
        @Param('id') teamId: string,
    ) {
        return this.teamService.leaveTeam(session.user.id, teamId);
    }

    // ============================================
    // TEAM CONTENT ENDPOINTS
    // ============================================

    @Get(':id/resources')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get team resources' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async getTeamResources(@Param('id') teamId: string) {
        return this.teamService.getTeamResources(teamId);
    }

    @Get(':id/servers')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get team servers' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async getTeamServers(@Param('id') teamId: string) {
        return this.teamService.getTeamServers(teamId);
    }

    @Get('user/my-teams')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user teams' })
    async getMyTeams(@Session() session: UserSession) {
        return this.teamService.getUserTeams(session.user.id);
    }

    // ============================================
    // SOCIAL LINKS MANAGEMENT ENDPOINTS
    // ============================================

    @Get(':id/social-links')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get team social links' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async getSocialLinks(@Param('id') teamId: string) {
        return this.teamService.getSocialLinks(teamId);
    }

    @Post(':id/social-links')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create team social link' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async createSocialLink(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Body() createDto: CreateTeamSocialLinkDto,
    ) {
        return this.teamService.createSocialLink(session.user.id, teamId, createDto);
    }

    @Patch(':id/social-links/:linkId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team social link' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiParam({ name: 'linkId', description: 'Social link ID' })
    async updateSocialLink(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Param('linkId') linkId: string,
        @Body() updateDto: UpdateTeamSocialLinkDto,
    ) {
        return this.teamService.updateSocialLink(session.user.id, teamId, linkId, updateDto);
    }

    @Delete(':id/social-links/:linkId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team social link' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiParam({ name: 'linkId', description: 'Social link ID' })
    async deleteSocialLink(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Param('linkId') linkId: string,
    ) {
        return this.teamService.deleteSocialLink(session.user.id, teamId, linkId);
    }

    @Patch(':id/social-links/reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder team social links' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    async reorderSocialLinks(
        @Session() session: UserSession,
        @Param('id') teamId: string,
        @Body() reorderDto: ReorderTeamSocialLinksDto,
    ) {
        return this.teamService.reorderSocialLinks(session.user.id, teamId, reorderDto.linkIds);
    }
}