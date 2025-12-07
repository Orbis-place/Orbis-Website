import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateReportDto } from './dtos/create-report.dto';
import { ModerateReportDto, ReportAction } from './dtos/moderate-report.dto';
import { prisma, UserRole } from '@repo/db';

@Injectable()
export class ReportService {
    constructor() {
    }

    async reportUser(reporterId: string, userId: string, createReportDto: CreateReportDto) {
        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            throw new NotFoundException('User not found');
        }

        // Prevent self-reporting
        if (reporterId === userId) {
            throw new BadRequestException('You cannot report yourself');
        }

        // Validate description is provided when reason is OTHER
        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        // Check if user already reported this resource
        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'USER',
                resourceId: userId,
                status: {
                    in: ['PENDING', 'UNDER_REVIEW'],
                },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this user');
        }

        // Create the report
        return prisma.report.create({
            data: {
                resourceType: 'USER',
                resourceId: userId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    async getMyReports(userId: string) {
        return prisma.report.findMany({
            where: {
                reporterId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                resourceType: true,
                resourceId: true,
                reason: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                handledAt: true,
                response: true,
            },
        });
    }

    // ============================================
    // MODERATION METHODS
    // ============================================

    async getAllReports(moderatorId: string, status?: string) {
        // Verify moderator has proper role
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (!moderator || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)) {
            throw new ForbiddenException('You do not have permission to view reports');
        }

        const where = status ? { status: status as any } : {};

        return prisma.report.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        email: true,
                    },
                },
                handler: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    async getReportById(moderatorId: string, reportId: string) {
        // Verify moderator has proper role
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (!moderator || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)) {
            throw new ForbiddenException('You do not have permission to view this report');
        }

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        email: true,
                        createdAt: true,
                    },
                },
                handler: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return report;
    }

    async moderateReport(moderatorId: string, reportId: string, moderateDto: ModerateReportDto) {
        // Verify moderator has proper role
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (!moderator || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)) {
            throw new ForbiddenException('You do not have permission to moderate reports');
        }

        // Check if report exists
        const report = await prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        // Check if report is already handled
        if (report.status === 'RESOLVED' || report.status === 'DISMISSED') {
            throw new BadRequestException('This report has already been handled');
        }

        // Map action to status
        const statusMap = {
            [ReportAction.DISMISS]: 'DISMISSED',
            [ReportAction.RESOLVE]: 'RESOLVED',
            [ReportAction.UNDER_REVIEW]: 'UNDER_REVIEW',
        };

        const newStatus = statusMap[moderateDto.action];

        // Update report
        return prisma.report.update({
            where: { id: reportId },
            data: {
                status: newStatus as any,
                handledBy: moderatorId,
                handledAt: new Date(),
                response: moderateDto.response,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                handler: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    async deleteReport(moderatorId: string, reportId: string) {
        // Verify moderator has proper role (only ADMIN and SUPER_ADMIN can delete)
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (!moderator || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)) {
            throw new ForbiddenException('You do not have permission to delete reports');
        }

        // Check if report exists
        const report = await prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        // Delete the report
        await prisma.report.delete({
            where: { id: reportId },
        });

        return { message: 'Report deleted successfully' };
    }
}