import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, NotificationType } from '@repo/db';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ShowcaseLikeService {
    constructor(private readonly notificationService: NotificationService) { }

    /**
     * Like a showcase post
     */
    async likePost(postId: string, userId: string) {
        // Check if post exists
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        // Check if already liked
        const existingLike = await prisma.showcasePostLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            return {
                message: 'Post already liked',
                liked: true,
            };
        }

        // Create like and increment count
        await prisma.$transaction([
            prisma.showcasePostLike.create({
                data: {
                    userId,
                    postId,
                },
            }),
            prisma.showcasePost.update({
                where: { id: postId },
                data: {
                    likeCount: { increment: 1 },
                },
            }),
        ]);

        // Create notification for post author (if not liking own post)
        if (post.authorId !== userId) {
            const liker = await prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, displayName: true },
            });

            await this.notificationService.createNotification({
                userId: post.authorId,
                type: NotificationType.SHOWCASE_LIKE,
                title: 'New Like',
                message: `${liker?.displayName || liker?.username} liked your showcase post`,
                data: { postId, likerId: userId },
            });
        }

        return {
            message: 'Post liked successfully',
            liked: true,
        };
    }

    /**
     * Unlike a showcase post
     */
    async unlikePost(postId: string, userId: string) {
        // Check if post exists
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        // Check if liked
        const existingLike = await prisma.showcasePostLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (!existingLike) {
            return {
                message: 'Post not liked',
                liked: false,
            };
        }

        // Delete like and decrement count
        await prisma.$transaction([
            prisma.showcasePostLike.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            }),
            prisma.showcasePost.update({
                where: { id: postId },
                data: {
                    likeCount: { decrement: 1 },
                },
            }),
        ]);

        return {
            message: 'Post unliked successfully',
            liked: false,
        };
    }

    /**
     * Check if user has liked a post
     */
    async hasLiked(postId: string, userId: string) {
        const like = await prisma.showcasePostLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        return { liked: !!like };
    }

    /**
     * Get users who liked a post
     */
    async getLikes(postId: string, limit: number = 20) {
        const likes = await prisma.showcasePostLike.findMany({
            where: { postId },
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
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return {
            likes: likes.map((l) => l.user),
            count: likes.length,
        };
    }
}
