import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { prisma, NotificationType } from '@repo/db';
import { NotificationService } from '../notification/notification.service';
import { CreateShowcaseCommentDto } from './dtos/create-showcase-comment.dto';

@Injectable()
export class ShowcaseCommentService {
    constructor(private readonly notificationService: NotificationService) { }

    /**
     * Create a comment on a showcase post (or reply to another comment)
     */
    async createComment(postId: string, userId: string, createDto: CreateShowcaseCommentDto) {
        // Check if post exists
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        // If replying to a comment, validate parent exists and belongs to same post
        if (createDto.parentId) {
            const parentComment = await prisma.showcasePostComment.findUnique({
                where: { id: createDto.parentId },
            });

            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }

            if (parentComment.postId !== postId) {
                throw new BadRequestException('Parent comment does not belong to this post');
            }
        }

        // Create comment and increment count
        const [comment] = await prisma.$transaction([
            prisma.showcasePostComment.create({
                data: {
                    content: createDto.content,
                    userId,
                    postId,
                    parentId: createDto.parentId || null,
                },
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
            }),
            prisma.showcasePost.update({
                where: { id: postId },
                data: {
                    commentCount: { increment: 1 },
                },
            }),
        ]);

        // Create notification for post author (if not commenting on own post)
        if (post.authorId !== userId) {
            await this.notificationService.createNotification({
                userId: post.authorId,
                type: NotificationType.SHOWCASE_COMMENT,
                title: 'New Comment',
                message: `${comment.user.displayName || comment.user.username} commented on your showcase post`,
                data: { postId, commentId: comment.id, commenterId: userId },
            });
        }

        return comment;
    }

    /**
     * Delete a comment
     */
    async deleteComment(commentId: string, userId: string) {
        const comment = await prisma.showcasePostComment.findUnique({
            where: { id: commentId },
            include: { post: true, replies: true },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Only author of comment or post owner can delete
        if (comment.userId !== userId && comment.post.authorId !== userId) {
            throw new ForbiddenException('You cannot delete this comment');
        }

        // Count replies to decrement properly
        const replyCount = comment.replies.length;

        // Delete and decrement count (including all replies)
        await prisma.$transaction([
            prisma.showcasePostComment.delete({
                where: { id: commentId },
            }),
            prisma.showcasePost.update({
                where: { id: comment.postId },
                data: {
                    commentCount: { decrement: 1 + replyCount },
                },
            }),
        ]);

        return { message: 'Comment deleted successfully' };
    }

    /**
     * Get comments for a post (top-level with nested replies)
     */
    async getComments(postId: string, page: number = 1, limit: number = 20) {
        // Get top-level comments only (parentId is null)
        const [comments, total] = await Promise.all([
            prisma.showcasePostComment.findMany({
                where: {
                    postId,
                    parentId: null, // Only top-level comments
                },
                orderBy: { createdAt: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    replies: {
                        orderBy: { createdAt: 'asc' },
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
            }),
            prisma.showcasePostComment.count({
                where: {
                    postId,
                    parentId: null, // Count only top-level
                }
            }),
        ]);

        return {
            data: comments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
