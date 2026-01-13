import { Body, Controller, Get, Param, Patch, Query, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@repo/db';
import { AdminService } from './admin.service';
import { ModerationService } from './moderation.service';
import { FilterUsersDto } from './dtos/filter-users.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { BanUserDto } from './dtos/ban-user.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';
import { ModerateResourceVersionDto } from './dtos/moderate-resource-version.dto';
import { BadRequestException } from '@nestjs/common';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly moderationService: ModerationService,
    ) { }

    // ============================================
    // STATISTICS
    // ============================================

    @Get('stats')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get platform statistics (Moderator+ only)' })
    async getStats(@Session() session: UserSession) {
        return this.adminService.getStats(session.user.id);
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    @Get('users')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get all users with filters (Admin+ only)' })
    async getUsers(
        @Session() session: UserSession,
        @Query() filterDto: FilterUsersDto,
    ) {
        return this.adminService.getUsers(session.user.id, filterDto);
    }

    @Patch('users/:userId/role')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Update user role (Admin+ only)' })
    async updateUserRole(
        @Session() session: UserSession,
        @Param('userId') userId: string,
        @Body() updateDto: UpdateUserRoleDto,
    ) {
        return this.adminService.updateUserRole(session.user.id, userId, updateDto);
    }

    @Patch('users/:userId/ban')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Ban or unban a user (Admin+ only)' })
    async banUser(
        @Session() session: UserSession,
        @Param('userId') userId: string,
        @Body() banDto: BanUserDto,
    ) {
        return this.adminService.banUser(session.user.id, userId, banDto);
    }

    @Patch('users/:userId/status')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Update user account status (Admin+ only)' })
    async updateUserStatus(
        @Session() session: UserSession,
        @Param('userId') userId: string,
        @Body() updateDto: UpdateUserStatusDto,
    ) {
        return this.adminService.updateUserStatus(session.user.id, userId, updateDto);
    }

    // ============================================
    // MODERATION OVERVIEW
    // ============================================

    @Get('moderation/overview')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get moderation overview (Moderator+ only)' })
    async getModerationOverview(@Session() session: UserSession) {
        return this.adminService.getModerationOverview(session.user.id);
    }

    // ============================================
    // RESOURCE VERSION MODERATION
    // ============================================

    @Get('moderation/pending-resource-versions')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get pending resource versions (Moderator+ only)' })
    async getPendingResourceVersions(@Session() session: UserSession) {
        return this.adminService.getPendingResourceVersions(session.user.id);
    }

    @Patch('moderation/resource-versions/:versionId')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Moderate a resource version (Moderator+ only)' })
    async moderateResourceVersion(
        @Session() session: UserSession,
        @Param('versionId') versionId: string,
        @Body() moderateDto: ModerateResourceVersionDto,
    ) {
        return this.adminService.moderateResourceVersion(
            session.user.id,
            versionId,
            moderateDto.action,
            moderateDto.reason,
        );
    }

    // ============================================
    // ADVANCED MODERATION (FILES & SCANNING)
    // ============================================

    @Get('moderation/versions/:versionId/files')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get file structure of a version (Moderator+ only)' })
    async getVersionFileStructure(
        @Param('versionId') versionId: string,
        @Query('fileUrl') fileUrl: string,
    ) {
        if (!fileUrl) throw new BadRequestException('File URL is required');
        return this.moderationService.getFileStructure(versionId, fileUrl);
    }

    @Get('moderation/versions/:versionId/files/content')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get content of a specific file (Moderator+ only)' })
    async getVersionFileContent(
        @Param('versionId') versionId: string,
        @Query('fileUrl') fileUrl: string,
        @Query('path') path: string,
    ) {
        if (!fileUrl) throw new BadRequestException('File URL is required');
        return this.moderationService.getFileContent(fileUrl, path);
    }

    @Post('moderation/versions/:versionId/scan')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Trigger VirusTotal scan (Moderator+ only)' })
    async scanVersionFile(
        @Param('versionId') versionId: string,
        @Query('fileUrl') fileUrl: string,
    ) {
        if (!fileUrl) throw new BadRequestException('File URL is required');
        return this.moderationService.scanFile(fileUrl);
    }

    @Get('moderation/analysis/:analysisId')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get VirusTotal analysis result' })
    async getScanAnalysis(@Param('analysisId') analysisId: string) {
        return this.moderationService.getScanAnalysis(analysisId);
    }
}
