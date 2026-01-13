import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@repo/db';

import { StorageService } from '../storage/storage.service';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { FilterServersDto, ServerSortOption } from './dtos/filter-servers.dto';
import { prisma, ServerStatus } from '@repo/db';
import { ServerDescriptionImageService } from './server-description-image.service';

@Injectable()
export class ServerService {
    constructor(
        private readonly storage: StorageService,
        private readonly descriptionImageService: ServerDescriptionImageService,
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

        // Verify gameVersion exists (if provided)
        if (createDto.gameVersionId) {
            const gameVersion = await prisma.hytaleVersion.findUnique({
                where: { id: createDto.gameVersionId },
            });

            if (!gameVersion) {
                throw new BadRequestException('Game version not found');
            }
        }

        // Verify all supported version IDs exist (if provided)
        if (createDto.supportedVersionIds && createDto.supportedVersionIds.length > 0) {
            const versions = await prisma.hytaleVersion.findMany({
                where: { id: { in: createDto.supportedVersionIds } },
            });

            if (versions.length !== createDto.supportedVersionIds.length) {
                throw new BadRequestException('One or more supported versions not found');
            }
        }

        // Validate slug uniqueness
        const slug = await this.generateUniqueSlug(createDto.slug);
        if (slug !== createDto.slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
            throw new ConflictException('Slug is already taken');
        }

        // Use transaction to handle tag usage count updates
        const server = await prisma.$transaction(async (tx) => {
            // Handle tags - combine tagIds and tagNames
            let allTagIds: string[] = [];

            // Add existing tag IDs
            if (createDto.tagIds && createDto.tagIds.length > 0) {
                allTagIds = [...createDto.tagIds];
            }

            // Create/find tags from names
            if (createDto.tagNames && createDto.tagNames.length > 0) {
                const createdTags = await this.findOrCreateServerTags(createDto.tagNames, tx);
                allTagIds = [...allTagIds, ...createdTags.map(t => t.id)];
            }

            // Verify max 10 tags total
            if (allTagIds.length > 10) {
                throw new BadRequestException('Maximum 10 tags allowed');
            }

            // Create server
            const newServer = await tx.server.create({
                data: {
                    name: createDto.name,
                    slug,
                    description: createDto.description || '',
                    shortDesc: createDto.shortDesc,
                    serverAddress: createDto.serverAddress,
                    gameVersionId: createDto.gameVersionId,
                    websiteUrl: createDto.websiteUrl,
                    country: createDto.country,
                    // Set either ownerUserId (personal) or ownerTeamId (team), never both
                    ownerUserId: createDto.teamId ? null : userId,
                    ownerTeamId: createDto.teamId || null,
                    status: ServerStatus.DRAFT,

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

                    // Create tag relations
                    ...(allTagIds.length > 0
                        ? {
                            tags: {
                                create: allTagIds.map((tagId) => ({
                                    tagId,
                                })),
                            },
                        }
                        : {}),

                    // Create supported version relations (if provided)
                    ...(createDto.supportedVersionIds && createDto.supportedVersionIds.length > 0
                        ? {
                            supportedVersions: {
                                create: createDto.supportedVersionIds.map((hytaleVersionId) => ({
                                    hytaleVersionId,
                                })),
                            },
                        }
                        : {}),

                    // Create status history
                    statusHistory: {
                        create: {
                            oldStatus: null,
                            newStatus: ServerStatus.DRAFT,
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

            // Increment usage count for each assigned tag
            if (allTagIds.length > 0) {
                for (const tagId of allTagIds) {
                    await this.updateTagUsageCount(tagId, true, tx);
                }
            }

            // Increment usage count for each assigned category
            const allCategoryIds = [createDto.primaryCategoryId, ...(createDto.categoryIds || [])];
            for (const categoryId of allCategoryIds) {
                await this.updateCategoryUsageCount(categoryId, true, tx);
            }

            return newServer;
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
                        include: {
                            category: true,
                        },
                        orderBy: {
                            isPrimary: 'desc',
                        },
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
                socialLinks: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                gameVersion: true,
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

        // Check if user is owner (can edit the server)
        let isOwner = false;
        if (userId) {
            isOwner = await this.checkEditPermission(userId, server);
        }

        return this.transformServerResponse(server, isOwner);
    }

    /**
     * Transform server response to match frontend expectations
     */
    private transformServerResponse(server: any, isOwner: boolean) {
        // Parse serverAddress into serverIp and port
        const [serverIp, port] = server.serverAddress?.includes(':')
            ? server.serverAddress.split(':')
            : [server.serverAddress, '5520']; // Default Hytale port

        // Flatten socialLinks array into direct properties
        const discordUrl = server.socialLinks?.find((l: any) => l.type === 'DISCORD')?.url;
        const youtubeUrl = server.socialLinks?.find((l: any) => l.type === 'YOUTUBE')?.url;
        const twitterUrl = server.socialLinks?.find((l: any) => l.type === 'TWITTER')?.url;
        const tiktokUrl = server.socialLinks?.find((l: any) => l.type === 'TIKTOK')?.url;

        return {
            ...server,
            serverIp,
            port: parseInt(port) || 5520,
            discordUrl,
            youtubeUrl,
            twitterUrl,
            tiktokUrl,
            isOwner,
            // Map database field names to frontend expectations
            onlineStatus: server.isOnline,
            gameVersion: server.gameVersion?.version || 'Unknown',
        };
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

        // Use transaction for atomic updates
        const updated = await prisma.$transaction(async (tx) => {
            // Handle Tags - Remove
            if (updateDto.removeTags && updateDto.removeTags.length > 0) {
                // Find tags by name or slug
                const tagsToRemove = await tx.serverTag.findMany({
                    where: {
                        OR: [
                            { name: { in: updateDto.removeTags } },
                            { slug: { in: updateDto.removeTags.map(t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) } },
                        ],
                    },
                });

                const tagIdsToRemove = tagsToRemove.map(t => t.id);

                if (tagIdsToRemove.length > 0) {
                    // Delete relations
                    await tx.serverTagRelation.deleteMany({
                        where: {
                            serverId: serverId,
                            tagId: { in: tagIdsToRemove },
                        },
                    });

                    // Decrement usage counters and delete if 0
                    for (const tag of tagsToRemove) {
                        await this.updateTagUsageCount(tag.id, false, tx);

                        // Check if usage count is now 0
                        const updatedTag = await tx.serverTag.findUnique({
                            where: { id: tag.id },
                            select: { usageCount: true },
                        });

                        // Delete tag if no longer used
                        if (updatedTag && updatedTag.usageCount <= 0) {
                            await tx.serverTag.delete({
                                where: { id: tag.id },
                            });
                        }
                    }
                }
            }

            // Handle Tags - Add
            if (updateDto.addTags && updateDto.addTags.length > 0) {
                // Find or create tags
                const tags = await this.findOrCreateServerTags(updateDto.addTags, tx);

                // Check current tag count
                const currentTagCount = await tx.serverTagRelation.count({
                    where: { serverId: serverId },
                });

                let newTagsCount = 0;
                for (const tag of tags) {
                    const existing = await tx.serverTagRelation.findUnique({
                        where: {
                            serverId_tagId: {
                                serverId: serverId,
                                tagId: tag.id,
                            },
                        },
                    });
                    if (!existing) {
                        newTagsCount++;
                    }
                }

                // Enforce max 10 tags
                if (currentTagCount + newTagsCount > 10) {
                    throw new BadRequestException(
                        `Cannot add tags: server would have ${currentTagCount + newTagsCount} tags (max 10 allowed)`
                    );
                }

                // Create tag relations and update counters
                for (const tag of tags) {
                    const existing = await tx.serverTagRelation.findUnique({
                        where: {
                            serverId_tagId: {
                                serverId: serverId,
                                tagId: tag.id,
                            },
                        },
                    });

                    if (!existing) {
                        // Create relation
                        await tx.serverTagRelation.create({
                            data: {
                                serverId: serverId,
                                tagId: tag.id,
                            },
                        });

                        // Increment usage counter
                        await this.updateTagUsageCount(tag.id, true, tx);
                    }
                }
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
            if (updateDto.gameVersionId !== undefined)
                updateData.gameVersionId = updateDto.gameVersionId;
            if (updateDto.websiteUrl !== undefined)
                updateData.websiteUrl = updateDto.websiteUrl;
            if (updateDto.country !== undefined)
                updateData.country = updateDto.country;

            // Handle Categories
            if (updateDto.categoryIds && updateDto.primaryCategoryId) {
                // Verify primary category exists
                const primaryCategory = await prisma.serverCategory.findUnique({
                    where: { id: updateDto.primaryCategoryId },
                });

                if (!primaryCategory) {
                    throw new BadRequestException('Primary category not found');
                }

                // Verify all category IDs exist
                const categories = await prisma.serverCategory.findMany({
                    where: { id: { in: updateDto.categoryIds } },
                });

                if (categories.length !== updateDto.categoryIds.length) {
                    throw new BadRequestException('One or more categories not found');
                }

                // Check max 3 categories total
                const totalCategories = new Set([
                    updateDto.primaryCategoryId,
                    ...updateDto.categoryIds,
                ]);
                if (totalCategories.size > 3) {
                    throw new BadRequestException('Maximum 3 categories allowed');
                }

                // Delete existing relations
                await tx.serverCategoryRelation.deleteMany({
                    where: { serverId: serverId },
                });

                // Decrement usage counts for old categories
                // Note: Ideally we should track which ones were removed, but for simplicity we can just recalculate all
                // Or better: fetch old categories before delete, compare, and update counts.
                // For now, let's just re-implement the count update logic properly later or assume the count is global.
                // Actually, let's do it right:
                // 1. Get old categories
                const oldRelations = await prisma.serverCategoryRelation.findMany({
                    where: { serverId: serverId },
                    select: { categoryId: true },
                });
                for (const rel of oldRelations) {
                    await this.updateCategoryUsageCount(rel.categoryId, false, tx);
                }

                // Create new relations
                await tx.serverCategoryRelation.createMany({
                    data: [
                        // Primary category
                        {
                            serverId: serverId,
                            categoryId: updateDto.primaryCategoryId,
                            isPrimary: true,
                        },
                        // Additional categories
                        ...(updateDto.categoryIds
                            .filter((id) => id !== updateDto.primaryCategoryId)
                            .map((id) => ({
                                serverId: serverId,
                                categoryId: id,
                                isPrimary: false,
                            }))),
                    ],
                });

                // Increment usage counts for new categories
                for (const categoryId of totalCategories) {
                    await this.updateCategoryUsageCount(categoryId, true, tx);
                }
            } else if (updateDto.categoryIds || updateDto.primaryCategoryId) {
                throw new BadRequestException('Both categoryIds and primaryCategoryId must be provided together');
            }

            // TODO: Handle supportedVersionIds via separate endpoint for managing version relations

            return tx.server.update({
                where: { id: serverId },
                data: updateData,
                include: {
                    ownerUser: true,
                    categories: { include: { category: true } },
                    tags: { include: { tag: true } },
                    gameVersion: true,
                    supportedVersions: {
                        include: {
                            hytaleVersion: true,
                        },
                    },
                },
            });
        });

        // Validate description images if description changed
        if (updateDto.description) {
            await this.descriptionImageService.validateImagesInDescription(
                serverId,
                userId,
                updateDto.description
            );
        }

        return updated;
    }

    /**
     * Delete server (archive or hard delete based on history)
     */
    async delete(userId: string, serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, logoUrl: true, bannerUrl: true, status: true },
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
        if (server.logoUrl) {
            await this.storage.deleteFile(server.logoUrl).catch(() => {
            });
        }
        if (server.bannerUrl) {
            await this.storage.deleteFile(server.bannerUrl).catch(() => {
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
            select: { ownerUserId: true, ownerTeamId: true, logoUrl: true },
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
            data: { logoUrl: logoUrl },
        });

        // Delete old logo
        if (server.logoUrl) {
            await this.storage.deleteFile(server.logoUrl).catch(() => {
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
            select: { ownerUserId: true, ownerTeamId: true, bannerUrl: true },
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
            data: { bannerUrl: bannerUrl },
        });

        // Delete old banner
        if (server.bannerUrl) {
            await this.storage.deleteFile(server.bannerUrl).catch(() => {
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
            select: { ownerUserId: true, ownerTeamId: true, logoUrl: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        if (server.logoUrl) {
            await this.storage.deleteFile(server.logoUrl);
        }

        return prisma.server.update({
            where: { id: serverId },
            data: { logoUrl: null },
        });
    }

    /**
     * Delete server banner
     */
    async deleteBanner(userId: string, serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            select: { ownerUserId: true, ownerTeamId: true, bannerUrl: true },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        if (server.bannerUrl) {
            await this.storage.deleteFile(server.bannerUrl);
        }

        return prisma.server.update({
            where: { id: serverId },
            data: { bannerUrl: null },
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
        // Get all teams the user belongs to
        const userTeams = await prisma.teamMember.findMany({
            where: { userId },
            select: { teamId: true },
        });
        const teamIds = userTeams.map(tm => tm.teamId);

        // Build where clause to include both personal and team servers
        const where: any = {
            OR: [
                { ownerUserId: userId }, // Personal servers
                ...(teamIds.length > 0 ? [{ ownerTeamId: { in: teamIds } }] : []), // Team servers (only if user has teams)
            ],
        };

        // If viewing another user's servers, only show APPROVED servers
        if (requestingUserId && requestingUserId !== userId) {
            where.AND = {
                status: ServerStatus.APPROVED,
            };
        }

        return prisma.server.findMany({
            where,
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
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
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

        // Check if user is a moderator (can view servers in any status)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user && (user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
            return true;
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
     * Submit server for moderation review
     */
    async submit(userId: string, serverId: string) {
        const server = await prisma.server.findUnique({
            where: { id: serverId },
            include: {
                categories: true,
            },
        });

        if (!server) {
            throw new NotFoundException('Server not found');
        }

        const canEdit = await this.checkEditPermission(userId, server);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this server');
        }

        // Check status - only DRAFT or REJECTED can be submitted
        if (server.status !== ServerStatus.DRAFT && server.status !== ServerStatus.REJECTED) {
            throw new BadRequestException('Only draft or rejected servers can be submitted for review');
        }

        if (server.status as any === ServerStatus.SUSPENDED) {
            throw new ForbiddenException('Server is suspended and cannot be submitted');
        }

        // Validate required fields for submission
        if (!server.logoUrl) {
            throw new BadRequestException('Server logo is required for submission');
        }

        if (!server.bannerUrl) {
            throw new BadRequestException('Server banner is required for submission');
        }

        if ((server.shortDesc?.length || 0) < 10) {
            throw new BadRequestException('Short description must be at least 10 characters long');
        }

        // Update status to PENDING
        await prisma.server.update({
            where: { id: serverId },
            data: {
                status: ServerStatus.PENDING,
                updatedAt: new Date(),
                // Clear rejection reason if resubmitting
                ...(server.status === ServerStatus.REJECTED && { rejectionReason: null }),
            },
        });

        // Create status history entry
        await prisma.serverStatusHistory.create({
            data: {
                serverId: server.id,
                oldStatus: server.status,
                newStatus: ServerStatus.PENDING,
                reason:
                    server.status === ServerStatus.REJECTED
                        ? 'Resubmitted for review after rejection'
                        : 'Submitted for moderation review',
                changedBy: userId,
            },
        });

        return {
            success: true,
            message: 'Server submitted for moderation review',
        };
    }

    /**
     * Get pending servers for moderation (Moderator+ only)
     */
    async getPendingServers(moderatorId: string) {
        // Verify moderator has proper role
        const moderator = await prisma.user.findUnique({
            where: { id: moderatorId },
            select: { role: true },
        });

        if (
            !moderator ||
            ![UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(moderator.role as any)
        ) {
            throw new ForbiddenException('Access denied - Moderator role required');
        }

        const pendingServers = await prisma.server.findMany({
            where: {
                status: ServerStatus.PENDING,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                createdAt: true,
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
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
                categories: {
                    where: { isPrimary: true },
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc', // Most recently submitted first
            },
        });

        return {
            data: pendingServers,
            meta: {
                total: pendingServers.length,
            },
        };
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

    }

    // ============================================
    // TAG MANAGEMENT HELPERS
    // ============================================

    /**
     * Find or create server tags by names
     * Tags will be created automatically if they don't exist
     */
    private async findOrCreateServerTags(tagNames: string[], tx: any) {
        const tags = [];

        for (const name of tagNames) {
            const trimmedName = name.trim();
            const slug = trimmedName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            // Capitalize first letter of each word for consistent display
            const normalizedName = trimmedName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            const tag = await tx.serverTag.upsert({
                where: { slug },
                create: {
                    name: normalizedName,
                    slug,
                    usageCount: 0, // Will be incremented separately
                },
                update: {}, // Don't update if exists
            });

            tags.push(tag);
        }

        return tags;
    }

    /**
     * Update tag usage counter
     */
    private async updateTagUsageCount(
        tagId: string,
        increment: boolean,
        tx: any
    ) {
        await tx.serverTag.update({
            where: { id: tagId },
            data: {
                usageCount: {
                    [increment ? 'increment' : 'decrement']: 1
                }
            },
        });
    }

    /**
     * Update category usage counter
     */
    private async updateCategoryUsageCount(
        categoryId: string,
        increment: boolean,
        tx: any
    ) {
        await tx.serverCategory.update({
            where: { id: categoryId },
            data: {
                usageCount: {
                    [increment ? 'increment' : 'decrement']: 1
                }
            },
        });
    }

    /**
     * Get approved servers for sitemap (top 1000 by votes)
     */
    async getSitemapServers() {
        return prisma.server.findMany({
            where: {
                status: ServerStatus.APPROVED,
            },
            select: {
                slug: true,
                updatedAt: true,
            },
            orderBy: {
                voteCount: 'desc',
            },
            take: 1000,
        });
    }
}