import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { prisma, NotificationType } from '@repo/db';
import { NotificationService } from '../notification/notification.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dtos/collection.dto';

@Injectable()
export class CollectionService {
    constructor(private readonly notificationService: NotificationService) { }

    /**
     * Get or create the default collection for a user
     */
    async getOrCreateDefaultCollection(userId: string) {
        // Get user info for default collection name
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const defaultName = `${user.username}'s collection`;

        // Try to find existing default collection
        let defaultCollection = await prisma.userResourceCollection.findFirst({
            where: {
                userId,
                isDefault: true,
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });

        // If no default exists, create one
        if (!defaultCollection) {
            defaultCollection = await prisma.userResourceCollection.create({
                data: {
                    userId,
                    name: defaultName,
                    isDefault: true,
                },
                include: {
                    _count: {
                        select: { items: true },
                    },
                },
            });
        }

        return {
            id: defaultCollection.id,
            name: defaultCollection.name,
            description: defaultCollection.description,
            isDefault: defaultCollection.isDefault,
            isPublic: defaultCollection.isPublic,
            itemCount: defaultCollection._count.items,
            createdAt: defaultCollection.createdAt,
            updatedAt: defaultCollection.updatedAt,
        };
    }

    /**
     * Get all collections for a user
     */
    async getUserCollections(userId: string) {
        const collections = await prisma.userResourceCollection.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' }, // Default collection first
                { createdAt: 'desc' },
            ],
        });

        return {
            collections: collections.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                isDefault: c.isDefault,
                isPublic: c.isPublic,
                itemCount: c._count.items,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            })),
            count: collections.length,
        };
    }

    /**
     * Search collections by name
     */
    async searchCollections(userId: string, query: string) {
        const collections = await prisma.userResourceCollection.findMany({
            where: {
                userId,
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' },
            ],
            take: 20,
        });

        return {
            collections: collections.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                isDefault: c.isDefault,
                isPublic: c.isPublic,
                itemCount: c._count.items,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            })),
            count: collections.length,
        };
    }

    /**
     * Get a specific collection by ID
     */
    async getCollectionById(collectionId: string, userId: string) {
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        return {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            isDefault: collection.isDefault,
            isPublic: collection.isPublic,
            itemCount: collection._count.items,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
        };
    }

    /**
     * Create a new collection
     */
    async createCollection(userId: string, dto: CreateCollectionDto) {
        // Check if collection with same name exists
        const existing = await prisma.userResourceCollection.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: dto.name,
                },
            },
        });

        if (existing) {
            throw new ConflictException('A collection with this name already exists');
        }

        const collection = await prisma.userResourceCollection.create({
            data: {
                userId,
                name: dto.name,
                description: dto.description,
                isPublic: dto.isPublic ?? false,
                isDefault: false,
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });

        return {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            isDefault: collection.isDefault,
            isPublic: collection.isPublic,
            itemCount: collection._count.items,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
        };
    }

    /**
     * Update a collection
     */
    async updateCollection(collectionId: string, userId: string, dto: UpdateCollectionDto) {
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        // If renaming, check for duplicate name
        if (dto.name && dto.name !== collection.name) {
            const existing = await prisma.userResourceCollection.findUnique({
                where: {
                    userId_name: {
                        userId,
                        name: dto.name,
                    },
                },
            });

            if (existing) {
                throw new ConflictException('A collection with this name already exists');
            }
        }

        const updated = await prisma.userResourceCollection.update({
            where: { id: collectionId },
            data: {
                name: dto.name,
                description: dto.description,
                isPublic: dto.isPublic,
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });

        return {
            id: updated.id,
            name: updated.name,
            description: updated.description,
            isDefault: updated.isDefault,
            isPublic: updated.isPublic,
            itemCount: updated._count.items,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }

    /**
     * Delete a collection
     */
    async deleteCollection(collectionId: string, userId: string) {
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        if (collection.isDefault) {
            throw new BadRequestException('Cannot delete the default collection');
        }

        await prisma.userResourceCollection.delete({
            where: { id: collectionId },
        });

        return {
            message: 'Collection deleted successfully',
        };
    }

    /**
     * Add resource to a specific collection
     */
    async addResourceToCollection(collectionId: string, resourceId: string, userId: string) {
        // Verify collection ownership
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        // Verify resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check if already in collection
        const existing = await prisma.userResourceCollectionItem.findUnique({
            where: {
                collectionId_resourceId: {
                    collectionId,
                    resourceId,
                },
            },
        });

        if (existing) {
            return {
                message: 'Resource already in collection',
                added: false,
                collectionId,
                resourceId,
            };
        }

        await prisma.userResourceCollectionItem.create({
            data: {
                collectionId,
                resourceId,
            },
        });

        // Create notification for resource owner if collection is public
        if (collection.isPublic && resource.ownerUserId && resource.ownerUserId !== userId) {
            const collectionOwner = await prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, displayName: true },
            });

            await this.notificationService.createNotification({
                userId: resource.ownerUserId,
                type: NotificationType.COLLECTION_ADDITION,
                title: 'Resource Added to Collection',
                message: `${collectionOwner?.displayName || collectionOwner?.username} added ${resource.name} to their collection "${collection.name}"`,
                data: { resourceId, collectionId, collectorId: userId },
            });
        }

        return {
            message: 'Resource added to collection',
            added: true,
            collectionId,
            resourceId,
        };
    }

    /**
     * Quick save to default collection
     */
    async addResourceToDefaultCollection(resourceId: string, userId: string) {
        // Get or create default collection
        const defaultCollection = await this.getOrCreateDefaultCollection(userId);

        // Add resource to it
        return this.addResourceToCollection(defaultCollection.id, resourceId, userId);
    }

    /**
     * Remove resource from a collection
     */
    async removeResourceFromCollection(collectionId: string, resourceId: string, userId: string) {
        // Verify collection ownership
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        // Check if resource is in collection
        const existing = await prisma.userResourceCollectionItem.findUnique({
            where: {
                collectionId_resourceId: {
                    collectionId,
                    resourceId,
                },
            },
        });

        if (!existing) {
            return {
                message: 'Resource not in collection',
                removed: false,
                collectionId,
                resourceId,
            };
        }

        await prisma.userResourceCollectionItem.delete({
            where: {
                collectionId_resourceId: {
                    collectionId,
                    resourceId,
                },
            },
        });

        return {
            message: 'Resource removed from collection',
            removed: true,
            collectionId,
            resourceId,
        };
    }

    /**
     * Get items in a collection with resource details
     */
    async getCollectionItems(collectionId: string, userId: string) {
        // Verify collection ownership
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        const items = await prisma.userResourceCollectionItem.findMany({
            where: { collectionId },
            include: {
                resource: {
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
                    },
                },
            },
            orderBy: {
                addedAt: 'desc',
            },
        });

        return {
            collection: {
                id: collection.id,
                name: collection.name,
                description: collection.description,
                isDefault: collection.isDefault,
                isPublic: collection.isPublic,
            },
            items: items.map((item) => ({
                addedAt: item.addedAt,
                resource: item.resource,
            })),
            count: items.length,
        };
    }

    /**
     * Check if a resource is in a collection
     */
    async isResourceInCollection(collectionId: string, resourceId: string, userId: string) {
        // Verify collection ownership
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (collection.userId !== userId) {
            throw new ForbiddenException('You do not have access to this collection');
        }

        const item = await prisma.userResourceCollectionItem.findUnique({
            where: {
                collectionId_resourceId: {
                    collectionId,
                    resourceId,
                },
            },
        });

        return {
            inCollection: !!item,
        };
    }

    /**
     * Get all collections that contain a specific resource (for current user)
     */
    async getResourceCollections(resourceId: string, userId: string) {
        const collections = await prisma.userResourceCollection.findMany({
            where: {
                userId,
                items: {
                    some: {
                        resourceId,
                    },
                },
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' },
            ],
        });

        return {
            collections: collections.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                isDefault: c.isDefault,
                isPublic: c.isPublic,
                itemCount: c._count.items,
            })),
            count: collections.length,
        };
    }

    /**
     * Get public collections for a user (for profile pages)
     */
    async getPublicCollectionsByUser(userId: string) {
        const collections = await prisma.userResourceCollection.findMany({
            where: {
                userId,
                isPublic: true,
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return {
            collections: collections.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                isDefault: c.isDefault,
                itemCount: c._count.items,
                createdAt: c.createdAt,
            })),
            count: collections.length,
        };
    }

    /**
     * Get a collection by ID (public view - anyone can access if public)
     */
    async getPublicCollection(collectionId: string) {
        const collection = await prisma.userResourceCollection.findUnique({
            where: { id: collectionId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                items: {
                    include: {
                        resource: {
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
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        addedAt: 'desc',
                    },
                },
                _count: {
                    select: { items: true },
                },
            },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        if (!collection.isPublic) {
            throw new ForbiddenException('This collection is private');
        }

        return {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            isDefault: collection.isDefault,
            isPublic: collection.isPublic,
            itemCount: collection._count.items,
            createdAt: collection.createdAt,
            user: collection.user,
            items: collection.items.map((item) => ({
                addedAt: item.addedAt,
                resource: item.resource,
            })),
        };
    }
}
