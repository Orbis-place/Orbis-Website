import { Injectable, NotFoundException } from '@nestjs/common';

import { prisma } from '@repo/db';
@Injectable()
export class LikeService {
    constructor() { }

    /**
     * Like a resource
     */
    async likeResource(resourceId: string, userId: string) {
        // Check if resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check if already liked
        const existingLike = await prisma.resourceLike.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        if (existingLike) {
            // Already liked, return success
            return {
                message: 'Resource already liked',
                liked: true,
            };
        }

        // Create like and increment like count
        await prisma.$transaction([
            prisma.resourceLike.create({
                data: {
                    userId,
                    resourceId,
                },
            }),
            prisma.resource.update({
                where: { id: resourceId },
                data: {
                    likeCount: {
                        increment: 1,
                    },
                },
            }),
        ]);

        return {
            message: 'Resource liked successfully',
            liked: true,
        };
    }

    /**
     * Unlike a resource
     */
    async unlikeResource(resourceId: string, userId: string) {
        // Check if resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check if liked
        const existingLike = await prisma.resourceLike.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        if (!existingLike) {
            // Not liked, return success
            return {
                message: 'Resource not liked',
                liked: false,
            };
        }

        // Delete like and decrement like count
        await prisma.$transaction([
            prisma.resourceLike.delete({
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
                    likeCount: {
                        decrement: 1,
                    },
                },
            }),
        ]);

        return {
            message: 'Resource unliked successfully',
            liked: false,
        };
    }

    /**
     * Check if user has liked a resource
     */
    async hasLiked(resourceId: string, userId: string) {
        const like = await prisma.resourceLike.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        return {
            liked: !!like,
        };
    }

    /**
     * Get users who liked a resource
     */
    async getLikes(resourceId: string) {
        const likes = await prisma.resourceLike.findMany({
            where: { resourceId },
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        return {
            likes,
            count: likes.length,
        };
    }
}
