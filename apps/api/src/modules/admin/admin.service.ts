import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, UserRole, AccountStatus, ResourceStatus, ServerStatus, ReportStatus } from '@repo/db';
import { FilterUsersDto } from './dtos/filter-users.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { BanUserDto } from './dtos/ban-user.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';

@Injectable()
export class AdminService {
    // ============================================
    // STATISTICS
    // ============================================

    async getStats(adminUserId: string) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied');
        }

        // Get counts in parallel
        const [
            totalUsers,
            activeUsers,
            totalResources,
            pendingResources,
            totalServers,
            pendingServers,
            totalReports,
            pendingReports,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: AccountStatus.ACTIVE } }),
            prisma.resource.count(),
            prisma.resource.count({ where: { status: ResourceStatus.PENDING } }),
            prisma.server.count(),
            prisma.server.count({ where: { status: ServerStatus.PENDING } }),
            prisma.report.count(),
            prisma.report.count({ where: { status: ReportStatus.PENDING } }),
        ]);

        // Get user growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await prisma.user.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                new: newUsers,
            },
            resources: {
                total: totalResources,
                pending: pendingResources,
            },
            servers: {
                total: totalServers,
                pending: pendingServers,
            },
            reports: {
                total: totalReports,
                pending: pendingReports,
            },
        };
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    async getUsers(adminUserId: string, filterDto: FilterUsersDto) {
        // Verify admin has proper role (ADMIN or SUPER_ADMIN for user management)
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied - Admin role required');
        }

        const { search, role, status, page = 1, limit = 20 } = filterDto;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        // Get users and total count
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    displayName: true,
                    image: true,
                    role: true,
                    status: true,
                    banned: true,
                    banReason: true,
                    bannedAt: true,
                    createdAt: true,
                    lastLoginAt: true,
                    _count: {
                        select: {
                            ownedResources: true,
                            showcasePosts: true,
                            submittedReports: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateUserRole(adminUserId: string, userId: string, updateDto: UpdateUserRoleDto) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied - Admin role required');
        }

        // Can't modify Super Admin unless you are Super Admin
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (targetUser.role === UserRole.SUPER_ADMIN && admin.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only Super Admins can modify Super Admin roles');
        }

        // Can't assign Super Admin unless you are Super Admin
        if (updateDto.role === UserRole.SUPER_ADMIN && admin.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only Super Admins can assign Super Admin role');
        }

        // Can't modify yourself
        if (userId === adminUserId) {
            throw new BadRequestException('Cannot modify your own role');
        }

        return prisma.user.update({
            where: { id: userId },
            data: { role: updateDto.role },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                role: true,
            },
        });
    }

    async banUser(adminUserId: string, userId: string, banDto: BanUserDto) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied - Admin role required');
        }

        // Can't ban yourself
        if (userId === adminUserId) {
            throw new BadRequestException('Cannot ban yourself');
        }

        // Can't ban Super Admin unless you are Super Admin
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (targetUser.role === UserRole.SUPER_ADMIN && admin.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only Super Admins can ban Super Admins');
        }

        // Validate reason is provided when banning
        if (banDto.banned && !banDto.reason) {
            throw new BadRequestException('Reason is required when banning a user');
        }

        return prisma.user.update({
            where: { id: userId },
            data: {
                banned: banDto.banned,
                banReason: banDto.banned ? banDto.reason : null,
                bannedAt: banDto.banned ? new Date() : null,
                bannedBy: banDto.banned ? adminUserId : null,
                status: banDto.banned ? AccountStatus.BANNED : AccountStatus.ACTIVE,
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                banned: true,
                banReason: true,
                bannedAt: true,
                status: true,
            },
        });
    }

    async updateUserStatus(adminUserId: string, userId: string, updateDto: UpdateUserStatusDto) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied - Admin role required');
        }

        // Can't modify yourself
        if (userId === adminUserId) {
            throw new BadRequestException('Cannot modify your own status');
        }

        return prisma.user.update({
            where: { id: userId },
            data: { status: updateDto.status },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                status: true,
            },
        });
    }

    // ============================================
    // MODERATION OVERVIEW
    // ============================================

    async getModerationOverview(adminUserId: string) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied');
        }

        // Get pending items
        const [pendingReports, pendingResources, pendingServers] = await Promise.all([
            prisma.report.count({
                where: {
                    status: {
                        in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW],
                    },
                },
            }),
            prisma.resource.count({
                where: { status: ResourceStatus.PENDING },
            }),
            prisma.server.count({
                where: { status: ServerStatus.PENDING },
            }),
        ]);

        // Get recent activity
        const recentReports = await prisma.report.findMany({
            where: {
                status: {
                    in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW],
                },
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                resourceType: true,
                reason: true,
                status: true,
                createdAt: true,
                reporter: {
                    select: {
                        username: true,
                        image: true,
                    },
                },
            },
        });

        return {
            counts: {
                pendingReports,
                pendingResources,
                pendingServers,
                total: pendingReports + pendingResources + pendingServers,
            },
            recentReports,
        };
    }

    // ============================================
    // RESOURCE VERSION MODERATION
    // ============================================

    async getPendingResourceVersions(adminUserId: string) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied');
        }

        // Get all pending versions with their resource info
        const pendingVersions = await prisma.resourceVersion.findMany({
            where: {
                status: ResourceStatus.PENDING,
            },
            include: {
                resource: {
                    include: {
                        ownerUser: {
                            select: {
                                username: true,
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Check if each version is the first version for its resource
        const versionsWithFlags = await Promise.all(
            pendingVersions.map(async (version) => {
                // Count approved versions for this resource
                const approvedVersionsCount = await prisma.resourceVersion.count({
                    where: {
                        resourceId: version.resourceId,
                        status: ResourceStatus.APPROVED,
                    },
                });

                return {
                    ...version,
                    isFirstVersion: approvedVersionsCount === 0,
                };
            })
        );

        return versionsWithFlags;
    }

    async moderateResourceVersion(
        adminUserId: string,
        versionId: string,
        action: 'APPROVE' | 'REJECT',
        reason?: string,
    ) {
        // Verify admin has proper role
        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            select: { role: true },
        });

        if (!admin || ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(admin.role as any)) {
            throw new ForbiddenException('Access denied');
        }

        // Get the version with resource info
        const version = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
            include: {
                resource: true,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        if (version.status !== ResourceStatus.PENDING) {
            throw new BadRequestException('Version is not pending moderation');
        }

        // Check if this is the first version (no approved versions exist)
        const approvedVersionsCount = await prisma.resourceVersion.count({
            where: {
                resourceId: version.resourceId,
                status: ResourceStatus.APPROVED,
            },
        });

        const isFirstVersion = approvedVersionsCount === 0;

        if (action === 'APPROVE') {
            // Update version status
            await prisma.resourceVersion.update({
                where: { id: versionId },
                data: {
                    status: ResourceStatus.APPROVED,
                    publishedAt: new Date(),
                },
            });

            // If this is the first version, update resource status to APPROVED and set as latest
            if (isFirstVersion && version.resource.status === ResourceStatus.PENDING) {
                await prisma.resource.update({
                    where: { id: version.resourceId },
                    data: {
                        status: ResourceStatus.APPROVED,
                        latestVersionId: versionId,
                    },
                });
            } else {
                // For subsequent versions, just update latestVersionId
                await prisma.resource.update({
                    where: { id: version.resourceId },
                    data: {
                        latestVersionId: versionId,
                    },
                });
            }

            return {
                success: true,
                message: isFirstVersion
                    ? 'Version approved and resource published'
                    : 'Version approved',
            };
        } else if (action === 'REJECT') {
            if (!reason) {
                throw new BadRequestException('Rejection reason is required');
            }

            // Update version status with rejection
            // Note: rejection reason should be communicated to user separately
            await prisma.resourceVersion.update({
                where: { id: versionId },
                data: {
                    status: ResourceStatus.REJECTED,
                },
            });

            // If this was the first version and resource is still PENDING, 
            // the resource stays PENDING (waiting for a new version)
            // We don't automatically reject the resource

            return {
                success: true,
                message: 'Version rejected',
            };
        }

        throw new BadRequestException('Invalid action');
    }
}
