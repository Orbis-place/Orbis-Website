import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { StorageService } from '../storage/storage.service';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { FilterServersDto, ServerSortOption } from './dtos/filter-servers.dto';
import { prisma, ServerStatus } from '@repo/db';

@Injectable()
export class ServerService {
    constructor(

        private readonly storage: StorageService,
    ) {
    }

    /**
     * Create a new server
     */
    async create(userId: string, createDto: CreateServerDto) {
        // Verify primary category exists
        const primaryCategory = await prisma.serverCategory.findUnique({
            where: { id: createDto.primaryCategoryId },
        });

        if (!primaryCategory) {
            throw new BadRequestException('Primary category not found');
        }

        // Verify all category IDs exist
        if (createDto.categoryIds && createDto.categoryIds.length > 0) {
            const categories = await prisma.serverCategory.findMany({
                where: { id: { in: createDto.categoryIds } },
            });

            if (categories.length !== createDto.categoryIds.length) {
                throw new BadRequestException('One or more categories not found');
            }

            // Check max 3 categories total
            const totalCategories = new Set([
                createDto.primaryCategoryId,
                ...createDto.categoryIds,
            ]);
            if (totalCategories.size > 3) {
                throw new BadRequestException('Maximum 3 categories allowed');
            }
        }

        // Verify all tag IDs exist (if provided)
        if (createDto.tagIds && createDto.tagIds.length > 0) {
            if (createDto.tagIds.length > 10) {
                throw new BadRequestException('Maximum 10 tags allowed');
            }

            const tags = await prisma.serverTag.findMany({
                where: { id: { in: createDto.tagIds } },
            });

            if (tags.length !== createDto.tagIds.length) {
                throw new BadRequestException('One or more tags not found');
            }
        }

        // Verify team ownership if teamId provided
        if (createDto.teamId) {
            const team = await prisma.team.findUnique({
                where: { id: createDto.teamId },
                include: {
                    members: {
                        where: {
                            userId,
                            role: { in: ['OWNER', 'ADMIN'] },
                        },
                    },
                },
            });

            if (!team || team.members.length === 0) {
                throw new ForbiddenException(
                    'You must be a team owner or admin to create servers for this team',
                );
            }
        }

        // Validate slug uniqueness
        const slug = await this.generateUniqueSlug(createDto.slug);
        if (slug !== createDto.slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
            throw new ConflictException('Slug is already taken');
        }

        // Create server
        const server = await prisma.server.create({
            data: {
                name: createDto.name,
                slug,
                description: createDto.description || '',
                shortDesc: createDto.shortDesc,
                serverAddress: createDto.serverAddress,
                gameVersion: createDto.gameVersion,
                supportedVersions: createDto.supportedVersions || [
                    '0.0.1',
                ],
                websiteUrl: createDto.websiteUrl,
                country: createDto.country,
                ownerUserId: userId,
                ownerTeamId: createDto.teamId,
                status: ServerStatus.PENDING,

                // Create category relations
                categories: {
                    create: [
                        // Primary category
                        {
                            categoryId: createDto.primaryCategoryId,
                            isPrimary: true,
                        },
                        // Additional categories
                        ...(createDto.categoryIds
                            ?.filter((id) => id !== createDto.primaryCategoryId)
                            .map((id) => ({
                                categoryId: id,
                                isPrimary: false,
                            })) || []),
                    ],
                },

                // Create tag relations (if provided)
                ...(createDto.tagIds && createDto.tagIds.length > 0
                    ? {
                        tags: {
                            create: createDto.tagIds.map((tagId) => ({
                                tagId,
                            })),
                        },
                    }
                    : {}),

                // Create status history
                statusHistory: {
                    create: {
                        oldStatus: null,
                        newStatus: ServerStatus.PENDING,
                        reason: 'Server created',
                    },
                },
            },
            include: {
                ownerUser: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                ownerTeam: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        logo: true,
                        banner: true,
                    },
                },
                categories: {
                    include: {
                        category: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        return server;
    }

    /**
     * Find all servers with filters and pagination
     */
    async findAll(filterDto: FilterServersDto) {
        const {
            search,
            category,
            tags,
            gameVersion,
            online,
            featured,
            verified,
            minPlayers,
            maxPlayers,
            sortBy,
            page = 1,
            limit = 20,
        } = filterDto;

        // Build WHERE conditions
        const where: any = {
            status: ServerStatus.APPROVED,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (category) {
            where.categories = {
                some: {
                    category: { slug: category },
                },
            };
        }

        if (tags && tags.length > 0) {
            where.tags = {
                some: {
                    tag: {
                        slug: { in: tags },
                    },
                },
            };
        }

        if (gameVersion) {
            where.supportedVersions = {
                has: gameVersion,
            };
        }

        if (online !== undefined) {
            where.isOnline = online;
        }

        if (featured !== undefined) {
            where.featured = featured;
        }

        if (verified !== undefined) {
            where.verified = verified;
        }

        if (minPlayers !== undefined) {
            where.currentPlayers = { gte: minPlayers };
        }

        if (maxPlayers !== undefined) {
            where.currentPlayers = { ...where.currentPlayers, lte: maxPlayers };
        }

        // Build orderBy
        const orderBy = this.buildOrderBy(sortBy);

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const [servers, total] = await Promise.all([
            prisma.server.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    ownerUser: {
                        select: {
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    categories: {
                        where: { isPrimary: true },
                        include: {
                            category: true,
                        },
                        take: 1,
                    },
                    tags: {
                        include: {
                            tag: {
                                select: {
                                    name: true,
                                    slug: true,
                                    color: true,
                                },
                            },
                        },
                        take: 3,
                    },
                },
            }),
            prisma.server.count({ where }),
        ]);

        // Return with pagination meta
        return {
            data: servers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrevious: page > 1,
            },
        };
    }

    /**
     * Find server by slug
     */
    async findBySlug(slug: string, userId?: string) {
        const server = await prisma.server.findUnique({
            where: { slug },
            include: {
                ownerUser: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                        reputation: true,
                    },
                },
                ownerTeam: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        banner: true,
                    },
                },
                categories: {
                    include: {
                        category: true,
                    },
                    orderBy: {
                        isPrimary: 'desc',
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                statusHistory: {
                    orderBy: {
                        changedAt: 'desc',
                    },
                    take: 10,
                    include: {
                        changer: {
                            select: {
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!server) {
            throw new NotFoundException(`Server not found`);
        }

        // Check if user has access to this server
        const hasAccess = await this.checkServerAccess(server, userId);
        if (!hasAccess) {
            throw new NotFoundException('Server not found');
        }

        return server;
    }

    /**
     * Find server by ID (internal use)
     */
    async findById(serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            include: {
                ownerUser: true,
                ownerTeam: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        return server;
    }

    /**
     * Update server
     */
    async update(userId: string, serverId: string, updateDto: UpdateServerDto) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        // Check ownership
        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        // Update basic fields
        const updateData: any = {};

        if (updateDto.name !== undefined) updateData.name = updateDto.name;
        if (updateDto.description !== undefined)
            updateData.description = updateDto.description;
        if (updateDto.shortDesc !== undefined)
            updateData.shortDesc = updateDto.shortDesc;
        if (updateDto.serverAddress !== undefined)
            updateData.serverAddress = updateDto.serverAddress;
        if (updateDto.gameVersion !== undefined)
            updateData.gameVersion = updateDto.gameVersion;
        if (updateDto.supportedVersions !== undefined)
            updateData.supportedVersions = updateDto.supportedVersions;
        if (updateDto.websiteUrl !== undefined)
            updateData.websiteUrl = updateDto.websiteUrl;
        if (updateDto.country !== undefined)
            updateData.country = updateDto.country;

        const updated = await prisma.server.update({
            where: { id: serverId },
            data: updateData,
            include: {
                ownerUser: true,
                categories: { include: { category: true } },
                tags: { include: { tag: true } },
            },
        });

        return updated;
    }

    /**
     * Delete server (archive or hard delete based on history)
     */
    async delete(userId: string, serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, logo: true, banner: true, status: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to delete this server');
        }

        // Check if server has player history
        const hasPlayerHistory = await prisma.serverPlayerHistory.count({
            where: { serverId },
        }) > 0;

        // Delete files
        if (server.logo) {
            await this.storage.deleteFile(server.logo).catch(() => {
            });
        }
        if (server.banner) {
            await this.storage.deleteFile(server.banner).catch(() => {
            });
        }

        if (hasPlayerHistory) {
            // Archive if there is player history
            await prisma.server.update({
                where: { id: serverId },
                data: {
                    status: ServerStatus.ARCHIVED,
                    statusHistory: {
                        create: {
                            oldStatus: server.status,
                            newStatus: ServerStatus.ARCHIVED,
                            changedBy: userId,
                            reason: 'Server archived by owner',
                        },
                    },
                },
            });

            return { message: 'Server archived successfully' };
        } else {
            // Hard delete if no player history
            await prisma.server.delete({
                where: { id: serverId },
            });

            return { message: 'Server deleted successfully' };
        }
    }

    /**
     * Upload server logo
     */
    async uploadLogo(userId: string, serverId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, and WebP are allowed',
            );
        }

        // Max 2MB
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 2MB');
        }

        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, logo: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        const logoUrl = await this.storage.uploadFile(
            file,
            `servers/${serverId}/logo`,
        );

        const updated = await prisma.server.update({
            where: { id: serverId },
            data: { logo: logoUrl },
        });

        // Delete old logo
        if (server.logo) {
            await this.storage.deleteFile(server.logo).catch(() => {
            });
        }

        return updated;
    }

    /**
     * Upload server banner
     */
    async uploadBanner(
        userId: string,
        serverId: string,
        file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, and WebP are allowed',
            );
        }

        // Max 5MB
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 5MB');
        }

        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, banner: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        const bannerUrl = await this.storage.uploadFile(
            file,
            `servers/${serverId}/banner`,
        );

        const updated = await prisma.server.update({
            where: { id: serverId },
            data: { banner: bannerUrl },
        });

        // Delete old banner
        if (server.banner) {
            await this.storage.deleteFile(server.banner).catch(() => {
            });
        }

        return updated;
    }

    /**
     * Delete server logo
     */
    async deleteLogo(userId: string, serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, logo: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        if (server.logo) {
            await this.storage.deleteFile(server.logo);
        }

        return prisma.server.update({
            where: { id: serverId },
            data: { logo: null },
        });
    }

    /**
     * Delete server banner
     */
    async deleteBanner(userId: string, serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, banner: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        if (server.banner) {
            await this.storage.deleteFile(server.banner);
        }

        return prisma.server.update({
            where: { id: serverId },
            data: { banner: null },
        });
    }

    /**
     * Approve server (Admin only)
     */
    async approve(adminId: string, serverId: string, reason?: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { status: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        if (server.status === ServerStatus.APPROVED) {
            throw new ConflictException('Server is already approved');
        }

        return prisma.server.update({
            where: { id: serverId },
            data: {
                status: ServerStatus.APPROVED,
                approvedAt: new Date(),
                approvedBy: adminId,
                publishedAt: new Date(),
                rejectionReason: null,
                statusHistory: {
                    create: {
                        oldStatus: server.status,
                        newStatus: ServerStatus.APPROVED,
                        changedBy: adminId,
                        reason: reason || 'Server approved',
                    },
                },
            },
        });
    }

    /**
     * Reject server (Admin only)
     */
    async reject(adminId: string, serverId: string, reason: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { status: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        return prisma.server.update({
            where: { id: serverId },
            data: {
                status: ServerStatus.REJECTED,
                rejectionReason: reason,
                statusHistory: {
                    create: {
                        oldStatus: server.status,
                        newStatus: ServerStatus.REJECTED,
                        changedBy: adminId,
                        reason,
                    },
                },
            },
        });
    }

    /**
     * Suspend server (Admin only)
     */
    async suspend(adminId: string, serverId: string, reason: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { status: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        return prisma.server.update({
            where: { id: serverId },
            data: {
                status: ServerStatus.SUSPENDED,
                statusHistory: {
                    create: {
                        oldStatus: server.status,
                        newStatus: ServerStatus.SUSPENDED,
                        changedBy: adminId,
                        reason,
                    },
                },
            },
        });
    }

    /**
     * Get user's servers
     */
    async getUserServers(userId: string, requestingUserId?: string) {
        // Build where clause
        const where: any = {
            ownerUserId: userId,
        };

        // If viewing another user's servers, only show APPROVED servers
        if (requestingUserId !== userId) {
            where.status = ServerStatus.APPROVED;
        }

        return prisma.server.findMany({
            where,
            include: {
                categories: {
                    where: { isPrimary: true },
                    include: { category: true },
                },
                tags: {
                    include: { tag: true },
                    take: 3,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Generate unique slug
     */
    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let unique = slug;
        let counter = 1;

        while (await prisma.server.findUnique({ where: { slug: unique } })) {
            unique = `${slug}-${counter}`;
            counter++;
        }

        return unique;
    }

    /**
     * Check edit permission
     */
    private async checkEditPermission(
        userId: string,
        server: { ownerUserId?: string | null; ownerTeamId?: string | null },
    ): Promise<boolean> {
        // Direct owner
        if (server.ownerUserId === userId) {
            return true;
        }

        // Team member with permission
        if (server.ownerTeamId) {
            const member = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: server.ownerTeamId,
                        userId,
                    },
                },
            });

            if (member && ['OWNER', 'ADMIN'].includes(member.role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a user can access a server (based on status and ownership)
     * Returns true if:
     * - Server status is APPROVED
     * - User is the server owner
     * - User is a member of the server's team
     */
    private async checkServerAccess(
        server: { status: ServerStatus; ownerUserId?: string | null; ownerTeamId?: string | null },
        userId?: string,
    ): Promise<boolean> {
        // If server is approved, everyone can access it
        if (server.status === ServerStatus.APPROVED) {
            return true;
        }

        // If no user is logged in, deny access to non-approved servers
        if (!userId) {
            return false;
        }

        // If user is the server owner, allow access
        if (server.ownerUserId === userId) {
            return true;
        }

        // If server belongs to a team, check if user is a team member
        if (server.ownerTeamId) {
            const member = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: server.ownerTeamId,
                        userId,
                    },
                },
            });

            // Any team member can view the server
            if (member) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build orderBy for filters
     */
    private buildOrderBy(sortBy?: ServerSortOption) {
        switch (sortBy) {
            case ServerSortOption.VOTES:
                return { voteCount: 'desc' as const };
            case ServerSortOption.PLAYERS:
                return { currentPlayers: 'desc' as const };
            case ServerSortOption.NEWEST:
                return { createdAt: 'desc' as const };
            case ServerSortOption.OLDEST:
                return { createdAt: 'asc' as const };
            case ServerSortOption.NAME_ASC:
                return { name: 'asc' as const };
            case ServerSortOption.NAME_DESC:
                return { name: 'desc' as const };
            default:
                return { voteCount: 'desc' as const };
        }
    }

    /**
     * Transfer server ownership
     */
    async transferOwnership(
        serverId: string,
        userId: string,
        transferToUserId?: string,
        transferToTeamId?: string,
    ) {
        // Validate exactly one target is provided
        if (!transferToUserId && !transferToTeamId) {
            throw new BadRequestException('Either transferToUserId or transferToTeamId must be provided');
        }
        if (transferToUserId && transferToTeamId) {
            throw new BadRequestException('Cannot provide both transferToUserId and transferToTeamId');
        }

        // Get current server
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: {
                id: true,
                name: true,
                ownerUserId: true,
                ownerTeamId: true,
            },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        // Check permission: must be current owner or team owner/admin
        const hasPermission = await this.checkEditPermission(userId, server);
        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to transfer this server');
        }

        // Transfer to user
        if (transferToUserId) {
            // Verify new owner exists
            const newOwner = await prisma.user.findUnique({
                where: { id: transferToUserId },
                select: { id: true, username: true },
            });

            if (!newOwner) {
                throw new NotFoundException('Target user not found');
            }

            // Update ownership
            const updatedServer = await prisma.server.update({
                where: { id: serverId },
                data: {
                    ownerUserId: transferToUserId,
                    ownerTeamId: null,
                },
                include: {
                    ownerUser: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    ownerTeam: {
                        select: {
                            id: true,
                            slug: true,
                            name: true,
                            logo: true,
                        },
                    },
                },
            });

            return {
                message: `Server ownership transferred to user ${newOwner.username}`,
                server: updatedServer,
            };
        }

        // Transfer to team
        if (transferToTeamId) {
            // Verify team exists
            const team = await prisma.team.findUnique({
                where: { id: transferToTeamId },
                include: {
                    members: {
                        where: {
                            userId,
                            role: { in: ['OWNER', 'ADMIN'] },
                        },
                    },
                },
            });

            if (!team) {
                throw new NotFoundException('Target team not found');
            }

            // Verify user is team owner/admin
            if (team.members.length === 0) {
                throw new ForbiddenException(
                    'You must be a team owner or admin to transfer servers to this team',
                );
            }

            // Update ownership
            const updatedServer = await prisma.server.update({
                where: { id: serverId },
                data: {
                    ownerUserId: null,
                    ownerTeamId: transferToTeamId,
                },
                include: {
                    ownerUser: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    ownerTeam: {
                        select: {
                            id: true,
                            slug: true,
                            name: true,
                            logo: true,
                        },
                    },
                },
            });

            return {
                message: `Server ownership transferred to team ${team.name}`,
                server: updatedServer,
            };
        }
    }

    // ============================================
    // SOCIAL LINKS MANAGEMENT
    // ============================================

    /**
     * Get server social links
     */
    async getSocialLinks(serverId: string) {
        return prisma.serverSocialLink.findMany({
            where: { serverId },
            orderBy: { order: 'asc' },
        });
    }

    /**
     * Create server social link
     */
    async createSocialLink(
        userId: string,
        serverId: string,
        createDto: { type: string; url: string; label?: string },
    ) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        // Check if link type already exists
        const existing = await prisma.serverSocialLink.findUnique({
            where: {
                serverId_type: {
                    serverId,
                    type: createDto.type as any,
                },
            },
        });

        if (existing) {
            throw new ConflictException('A social link of this type already exists');
        }

        // Get current max order
        const maxOrder = await prisma.serverSocialLink.findFirst({
            where: { serverId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        return prisma.serverSocialLink.create({
            data: {
                serverId,
                type: createDto.type as any,
                url: createDto.url,
                label: createDto.label,
                order: maxOrder ? maxOrder.order + 1 : 0,
            },
        });
    }

    /**
     * Update server social link
     */
    async updateSocialLink(
        userId: string,
        serverId: string,
        linkId: string,
        updateDto: { url?: string; label?: string },
    ) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        const link = await prisma.serverSocialLink.findUnique({
            where: { id: linkId },
        });

        if (!link || link.serverId !== serverId) {
            throw new NotFoundException('Social link not found');
        }

        return prisma.serverSocialLink.update({
            where: { id: linkId },
            data: updateDto,
        });
    }

    /**
     * Delete server social link
     */
    async deleteSocialLink(userId: string, serverId: string, linkId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        const link = await prisma.serverSocialLink.findUnique({
            where: { id: linkId },
        });

        if (!link || link.serverId !== serverId) {
            throw new NotFoundException('Social link not found');
        }

        await prisma.serverSocialLink.delete({
            where: { id: linkId },
        });

        return { message: 'Social link deleted successfully' };
    }

    /**
     * Reorder server social links
     */
    async reorderSocialLinks(userId: string, serverId: string, linkIds: string[]) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        // Verify all links belong to this server
        const links = await prisma.serverSocialLink.findMany({
            where: { id: { in: linkIds } },
        });

        if (links.some((link) => link.serverId !== serverId)) {
            throw new BadRequestException('Some links do not belong to this server');
        }

        // Update order for each link
        await Promise.all(
            linkIds.map((linkId, index) =>
                prisma.serverSocialLink.update({
                    where: { id: linkId },
                    data: { order: index },
                }),
            ),
        );

        return this.getSocialLinks(serverId);
    }
}