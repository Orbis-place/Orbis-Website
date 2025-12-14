import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { CreateResourceDto } from './dtos/create-resource.dto';
import { LicenseType, UpdateResourceDto } from './dtos/update-resource.dto';
import { prisma, ResourceStatus, ResourceType, UserRole } from '@repo/db';
import { PaginationDto, PaginatedResponse } from '../../common/dtos/pagination.dto';
import { FilterResourcesDto, ResourceSortOption } from './dtos/filter-resources.dto';

import { ModerateResourceDto } from './dtos/moderate-resource.dto';
import { ResourceDescriptionImageService } from './resource-description-image.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ResourceService {
    constructor(

        private readonly storage: StorageService,
        private descriptionImageService?: ResourceDescriptionImageService,
    ) { }

    /**
     * Create a new resource
     */
    async create(userId: string, createDto: CreateResourceDto) {
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
                    'You must be a team owner or admin to create resources for this team',
                );
            }
        }

        // Validate slug uniqueness
        const slug = await this.generateUniqueSlug(createDto.slug);
        if (slug !== createDto.slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
            throw new ConflictException('Slug is already taken');
        }

        // Create resource
        const resource = await prisma.resource.create({
            data: {
                name: createDto.name,
                slug,
                tagline: createDto.tagline,
                type: createDto.type,
                status: ResourceStatus.DRAFT,
                ownerUserId: createDto.teamId ? null : userId,
                ownerTeamId: createDto.teamId,
                // Default values for required fields
                licenseType: 'MIT', // Default license, should be updated later
                priceType: 'FREE', // Default to free
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
            },
        });

        // Create status history entry
        await prisma.resourceStatusHistory.create({
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
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
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
                    }
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
     * Get resource by slug
     */
    async getBySlug(slug: string, userId?: string) {
        const resource = await prisma.resource.findUnique({
            where: { slug },
            include: {
                ownerUser: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                        role: true, // Include role for permission checks
                    },
                },
                ownerTeam: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        slug: true,
                        members: userId ? {
                            where: { userId },
                            select: {
                                userId: true,
                                role: true,
                            },
                        } : false,
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

        // Check if resource is approved - if not, verify permissions
        if (resource.status !== ResourceStatus.APPROVED) {
            // If no user is logged in, deny access
            if (!userId) {
                throw new ForbiddenException('This resource is not publicly available');
            }

            // Get user details to check role
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });

            if (!user) {
                throw new ForbiddenException('This resource is not publicly available');
            }

            // Check if user is moderator or admin
            const isModerator = user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

            // Check if user is the owner
            const isOwner = resource.ownerUserId === userId;

            // Check if user is a team member (for team-owned resources)
            const isTeamMember = resource.ownerTeam?.members && resource.ownerTeam.members.length > 0;

            // Deny access if user doesn't have permission
            if (!isModerator && !isOwner && !isTeamMember) {
                throw new ForbiddenException('You do not have permission to view this resource');
            }
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
        const resource = await prisma.resource.findUnique({
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

        // Check if user has edit permission (owner or team admin)
        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        // Validate license if provided
        if (updateDto.licenseType !== undefined) {
            this.validateLicense(updateDto);
        }

        // Prepare update data
        const updateData: any = {};

        if (updateDto.name !== undefined) {
            updateData.name = updateDto.name;
        }

        // Handle slug update - either explicit or auto-generated from name change
        if (updateDto.slug !== undefined) {
            // Explicit slug update
            const uniqueSlug = await this.generateUniqueSlug(updateDto.slug);
            // If generated slug is different from provided, it means there was a conflict
            if (uniqueSlug !== updateDto.slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
                throw new ConflictException('Slug is already taken');
            }
            updateData.slug = uniqueSlug;
        } else if (updateDto.name !== undefined && updateDto.name !== resource.name) {
            // Auto-generate slug from new name if name changed and no explicit slug provided
            updateData.slug = await this.generateUniqueSlug(updateDto.name);
        }
        if (updateDto.tagline !== undefined) updateData.tagline = updateDto.tagline;
        if (updateDto.description !== undefined) updateData.description = updateDto.description;

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

        // Price fields
        if (updateDto.priceType !== undefined) updateData.priceType = updateDto.priceType;

        // Use transaction to handle all updates atomically
        const updatedResource = await prisma.$transaction(async (tx) => {
            // Update basic resource fields
            const updated = await tx.resource.update({
                where: { id: resourceId },
                data: updateData,
            });

            // Handle Categories - Remove
            if (updateDto.removeCategories && updateDto.removeCategories.length > 0) {
                await tx.resourceToCategory.deleteMany({
                    where: {
                        resourceId: resourceId,
                        categoryId: { in: updateDto.removeCategories },
                    },
                });
            }

            // Handle Categories - Add
            if (updateDto.addCategories && updateDto.addCategories.length > 0) {
                // Verify categories exist
                const categories = await tx.resourceCategory.findMany({
                    where: { id: { in: updateDto.addCategories } },
                });

                if (categories.length !== updateDto.addCategories.length) {
                    throw new BadRequestException('One or more categories do not exist');
                }

                // Check current category count
                const currentCategoryCount = await tx.resourceToCategory.count({
                    where: { resourceId: resourceId },
                });

                // Count how many new categories would be added
                let newCategoriesCount = 0;
                for (const categoryId of updateDto.addCategories) {
                    const existing = await tx.resourceToCategory.findUnique({
                        where: {
                            resourceId_categoryId: {
                                resourceId: resourceId,
                                categoryId: categoryId,
                            },
                        },
                    });
                    if (!existing) {
                        newCategoriesCount++;
                    }
                }

                // Enforce max 3 categories per resource
                if (currentCategoryCount + newCategoriesCount > 3) {
                    throw new BadRequestException(
                        `Cannot add categories: resource would have ${currentCategoryCount + newCategoriesCount} categories(max 3 allowed)`
                    );
                }

                // Create category relations
                for (const categoryId of updateDto.addCategories) {
                    await tx.resourceToCategory.upsert({
                        where: {
                            resourceId_categoryId: {
                                resourceId: resourceId,
                                categoryId: categoryId,
                            },
                        },
                        create: {
                            resourceId: resourceId,
                            categoryId: categoryId,
                        },
                        update: {},
                    });
                }
            }

            // Handle Tags - Remove
            if (updateDto.removeTags && updateDto.removeTags.length > 0) {
                // Find tags by name or slug
                const tagsToRemove = await tx.resourceTag.findMany({
                    where: {
                        OR: [
                            { name: { in: updateDto.removeTags } },
                            { slug: { in: updateDto.removeTags.map(t => this.slugifyTagName(t)) } },
                        ],
                    },
                });

                const tagIdsToRemove = tagsToRemove.map(t => t.id);

                if (tagIdsToRemove.length > 0) {
                    // Delete relations
                    await tx.resourceToTag.deleteMany({
                        where: {
                            resourceId: resourceId,
                            tagId: { in: tagIdsToRemove },
                        },
                    });

                    // Decrement usage counters
                    for (const tag of tagsToRemove) {
                        await this.updateTagUsageCount(tag.id, updated.type, false, tx);
                    }
                }
            }

            // Handle Tags - Add
            if (updateDto.addTags && updateDto.addTags.length > 0) {
                // Find or create tags
                const tags = await this.findOrCreateTags(updateDto.addTags, tx);

                // Check current tag count and count how many new tags would be added
                const currentTagCount = await tx.resourceToTag.count({
                    where: { resourceId: resourceId },
                });

                let newTagsCount = 0;
                for (const tag of tags) {
                    const existing = await tx.resourceToTag.findUnique({
                        where: {
                            resourceId_tagId: {
                                resourceId: resourceId,
                                tagId: tag.id,
                            },
                        },
                    });
                    if (!existing) {
                        newTagsCount++;
                    }
                }

                // Enforce max 10 tags per resource
                if (currentTagCount + newTagsCount > 10) {
                    throw new BadRequestException(
                        `Cannot add tags: resource would have ${currentTagCount + newTagsCount} tags(max 10 allowed)`
                    );
                }

                // Create tag relations and update counters
                for (const tag of tags) {
                    const existing = await tx.resourceToTag.findUnique({
                        where: {
                            resourceId_tagId: {
                                resourceId: resourceId,
                                tagId: tag.id,
                            },
                        },
                    });

                    if (!existing) {
                        // Create relation
                        await tx.resourceToTag.create({
                            data: {
                                resourceId: resourceId,
                                tagId: tag.id,
                            },
                        });

                        // Increment usage counters
                        await this.updateTagUsageCount(tag.id, updated.type, true, tx);
                    }
                }
            }

            // Fetch and return complete resource
            return tx.resource.findUnique({
                where: { id: resourceId },
                include: {
                    ownerUser: {
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
     * Delete a resource
     */
    async delete(resourceId: string, userId: string) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                galleryImages: true,
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission (owner or team admin)
        const canDelete = await this.checkEditPermission(userId, resource);
        if (!canDelete) {
            throw new ForbiddenException('You do not have permission to delete this resource');
        }

        // Delete files
        if (resource.iconUrl) {
            await this.storage.deleteFile(resource.iconUrl).catch(() => { });
        }
        if (resource.bannerUrl) {
            await this.storage.deleteFile(resource.bannerUrl).catch(() => { });
        }

        // Delete gallery images files
        if (resource.galleryImages && resource.galleryImages.length > 0) {
            for (const image of resource.galleryImages) {
                if (image.storageKey) {
                    await this.storage.deleteFile(image.storageKey).catch(() => { });
                }
            }
        }

        await prisma.resource.delete({
            where: { id: resourceId },
        });

        return {
            message: 'Resource deleted successfully',
        };
    }

    /**
     * Upload resource icon
     */
    async uploadIcon(resourceId: string, userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, and WebP are allowed',
            );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 5MB');
        }

        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { iconUrl: true, ownerUserId: true, ownerTeamId: true },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        const iconUrl = await this.storage.uploadFile(
            file,
            `resources / ${resourceId}/icon`,
        );

        const updated = await prisma.resource.update({
            where: { id: resourceId },
            data: { iconUrl: iconUrl },
            include: {
                ownerUser: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
        });

        // Delete old icon if exists
        if (resource.iconUrl) {
            await this.storage.deleteFile(resource.iconUrl).catch(() => { });
        }

        return {
            message: 'Icon uploaded successfully',
            resource: updated,
        };
    }

    /**
     * Upload resource banner
     */
    async uploadBanner(resourceId: string, userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, and WebP are allowed',
            );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 5MB');
        }

        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { bannerUrl: true, ownerUserId: true, ownerTeamId: true },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        const bannerUrl = await this.storage.uploadFile(
            file,
            `resources/${resourceId}/banner`,
        );

        const updated = await prisma.resource.update({
            where: { id: resourceId },
            data: { bannerUrl: bannerUrl },
            include: {
                ownerUser: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
        });

        // Delete old banner if exists
        if (resource.bannerUrl) {
            await this.storage.deleteFile(resource.bannerUrl).catch(() => { });
        }

        return {
            message: 'Banner uploaded successfully',
            resource: updated,
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
     * This includes both personal resources and resources from teams the user belongs to
     */
    async getUserResources(userId: string, pagination: PaginationDto) {
        const { page = 1, limit = 20, name } = pagination;
        const skip = (page - 1) * limit;

        // Get all teams the user belongs to
        const userTeams = await prisma.teamMember.findMany({
            where: { userId },
            select: { teamId: true },
        });
        const teamIds = userTeams.map(tm => tm.teamId);

        // Build where clause to include both personal and team resources
        const where: any = {
            OR: [
                { ownerUserId: userId }, // Personal resources
                { ownerTeamId: { in: teamIds } }, // Team resources
            ],
        };

        // If searching by name
        if (name) {
            where.AND = {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            };
        }

        // Get total count
        const total = await prisma.resource.count({ where });

        // Get resources
        const resources = await prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
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
                        name: true,
                        slug: true,
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
        const { page = 1, limit = 20, name } = pagination;
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
        const total = await prisma.resource.count({ where });

        // Get resources
        const resources = await prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
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
                        name: true,
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
            const existing = await prisma.resource.findUnique({
                where: { slug },
            });

            if (!existing) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    /**
     * Generate slug from tag name
     */
    private slugifyTagName(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Find or create tags by names
     */
    private async findOrCreateTags(tagNames: string[], tx: any) {
        const tags = [];

        for (const name of tagNames) {
            const trimmedName = name.trim();
            const slug = this.slugifyTagName(trimmedName);

            // Capitalize first letter of each word for consistent display
            const normalizedName = trimmedName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            const tag = await tx.resourceTag.upsert({
                where: { slug },
                create: {
                    name: normalizedName,
                    slug
                },
                update: {}, // Don't update if exists
            });

            tags.push(tag);
        }

        return tags;
    }

    /**
     * Update tag usage counters (global and per-type)
     */
    private async updateTagUsageCount(
        tagId: string,
        resourceType: ResourceType,
        increment: boolean,
        tx: any
    ) {
        const delta = increment ? 1 : -1;

        // Update global count
        await tx.resourceTag.update({
            where: { id: tagId },
            data: {
                usageCount: {
                    [increment ? 'increment' : 'decrement']: 1
                }
            },
        });

        // Update per-type count
        if (increment) {
            await tx.resourceTagUsageByType.upsert({
                where: {
                    tagId_resourceType: { tagId, resourceType }
                },
                create: {
                    tagId,
                    resourceType,
                    usageCount: 1
                },
                update: {
                    usageCount: { increment: 1 }
                },
            });
        } else {
            // Decrement, but don't go below 0
            const usage = await tx.resourceTagUsageByType.findUnique({
                where: {
                    tagId_resourceType: { tagId, resourceType }
                },
            });

            if (usage && usage.usageCount > 0) {
                await tx.resourceTagUsageByType.update({
                    where: {
                        tagId_resourceType: { tagId, resourceType }
                    },
                    data: {
                        usageCount: { decrement: 1 }
                    },
                });
            }
        }
    }

    /**
     * Get all approved resources for marketplace with filters
     */
    async getAllResources(filterDto: FilterResourcesDto) {
        const { type, search, sortBy = ResourceSortOption.DATE, page = 1, limit = 20 } = filterDto;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            status: ResourceStatus.APPROVED,
        };

        // Filter by resource type
        if (type) {
            where.type = type;
        }

        // Search by name or description
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Determine sort order
        let orderBy: any = {};
        switch (sortBy) {
            case ResourceSortOption.DOWNLOADS:
                orderBy = { downloadCount: 'desc' };
                break;
            case ResourceSortOption.LIKES:
                orderBy = { likeCount: 'desc' };
                break;
            case ResourceSortOption.UPDATED:
                orderBy = { updatedAt: 'desc' };
                break;
            case ResourceSortOption.NAME:
                orderBy = { name: 'asc' };
                break;
            case ResourceSortOption.DATE:
            default:
                orderBy = { publishedAt: 'desc' };
                break;
        }

        // Get total count
        const total = await prisma.resource.count({ where });

        // Get resources
        const resources = await prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy,
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
                    include: {
                        tag: true,
                    },
                    take: 3,
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

    // ============================================
    // MODERATION ENDPOINTS
    // ============================================

    /**
     * Get pending resources for moderation
     */
    async getPendingResources(moderatorId: string, pagination: PaginationDto) {
        // Check if user is moderator or higher
        await this.checkModeratorPermission(moderatorId);

        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;

        const where = {
            status: ResourceStatus.PENDING,
        };

        const total = await prisma.resource.count({ where });

        const resources = await prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'asc', // Oldest first for moderation queue
            },
            include: {
                ownerUser: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                        role: true,
                    },
                },
                ownerTeam: {
                    select: {
                        id: true,
                        name: true,
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
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                ownerUser: {
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
        const updatedResource = await prisma.$transaction(async (tx) => {
            // Update resource
            const updated = await tx.resource.update({
                where: { id: resourceId },
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
                    ownerUser: {
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

        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;

        const where = { status };

        const total = await prisma.resource.count({ where });

        const resources = await prisma.resource.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                moderatedAt: 'desc',
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

        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                ownerUser: {
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
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
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
     * Get popular tags for a specific resource type
     */
    async getPopularTagsForType(resourceType: ResourceType, limit = 20) {
        return prisma.resourceTagUsageByType.findMany({
            where: { resourceType },
            orderBy: { usageCount: 'desc' },
            take: limit,
        });
    }

    /**
     * Get all tags with optional search
     */
    async getAllTags(search?: string, limit = 50) {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        return prisma.resourceTag.findMany({
            where,
            take: limit,
            orderBy: [
                { usageCount: 'desc' },
                { name: 'asc' },
            ],
            include: {
                usageByType: {
                    orderBy: {
                        usageCount: 'desc',
                    },
                },
            },
        });
    }

    /**
     * Get categories for a specific resource type
     */
    async getCategoriesForType(resourceType?: ResourceType) {
        const where: any = {};

        // Filter by resource type if provided
        if (resourceType) {
            where.OR = [
                { resourceTypes: { isEmpty: true } }, // Global categories (empty array)
                { resourceTypes: { has: resourceType } }, // Categories that include this type
            ];
        }

        return prisma.resourceCategory.findMany({
            where,
            orderBy: { usageCount: 'desc' }, // Order by usage count for better UX
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
                color: true,
                order: true,
                usageCount: true,
                resourceTypes: true,
            },
        });
    }

    /**
     * Get all available Hytale versions
     */
    async getHytaleVersions() {
        const versions = await prisma.hytaleVersion.findMany({
            select: {
                hytaleVersion: true,
            },
            distinct: ['hytaleVersion'],
            orderBy: {
                hytaleVersion: 'desc', // Latest versions first
            },
        });

        // Return just the version strings
        return versions.map(v => v.hytaleVersion);
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

    /**
     * Check edit permission for resources
     */
    private async checkEditPermission(
        userId: string,
        resource: { ownerUserId?: string | null; ownerTeamId?: string | null },
    ): Promise<boolean> {
        // Direct owner
        if (resource.ownerUserId === userId) {
            return true;
        }

        // Team member with permission
        if (resource.ownerTeamId) {
            const member = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: resource.ownerTeamId,
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
     * Transfer resource ownership
     */
    async transferOwnership(
        resourceId: string,
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

        // Get current resource
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: {
                id: true,
                name: true,
                ownerUserId: true,
                ownerTeamId: true,
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission: must be current owner or team owner/admin
        const hasPermission = await this.checkEditPermission(userId, resource);
        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to transfer this resource');
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
            const updatedResource = await prisma.resource.update({
                where: { id: resourceId },
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
                message: `Resource ownership transferred to user ${newOwner.username}`,
                resource: updatedResource,
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
                    'You must be a team owner or admin to transfer resources to this team',
                );
            }

            // Update ownership
            const updatedResource = await prisma.resource.update({
                where: { id: resourceId },
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
                            name: true,
                            logo: true,
                        },
                    },
                },
            });

            return {
                message: `Resource ownership transferred to team ${team.name}`,
                resource: updatedResource,
            };
        }
    }

    // ============================================
    // EXTERNAL LINKS MANAGEMENT
    // ============================================

    /**
     * Get all external links for a resource
     */
    async getExternalLinks(resourceId: string) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        const links = await prisma.resourceExternalLink.findMany({
            where: { resourceId },
            orderBy: { order: 'asc' },
        });

        return links;
    }

    /**
     * Create a new external link
     */
    async createExternalLink(
        resourceId: string,
        userId: string,
        dto: any,
    ) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        // Check if link type already exists for this resource
        const existingLink = await prisma.resourceExternalLink.findUnique({
            where: {
                resourceId_type: {
                    resourceId,
                    type: dto.type,
                },
            },
        });

        if (existingLink) {
            throw new ConflictException(`A link of type ${dto.type} already exists for this resource`);
        }

        // Get current max order
        const maxOrderLink = await prisma.resourceExternalLink.findFirst({
            where: { resourceId },
            orderBy: { order: 'desc' },
        });

        const newOrder = (maxOrderLink?.order ?? -1) + 1;

        const link = await prisma.resourceExternalLink.create({
            data: {
                resourceId,
                type: dto.type,
                url: dto.url,
                label: dto.label,
                order: newOrder,
            },
        });

        return {
            message: 'External link created successfully',
            link,
        };
    }

    /**
     * Update an external link
     */
    async updateExternalLink(
        resourceId: string,
        userId: string,
        linkId: string,
        dto: any,
    ) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        const link = await prisma.resourceExternalLink.findUnique({
            where: { id: linkId },
        });

        if (!link || link.resourceId !== resourceId) {
            throw new NotFoundException('External link not found');
        }

        const updatedLink = await prisma.resourceExternalLink.update({
            where: { id: linkId },
            data: {
                url: dto.url,
                label: dto.label,
            },
        });

        return {
            message: 'External link updated successfully',
            link: updatedLink,
        };
    }

    /**
     * Delete an external link
     */
    async deleteExternalLink(
        resourceId: string,
        userId: string,
        linkId: string,
    ) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        const link = await prisma.resourceExternalLink.findUnique({
            where: { id: linkId },
        });

        if (!link || link.resourceId !== resourceId) {
            throw new NotFoundException('External link not found');
        }

        await prisma.resourceExternalLink.delete({
            where: { id: linkId },
        });

        return {
            message: 'External link deleted successfully',
        };
    }

    /**
     * Reorder external links
     */
    async reorderExternalLinks(
        resourceId: string,
        userId: string,
        linkIds: string[],
    ) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canEdit = await this.checkEditPermission(userId, resource);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this resource');
        }

        // Verify all links belong to this resource
        const links = await prisma.resourceExternalLink.findMany({
            where: {
                id: { in: linkIds },
                resourceId,
            },
        });

        if (links.length !== linkIds.length) {
            throw new BadRequestException('One or more links do not belong to this resource');
        }

        // Update order for each link
        await prisma.$transaction(
            linkIds.map((linkId, index) =>
                prisma.resourceExternalLink.update({
                    where: { id: linkId },
                    data: { order: index },
                })
            )
        );

        return {
            message: 'External links reordered successfully',
        };
    }
}