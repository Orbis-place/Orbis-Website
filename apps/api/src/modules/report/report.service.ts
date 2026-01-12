import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateReportDto } from './dtos/create-report.dto';
import { ModerateReportDto, ReportAction } from './dtos/moderate-report.dto';
import { prisma, UserRole } from '@repo/db';

@Injectable()
export class ReportService {
    constructor() {
    }

    // ============================================
    // USER REPORTS
    // ============================================

    async reportUser(reporterId: string, userId: string, createReportDto: CreateReportDto) {
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            throw new NotFoundException('User not found');
        }

        if (reporterId === userId) {
            throw new BadRequestException('You cannot report yourself');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'USER',
                reportedUserId: userId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this user');
        }

        return prisma.report.create({
            data: {
                resourceType: 'USER',
                reportedUserId: userId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // RESOURCE REPORTS
    // ============================================

    async reportResource(reporterId: string, resourceId: string, createReportDto: CreateReportDto) {
        const resourceExists = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { id: true, ownerUserId: true },
        });

        if (!resourceExists) {
            throw new NotFoundException('Resource not found');
        }

        if (reporterId === resourceExists.ownerUserId) {
            throw new BadRequestException('You cannot report your own resource');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'RESOURCE',
                reportedResourceId: resourceId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this resource');
        }

        return prisma.report.create({
            data: {
                resourceType: 'RESOURCE',
                reportedResourceId: resourceId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // RESOURCE VERSION REPORTS
    // ============================================

    async reportResourceVersion(reporterId: string, versionId: string, createReportDto: CreateReportDto) {
        const versionExists = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
            select: {
                id: true,
                resource: {
                    select: { ownerUserId: true },
                },
            },
        });

        if (!versionExists) {
            throw new NotFoundException('Resource version not found');
        }

        if (reporterId === versionExists.resource.ownerUserId) {
            throw new BadRequestException('You cannot report your own resource version');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'RESOURCE_VERSION',
                reportedResourceVersionId: versionId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this version');
        }

        return prisma.report.create({
            data: {
                resourceType: 'RESOURCE_VERSION',
                reportedResourceVersionId: versionId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // RESOURCE COMMENT REPORTS
    // ============================================

    async reportResourceComment(reporterId: string, commentId: string, createReportDto: CreateReportDto) {
        const commentExists = await prisma.resourceComment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true },
        });

        if (!commentExists) {
            throw new NotFoundException('Comment not found');
        }

        if (reporterId === commentExists.userId) {
            throw new BadRequestException('You cannot report your own comment');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'RESOURCE_COMMENT',
                reportedResourceCommentId: commentId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this comment');
        }

        return prisma.report.create({
            data: {
                resourceType: 'RESOURCE_COMMENT',
                reportedResourceCommentId: commentId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // SHOWCASE POST REPORTS
    // ============================================

    async reportShowcasePost(reporterId: string, postId: string, createReportDto: CreateReportDto) {
        const postExists = await prisma.showcasePost.findUnique({
            where: { id: postId },
            select: { id: true, authorId: true, ownerUserId: true },
        });

        if (!postExists) {
            throw new NotFoundException('Showcase post not found');
        }

        const ownerId = postExists.ownerUserId || postExists.authorId;
        if (reporterId === ownerId) {
            throw new BadRequestException('You cannot report your own showcase post');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'SHOWCASE_POST',
                reportedShowcasePostId: postId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this showcase post');
        }

        return prisma.report.create({
            data: {
                resourceType: 'SHOWCASE_POST',
                reportedShowcasePostId: postId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // SHOWCASE COMMENT REPORTS
    // ============================================

    async reportShowcaseComment(reporterId: string, commentId: string, createReportDto: CreateReportDto) {
        const commentExists = await prisma.showcasePostComment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true },
        });

        if (!commentExists) {
            throw new NotFoundException('Comment not found');
        }

        if (reporterId === commentExists.userId) {
            throw new BadRequestException('You cannot report your own comment');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'SHOWCASE_POST_COMMENT',
                reportedShowcaseCommentId: commentId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this comment');
        }

        return prisma.report.create({
            data: {
                resourceType: 'SHOWCASE_POST_COMMENT',
                reportedShowcaseCommentId: commentId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // SERVER REPORTS
    // ============================================

    async reportServer(reporterId: string, serverId: string, createReportDto: CreateReportDto) {
        const serverExists = await prisma.server.findUnique({
            where: { id: serverId },
            select: { id: true, ownerUserId: true },
        });

        if (!serverExists) {
            throw new NotFoundException('Server not found');
        }

        if (reporterId === serverExists.ownerUserId) {
            throw new BadRequestException('You cannot report your own server');
        }

        if (createReportDto.reason === 'OTHER' && !createReportDto.description) {
            throw new BadRequestException('Description is required when reason is OTHER');
        }

        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId,
                resourceType: 'SERVER',
                reportedServerId: serverId,
                status: { in: ['PENDING', 'UNDER_REVIEW'] },
            },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this server');
        }

        return prisma.report.create({
            data: {
                resourceType: 'SERVER',
                reportedServerId: serverId,
                reason: createReportDto.reason,
                description: createReportDto.description,
                reporterId,
            },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    // ============================================
    // USER METHODS (GET/CANCEL)
    // ============================================

    async getMyReports(userId: string) {
        return prisma.report.findMany({
            where: { reporterId: userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                resourceType: true,
                reason: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                handledAt: true,
                response: true,
                // Include reported entity info
                reportedUser: { select: { id: true, username: true, displayName: true } },
                reportedResource: { select: { id: true, name: true, slug: true } },
                reportedResourceVersion: { select: { id: true, versionNumber: true, resource: { select: { name: true } } } },
                reportedResourceComment: { select: { id: true, content: true } },
                reportedShowcasePost: { select: { id: true, title: true } },
                reportedShowcaseComment: { select: { id: true, content: true } },
                reportedServer: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async getMyReportById(userId: string, reportId: string) {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            select: {
                id: true,
                resourceType: true,
                reason: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                handledAt: true,
                response: true,
                reporterId: true,
                reportedUser: { select: { id: true, username: true, displayName: true } },
                reportedResource: { select: { id: true, name: true, slug: true } },
                reportedResourceVersion: { select: { id: true, versionNumber: true, resource: { select: { name: true } } } },
                reportedResourceComment: { select: { id: true, content: true } },
                reportedShowcasePost: { select: { id: true, title: true } },
                reportedShowcaseComment: { select: { id: true, content: true } },
                reportedServer: { select: { id: true, name: true, slug: true } },
            },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        if (report.reporterId !== userId) {
            throw new ForbiddenException('You do not have permission to view this report');
        }

        const { reporterId, ...reportData } = report;
        return reportData;
    }

    async cancelReport(userId: string, reportId: string) {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            select: { id: true, reporterId: true, status: true },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        if (report.reporterId !== userId) {
            throw new ForbiddenException('You do not have permission to cancel this report');
        }

        if (report.status !== 'PENDING') {
            throw new BadRequestException('Only pending reports can be canceled');
        }

        await prisma.report.delete({ where: { id: reportId } });

        return { message: 'Report canceled successfully' };
    }

    // ============================================
    // MODERATION METHODS
    // ============================================

    async getAllReports(moderatorId: string, status?: string) {
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
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: { id: true, username: true, displayName: true, email: true },
                },
                handler: {
                    select: { id: true, username: true, displayName: true },
                },
                reportedUser: { select: { id: true, username: true, displayName: true } },
                reportedResource: { select: { id: true, name: true, slug: true } },
                reportedResourceVersion: { select: { id: true, versionNumber: true, resource: { select: { name: true } } } },
                reportedResourceComment: { select: { id: true, content: true } },
                reportedShowcasePost: { select: { id: true, title: true } },
                reportedShowcaseComment: { select: { id: true, content: true } },
                reportedServer: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async getReportById(moderatorId: string, reportId: string) {
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
                    select: { id: true, username: true, displayName: true, email: true, createdAt: true },
                },
                handler: {
                    select: { id: true, username: true, displayName: true },
                },
                reportedUser: { select: { id: true, username: true, displayName: true, image: true } },
                reportedResource: { select: { id: true, name: true, slug: true, iconUrl: true } },
                reportedResourceVersion: { select: { id: true, versionNumber: true, resource: { select: { name: true, slug: true } } } },
                reportedResourceComment: { select: { id: true, content: true, user: { select: { username: true } } } },
                reportedShowcasePost: { select: { id: true, title: true, thumbnailUrl: true } },
                reportedShowcaseComment: { select: { id: true, content: true, user: { select: { username: true } } } },
                reportedServer: { select: { id: true, name: true, slug: true, logoUrl: true } },
            },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return report;
    }

    async moderateReport(moderatorId: string, reportId: string, moderateDto: ModerateReportDto) {
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (!moderator || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)) {
            throw new ForbiddenException('You do not have permission to moderate reports');
        }

        const report = await prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        if (report.status === 'RESOLVED' || report.status === 'DISMISSED') {
            throw new BadRequestException('This report has already been handled');
        }

        const statusMap = {
            [ReportAction.DISMISS]: 'DISMISSED',
            [ReportAction.RESOLVE]: 'RESOLVED',
            [ReportAction.UNDER_REVIEW]: 'UNDER_REVIEW',
        };

        const newStatus = statusMap[moderateDto.action];

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
                    select: { id: true, username: true, displayName: true },
                },
                handler: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }

    async deleteReport(moderatorId: string, reportId: string) {
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (!moderator || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)) {
            throw new ForbiddenException('You do not have permission to delete reports');
        }

        const report = await prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        await prisma.report.delete({ where: { id: reportId } });

        return { message: 'Report deleted successfully' };
    }
}