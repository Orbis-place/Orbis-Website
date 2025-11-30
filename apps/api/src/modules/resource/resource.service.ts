import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {CreateResourceDto} from './dtos/create-resource.dto';
import {LicenseType, UpdateResourceDto} from './dtos/update-resource.dto';
import {ResourceStatus, UserRole} from '@repo/db';
import {PaginationDto, PaginatedResponse} from '../../common/dtos/pagination.dto';
import {ModerateResourceDto} from './dtos/moderate-resource.dto';
import {ResourceDescriptionImageService} from './resource-description-image.service';

@Injectable()
export class ResourceService {
    constructor(
        private readonly prisma: PrismaService,
        private descriptionImageService?: ResourceDescriptionImageService,
    ) {}

    /**
     * Create a new resource
     */
    async create(userId: string, createDto: CreateResourceDto) {
        // Generate unique slug
        const slug = await this.generateUniqueSlug(createDto.name);

        // Create resource
        const resource = await this.prisma.resource.create({
            data: {
                name: createDto.name,
                slug,
                tagline: createDto.tagline,
                description: createDto.description,
                type: createDto.type,
                visibility: createDto.visibility,
                status: ResourceStatus.DRAFT,
                ownerId: userId,
                // Default values for required fields
                licenseType: 'MIT', // Default license, should be updated later
                priceType: 'FREE', // Default to free
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
        });

        // Create status history entry
        await this.prisma.resourceStatusHistory.create({
            data: {
                resourceId: resource.id,
                fromStatus: ResourceStatus.DRAFT,
                toStatus: ResourceStatus.DRAFT,
                reason: 'Resource created',
                changedById: userId,
            },
        });

        return {
            message: 'Resource created successfully',
            resource,
        };
    }

    /**
     * Get resource by ID
     */
    async getById(resourceId: string) {
        const resource = await this.prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        logo: true,
                    },
                },
                externalLinks: {
                    orderBy: {
                        type: 'asc',
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                    orderBy: {
                        featured: 'desc',
                    },
                },
                categories: {
                    include: {
                        category: true,
                    },
                },
                versions: {
                    where: {
                        status: 'APPROVED',
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 5,
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        downloadCount: true,
                        createdAt: true,
                        publishedAt: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        createdAt: true,
                        publishedAt: true,
                    },
                },
                contributors: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        return {
            resource,
        };
    }

    /**
     * Update a resource
     */
    async update(resourceId: string, userId: string, updateDto: UpdateResourceDto) {
        // Check if resource exists
        const resource = await this.prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check if user is owner
        if (resource.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own resources');
        }

        // Validate license if provided
        if (updateDto.licenseType !== undefined) {
            this.validateLicense(updateDto);
        }

        // Prepare update data
        const updateData: any = {};

        if (updateDto.name !== undefined) {
            updateData.name = updateDto.name;
            // Regenerate slug if name changed
            updateData.slug = await this.generateUniqueSlug(updateDto.name);
        }
        if (updateDto.tagline !== undefined) updateData.tagline = updateDto.tagline;
        if (updateDto.description !== undefined) updateData.description = updateDto.description;
        if (updateDto.type !== undefined) updateData.type = updateDto.type;
        if (updateDto.visibility !== undefined) updateData.visibility = updateDto.visibility;

        // Validate description images if description was updated
        if (updateDto.description !== undefined && this.descriptionImageService) {
            await this.descriptionImageService.validateImagesInDescription(
                resourceId,
                userId,
                updateDto.description,
            );
        }

        // License fields
        if (updateDto.licenseType !== undefined) updateData.licenseType = updateDto.licenseType;
        if (updateDto.customLicenseName !== undefined) updateData.customLicenseName = updateDto.customLicenseName;
        if (updateDto.licenseSpdxId !== undefined) updateData.licenseSpdxId = updateDto.licenseSpdxId;
        if (updateDto.licenseUrl !== undefined) updateData.licenseUrl = updateDto.licenseUrl;

        // Use transaction to handle all updates atomically
        const updatedResource = await this.prisma.$transaction(async (tx) => {
            // Update basic resource fields
            const updated = await tx.resource.update({
                where: { id: resourceId },
                data: updateData,
            });

            // Handle External Links
            if (updateDto.removeExternalLinks && updateDto.removeExternalLinks.length > 0) {
                await tx.externalLink.deleteMany({
                    where: {
                        id: { in: updateDto.removeExternalLinks },
                        resourceId: resourceId,
                    },
                });
            }

            if (updateDto.externalLinks && updateDto.externalLinks.length > 0) {
                for (const link of updateDto.externalLinks) {
                    if (link.id) {
                        // Update existing link
                        await tx.externalLink.update({
                            where: { id: link.id },
                            data: {
                                type: link.type,
                                url: link.url,
                                label: link.label,
                            },
                        });
                    } else {
                        // Create new link
                        await tx.externalLink.create({
                            data: {
                                resourceId: resourceId,
                                type: link.type,
                                url: link.url,
                                label: link.label,
                            },
                        });
                    }
                }
            }

            // Handle Tags
            if (updateDto.removeTags && updateDto.removeTags.length > 0) {
                await tx.resourceToTag.deleteMany({
                    where: {
                        resourceId: resourceId,
                        tagId: { in: updateDto.removeTags },
                    },
                });

                // Decrement usage count for removed tags
                await tx.resourceTag.updateMany({
                    where: { id: { in: updateDto.removeTags } },
                    data: {
                        usageCount: {
                            decrement: 1,
                        },
                    },
                });
            }

            if (updateDto.addTags && updateDto.addTags.length > 0) {
                // Verify tags exist
                const tags = await tx.resourceTag.findMany({
                    where: { id: { in: updateDto.addTags } },
                });

                if (tags.length !== updateDto.addTags.length) {
                    throw new BadRequestException('One or more tags do not exist');
                }

                // Create tag relations
                for (const tagId of updateDto.addTags) {
                    await tx.resourceToTag.upsert({
                        where: {
                            resourceId_tagId: {
                                resourceId: resourceId,
                                tagId: tagId,
                            },
                        },
                        create: {
                            resourceId: resourceId,
                            tagId: tagId,
                            featured: false,
                        },
                        update: {},
                    });
                }

                // Increment usage count for added tags
                await tx.resourceTag.updateMany({
                    where: { id: { in: updateDto.addTags } },
                    data: {
                        usageCount: {
                            increment: 1,
                        },
                    },
                });
            }

            // Handle Featured Tags (max 3)
            if (updateDto.featuredTags !== undefined) {
                if (updateDto.featuredTags.length > 3) {
                    throw new BadRequestException('Cannot feature more than 3 tags');
                }

                // Unfeature all tags first
                await tx.resourceToTag.updateMany({
                    where: { resourceId: resourceId },
                    data: { featured: false },
                });

                // Feature specified tags
                if (updateDto.featuredTags.length > 0) {
                    await tx.resourceToTag.updateMany({
                        where: {
                            resourceId: resourceId,
                            tagId: { in: updateDto.featuredTags },
                        },
                        data: { featured: true },
                    });
                }
            }

            // Fetch and return complete resource
            return tx.resource.findUnique({
                where: { id: resourceId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    externalLinks: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                        orderBy: {
                            featured: 'desc',
                        },
                    },
                },
            });
        });

        return {
            message: 'Resource updated successfully',
            resource: updatedResource,
        };
    }

    /**
     * Validate license fields
     */
    private validateLicense(updateDto: UpdateResourceDto) {
        if (updateDto.licenseType === LicenseType.CUSTOM) {
            if (!updateDto.licenseUrl) {
                throw new BadRequestException('License URL is required for custom licenses');
            }
        }
    }

    /**
     * Get user resources with pagination
     */
    async getUserResources(userId: string, pagination: PaginationDto) {
        const {page = 1, limit = 20, name} = pagination;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            ownerId: userId,
        };

        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive',
            };
        }

        // Get total count
        const total = await this.prisma.resource.count({where});

        // Get resources
        const resources = await this.prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        logo: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        createdAt: true,
                        publishedAt: true,
                    },
                },
                tags: {
                    where: {
                        featured: true,
                    },
                    include: {
                        tag: true,
                    },
                    take: 3,
                },
                _count: {
                    select: {
                        versions: true,
                    },
                },
            },
        });

        return new PaginatedResponse(resources, total, page, limit);
    }

    /**
     * Get team resources with pagination
     */
    async getTeamResources(teamId: string, pagination: PaginationDto) {
        const {page = 1, limit = 20, name} = pagination;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            teamId,
        };

        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive',
            };
        }

        // Get total count
        const total = await this.prisma.resource.count({where});

        // Get resources
        const resources = await this.prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        logo: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        createdAt: true,
                        publishedAt: true,
                    },
                },
                tags: {
                    where: {
                        featured: true,
                    },
                    include: {
                        tag: true,
                    },
                    take: 3,
                },
                _count: {
                    select: {
                        versions: true,
                    },
                },
            },
        });

        return new PaginatedResponse(resources, total, page, limit);
    }

    /**
     * Generate a unique slug from name
     */
    private async generateUniqueSlug(name: string): Promise<string> {
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.resource.findUnique({
                where: { slug },
            });

            if (!existing) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    // ============================================
    // MODERATION ENDPOINTS
    // ============================================

    /**
     * Get pending resources for moderation
     */
    async getPendingResources(moderatorId: string, pagination: PaginationDto) {
        // Check if user is moderator or higher
        await this.checkModeratorPermission(moderatorId);

        const {page = 1, limit = 20} = pagination;
        const skip = (page - 1) * limit;

        const where = {
            status: ResourceStatus.PENDING,
        };

        const total = await this.prisma.resource.count({where});

        const resources = await this.prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'asc', // Oldest first for moderation queue
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                        role: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        logo: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        createdAt: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                    take: 5,
                },
                categories: {
                    include: {
                        category: true,
                    },
                },
                _count: {
                    select: {
                        versions: true,
                        downloads: true,
                    },
                },
            },
        });

        return new PaginatedResponse(resources, total, page, limit);
    }

    /**
     * Moderate a resource (approve, reject, suspend)
     */
    async moderateResource(moderatorId: string, resourceId: string, moderateDto: ModerateResourceDto) {
        // Check if user is moderator or higher
        await this.checkModeratorPermission(moderatorId);

        // Get resource
        const resource = await this.prisma.resource.findUnique({
            where: {id: resourceId},
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Validate status transition
        this.validateStatusTransition(resource.status, moderateDto.status);

        // Validate rejection/suspension reason
        if (
            (moderateDto.status === ResourceStatus.REJECTED ||
                moderateDto.status === ResourceStatus.SUSPENDED) &&
            !moderateDto.reason
        ) {
            throw new BadRequestException('Reason is required for rejection or suspension');
        }

        const oldStatus = resource.status;

        // Update resource in transaction
        const updatedResource = await this.prisma.$transaction(async (tx) => {
            // Update resource
            const updated = await tx.resource.update({
                where: {id: resourceId},
                data: {
                    status: moderateDto.status,
                    moderatedById: moderatorId,
                    moderatedAt: new Date(),
                    rejectionReason:
                        moderateDto.status === ResourceStatus.REJECTED ||
                        moderateDto.status === ResourceStatus.SUSPENDED
                            ? moderateDto.reason
                            : null,
                    moderationNotes: moderateDto.moderationNotes || resource.moderationNotes,
                    publishedAt:
                        moderateDto.status === ResourceStatus.APPROVED && !resource.publishedAt
                            ? new Date()
                            : resource.publishedAt,
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    moderatedBy: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                        },
                    },
                },
            });

            // Create status history entry
            await tx.resourceStatusHistory.create({
                data: {
                    resourceId: resourceId,
                    fromStatus: oldStatus,
                    toStatus: moderateDto.status,
                    reason: moderateDto.reason,
                    changedById: moderatorId,
                },
            });

            return updated;
        });

        return {
            message: `Resource ${this.getStatusActionMessage(moderateDto.status)} successfully`,
            resource: updatedResource,
        };
    }

    /**
     * Get all resources by status for moderation
     */
    async getResourcesByStatus(moderatorId: string, status: ResourceStatus, pagination: PaginationDto) {
        // Check if user is moderator or higher
        await this.checkModeratorPermission(moderatorId);

        const {page = 1, limit = 20} = pagination;
        const skip = (page - 1) * limit;

        const where = {status};

        const total = await this.prisma.resource.count({where});

        const resources = await this.prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                moderatedAt: 'desc',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                moderatedBy: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                    },
                },
            },
        });

        return new PaginatedResponse(resources, total, page, limit);
    }

    /**
     * Get resource moderation history
     */
    async getResourceModerationHistory(moderatorId: string, resourceId: string) {
        // Check if user is moderator or higher
        await this.checkModeratorPermission(moderatorId);

        const resource = await this.prisma.resource.findUnique({
            where: {id: resourceId},
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                moderatedBy: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                statusHistory: {
                    include: {
                        changedBy: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                    orderBy: {
                        changedAt: 'desc',
                    },
                },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        return {
            resource,
        };
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if user has moderator permission
     */
    private async checkModeratorPermission(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {role: true},
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (
            user.role !== UserRole.MODERATOR &&
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenException('Insufficient permissions. Moderator role or higher required');
        }
    }

    /**
     * Validate status transition
     */
    private validateStatusTransition(currentStatus: ResourceStatus, newStatus: ResourceStatus) {
        // Define valid transitions
        const validTransitions: Record<ResourceStatus, ResourceStatus[]> = {
            [ResourceStatus.DRAFT]: [ResourceStatus.PENDING, ResourceStatus.ARCHIVED, ResourceStatus.DELETED],
            [ResourceStatus.PENDING]: [
                ResourceStatus.APPROVED,
                ResourceStatus.REJECTED,
                ResourceStatus.DRAFT,
            ],
            [ResourceStatus.APPROVED]: [
                ResourceStatus.SUSPENDED,
                ResourceStatus.ARCHIVED,
                ResourceStatus.DELETED,
            ],
            [ResourceStatus.REJECTED]: [ResourceStatus.PENDING, ResourceStatus.DELETED],
            [ResourceStatus.SUSPENDED]: [
                ResourceStatus.APPROVED,
                ResourceStatus.DELETED,
                ResourceStatus.ARCHIVED,
            ],
            [ResourceStatus.ARCHIVED]: [
                ResourceStatus.APPROVED,
                ResourceStatus.DELETED,
                ResourceStatus.DRAFT,
            ],
            [ResourceStatus.DELETED]: [], // Cannot transition from deleted
        };

        const allowedTransitions = validTransitions[currentStatus] || [];

        if (!allowedTransitions.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid status transition from ${currentStatus} to ${newStatus}`,
            );
        }
    }

    /**
     * Get status action message
     */
    private getStatusActionMessage(status: ResourceStatus): string {
        const messages: Record<ResourceStatus, string> = {
            [ResourceStatus.APPROVED]: 'approved',
            [ResourceStatus.REJECTED]: 'rejected',
            [ResourceStatus.SUSPENDED]: 'suspended',
            [ResourceStatus.ARCHIVED]: 'archived',
            [ResourceStatus.DELETED]: 'deleted',
            [ResourceStatus.PENDING]: 'set to pending',
            [ResourceStatus.DRAFT]: 'set to draft',
        };

        return messages[status] || 'updated';
    }
}