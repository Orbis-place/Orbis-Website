import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { prisma } from '@repo/db';
import { CreateResourceCommentDto } from './dtos/create-resource-comment.dto';

@Injectable()
export class CommentService {
    /**
     * Create a comment on a resource (or reply to another comment)
     * For main comments, stores the current latestVersionId
     * For replies (parentId provided), versionId is null
     */
    async createComment(resourceId: string, userId: string, createDto: CreateResourceCommentDto) {
        // Check if resource exists and get latest version
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { id: true, latestVersionId: true, ownerUserId: true },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // If replying to a comment, validate parent exists and belongs to same resource
        if (createDto.parentId) {
            const parentComment = await prisma.resourceComment.findUnique({
                where: { id: createDto.parentId },
            });

            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }

            if (parentComment.resourceId !== resourceId) {
                throw new BadRequestException('Parent comment does not belong to this resource');
            }
        }

        // Create comment and increment count
        // versionId is only set for main comments (not replies)
        const [comment] = await prisma.$transaction([
            prisma.resourceComment.create({
                data: {
                    content: createDto.content,
                    userId,
                    resourceId,
                    versionId: createDto.parentId ? null : resource.latestVersionId,
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
                    version: {
                        select: {
                            id: true,
                            versionNumber: true,
                        },
                    },
                },
            }),
            prisma.resource.update({
                where: { id: resourceId },
                data: {
                    commentCount: { increment: 1 },
                },
            }),
        ]);

        return comment;
    }

    /**
     * Delete a comment
     * Only author of comment or resource owner can delete
     */
    async deleteComment(commentId: string, userId: string) {
        const comment = await prisma.resourceComment.findUnique({
            where: { id: commentId },
            include: {
                resource: {
                    select: { ownerUserId: true },
                },
                replies: true,
            },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Only author of comment or resource owner can delete
        if (comment.userId !== userId && comment.resource.ownerUserId !== userId) {
            throw new ForbiddenException('You cannot delete this comment');
        }

        // Count replies to decrement properly
        const replyCount = comment.replies.length;

        // Delete and decrement count (including all replies)
        await prisma.$transaction([
            prisma.resourceComment.delete({
                where: { id: commentId },
            }),
            prisma.resource.update({
                where: { id: comment.resourceId },
                data: {
                    commentCount: { decrement: 1 + replyCount },
                },
            }),
        ]);

        return { message: 'Comment deleted successfully' };
    }

    /**
     * Get comments for a resource (top-level with nested replies)
     * Includes version information for main comments
     */
    async getComments(resourceId: string, page: number = 1, limit: number = 20) {
        // Check if resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { id: true },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Get top-level comments only (parentId is null)
        const [comments, total] = await Promise.all([
            prisma.resourceComment.findMany({
                where: {
                    resourceId,
                    parentId: null, // Only top-level comments
                },
                orderBy: { createdAt: 'desc' },
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
                    version: {
                        select: {
                            id: true,
                            versionNumber: true,
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
            prisma.resourceComment.count({
                where: {
                    resourceId,
                    parentId: null, // Count only top-level
                },
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
