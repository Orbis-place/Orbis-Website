import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class FavoriteService {
    constructor() { }

    /**
     * Add resource to favorites
     */
    async favoriteResource(resourceId: string, userId: string) {
        // Check if resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check if already favorited
        const existingFavorite = await prisma.resourceFavorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        if (existingFavorite) {
            // Already favorited, return success
            return {
                message: 'Resource already favorited',
                favorited: true,
            };
        }

        // Create favorite and increment favorite count
        await prisma.$transaction([
            prisma.resourceFavorite.create({
                data: {
                    userId,
                    resourceId,
                },
            }),
            prisma.resource.update({
                where: { id: resourceId },
                data: {
                    favoriteCount: {
                        increment: 1,
                    },
                },
            }),
        ]);

        return {
            message: 'Resource favorited successfully',
            favorited: true,
        };
    }

    /**
     * Remove resource from favorites
     */
    async unfavoriteResource(resourceId: string, userId: string) {
        // Check if resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check if favorited
        const existingFavorite = await prisma.resourceFavorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        if (!existingFavorite) {
            // Not favorited, return success
            return {
                message: 'Resource not favorited',
                favorited: false,
            };
        }

        // Delete favorite and decrement favorite count
        await prisma.$transaction([
            prisma.resourceFavorite.delete({
                where: {
                    userId_resourceId: {
                        userId,
                        resourceId,
                    },
                },
            }),
            prisma.resource.update({
                where: { id: resourceId },
                data: {
                    favoriteCount: {
                        decrement: 1,
                    },
                },
            }),
        ]);

        return {
            message: 'Resource unfavorited successfully',
            favorited: false,
        };
    }

    /**
     * Check if user has favorited a resource
     */
    async hasFavorited(resourceId: string, userId: string) {
        const favorite = await prisma.resourceFavorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        return {
            favorited: !!favorite,
        };
    }

    /**
     * Get user's favorites (liked resources)
     */
    async getUserFavorites(userId: string) {
        const likes = await prisma.resourceLike.findMany({
            where: { userId },
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
                createdAt: 'desc',
            },
        });

        // Map likes to favorites structure to maintain compatibility
        const favorites = likes.map(like => ({
            ...like,
            // Add any missing fields if ResourceFavorite had more than ResourceLike
            // They are structurally very similar (userId, resourceId, createdAt)
        }));

        return {
            favorites,
            count: favorites.length,
        };
    }
}
