import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ReportService } from './report.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { ModerateReportDto } from './dtos/moderate-report.dto';
import { UserRole } from '@repo/db';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) {
    }

    @Post('users/:userId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Report a user' })
    async reportUser(
        @Session() session: UserSession,
        @Param('userId') userId: string,
        @Body() createReportDto: CreateReportDto,
    ) {
        return this.reportService.reportUser(session.user.id, userId, createReportDto);
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my submitted reports' })
    async getMyReports(@Session() session: UserSession) {
        return this.reportService.getMyReports(session.user.id);
    }

    @Get(':reportId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get details of one of my reports' })
    @ApiParam({ name: 'reportId', description: 'Report ID' })
    async getMyReportById(
        @Session() session: UserSession,
        @Param('reportId') reportId: string,
    ) {
        return this.reportService.getMyReportById(session.user.id, reportId);
    }

    @Delete(':reportId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel a pending report' })
    @ApiParam({ name: 'reportId', description: 'Report ID' })
    async cancelReport(
        @Session() session: UserSession,
        @Param('reportId') reportId: string,
    ) {
        return this.reportService.cancelReport(session.user.id, reportId);
    }

    // ============================================
    // MODERATION ENDPOINTS
    // ============================================

    @Get('moderation/all')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get all reports (Moderator+ only)' })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by status: PENDING, UNDER_REVIEW, RESOLVED, DISMISSED',
    })
    async getAllReports(
        @Session() session: UserSession,
        @Query('status') status?: string,
    ) {
        return this.reportService.getAllReports(session.user.id, status);
    }

    @Get('moderation/:reportId')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get report details (Moderator+ only)' })
    @ApiParam({ name: 'reportId', description: 'Report ID' })
    async getReportById(
        @Session() session: UserSession,
        @Param('reportId') reportId: string,
    ) {
        return this.reportService.getReportById(session.user.id, reportId);
    }

    @Patch('moderation/:reportId')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Moderate a report (Moderator+ only)' })
    @ApiParam({ name: 'reportId', description: 'Report ID' })
    async moderateReport(
        @Session() session: UserSession,
        @Param('reportId') reportId: string,
        @Body() moderateDto: ModerateReportDto,
    ) {
        return this.reportService.moderateReport(session.user.id, reportId, moderateDto);
    }

    @Delete('moderation/:reportId')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Delete a report (Admin+ only)' })
    @ApiParam({ name: 'reportId', description: 'Report ID' })
    async deleteReport(
        @Session() session: UserSession,
        @Param('reportId') reportId: string,
    ) {
        return this.reportService.deleteReport(session.user.id, reportId);
    }
}