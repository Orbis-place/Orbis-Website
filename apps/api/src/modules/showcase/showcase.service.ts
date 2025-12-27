import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { prisma, ShowcasePostStatus } from '@repo/db';
import { CreateShowcasePostDto } from './dtos/create-showcase-post.dto';
import { UpdateShowcasePostDto } from './dtos/update-showcase-post.dto';
import { FilterShowcasePostsDto } from './dtos/filter-showcase-posts.dto';
import { RedisService } from '../../common/redis.service';

@Injectable()
export class ShowcaseService {
    constructor(private readonly redisService: RedisService) { }

    /**
     * Create a new showcase post
     */
    async create(userId: string, createDto: CreateShowcasePostDto) {
        // Validate linked resource if provided
        if (createDto.linkedResourceId) {
            const resource = await prisma.resource.findUnique({
                where: { id: createDto.linkedResourceId },
            });
            if (!resource) {
                throw new BadRequestException('Linked resource not found');
            }
        }

        // If teamId is provided, validate user is a member with appropriate role
        let ownerTeamId: string | null = null;
        let ownerUserId: string | null = null;

        if (createDto.teamId) {
            const membership = await prisma.teamMember.findFirst({
                where: {
                    teamId: createDto.teamId,
                    userId: userId,
                    role: { in: ['OWNER', 'ADMIN', 'MODERATOR'] },
                },
            });

            if (!membership) {
                throw new ForbiddenException('You must be a team admin or owner to create showcase posts for this team');
            }

            ownerTeamId = createDto.teamId;
        } else {
            ownerUserId = userId;
        }

        const post = await prisma.showcasePost.create({
            data: {
                title: createDto.title,
                description: createDto.description,
                category: createDto.category,
                authorId: userId,
                ownerUserId,
                ownerTeamId,
                linkedResourceId: createDto.linkedResourceId,
                status: ShowcasePostStatus.DRAFT,
            },
            include: {
                author: {
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
            },
        });

        return post;
    }


    /**
     * Get a showcase post by ID
     */
    async getById(postId: string, userId?: string, ip?: string) {
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
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
                media: {
                    orderBy: { order: 'asc' },
                },
                linkedResource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        iconUrl: true,
                        type: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        // Check if user can view this post
        if (post.status !== ShowcasePostStatus.PUBLISHED && post.authorId !== userId) {
            throw new NotFoundException('Showcase post not found');
        }

        // Increment view count only for unique IPs (one view per IP per day)
        if (ip) {
            const shouldCount = await this.redisService.shouldCountView(postId, ip);
            if (shouldCount) {
                await prisma.showcasePost.update({
                    where: { id: postId },
                    data: { viewCount: { increment: 1 } },
                });
            }
        }

        // Check if current user has liked
        let hasLiked = false;
        if (userId) {
            const like = await prisma.showcasePostLike.findUnique({
                where: { userId_postId: { userId, postId } },
            });
            hasLiked = !!like;
        }

        return {
            ...post,
            hasLiked,
        };
    }

    /**
     * Check if user can edit/delete a post (author or team member with permission)
     */
    private async canEditPost(post: { authorId: string; ownerUserId: string | null; ownerTeamId: string | null }, userId: string): Promise<boolean> {
        // Author can always edit
        if (post.authorId === userId) {
            return true;
        }

        // If user owns it directly
        if (post.ownerUserId === userId) {
            return true;
        }

        // If owned by a team, check membership
        if (post.ownerTeamId) {
            const membership = await prisma.teamMember.findFirst({
                where: {
                    teamId: post.ownerTeamId,
                    userId: userId,
                    role: { in: ['OWNER', 'ADMIN', 'MODERATOR'] },
                },
            });
            return !!membership;
        }

        return false;
    }

    /**
     * Update a showcase post
     */
    async update(postId: string, userId: string, updateDto: UpdateShowcasePostDto) {
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        const canEdit = await this.canEditPost(post, userId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to update this post');
        }

        // Validate linked resource if provided
        if (updateDto.linkedResourceId) {
            const resource = await prisma.resource.findUnique({
                where: { id: updateDto.linkedResourceId },
            });
            if (!resource) {
                throw new BadRequestException('Linked resource not found');
            }
        }

        const updatedPost = await prisma.showcasePost.update({
            where: { id: postId },
            data: {
                title: updateDto.title,
                description: updateDto.description,
                category: updateDto.category,
                status: updateDto.status,
                linkedResourceId: updateDto.linkedResourceId,
                thumbnailUrl: updateDto.thumbnailUrl,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                media: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        return updatedPost;
    }

    /**
     * Delete a showcase post
     */
    async delete(postId: string, userId: string) {
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        const canEdit = await this.canEditPost(post, userId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to delete this post');
        }

        await prisma.showcasePost.delete({
            where: { id: postId },
        });

        return { message: 'Showcase post deleted successfully' };
    }

    /**
     * Get all published showcase posts with filters
     */
    async getAll(filterDto: FilterShowcasePostsDto) {
        const {
            category,
            authorId,
            authorUsername,
            featured,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
        } = filterDto;

        const where: any = {
            status: ShowcasePostStatus.PUBLISHED,
        };

        if (category) {
            where.category = category;
        }

        if (authorId) {
            where.authorId = authorId;
        }

        if (authorUsername) {
            where.author = {
                username: authorUsername,
            };
        }

        if (featured) {
            where.featured = true;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        const [posts, total] = await Promise.all([
            prisma.showcasePost.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    media: {
                        take: 1,
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            prisma.showcasePost.count({ where }),
        ]);

        return {
            data: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get user's own showcase posts (all statuses)
     */
    async getMyPosts(userId: string, page: number = 1, limit: number = 20) {
        const [posts, total] = await Promise.all([
            prisma.showcasePost.findMany({
                where: { authorId: userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    media: {
                        take: 1,
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            prisma.showcasePost.count({ where: { authorId: userId } }),
        ]);

        return {
            data: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get featured posts
     */
    async getFeatured(limit: number = 10) {
        const posts = await prisma.showcasePost.findMany({
            where: {
                status: ShowcasePostStatus.PUBLISHED,
                featured: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                media: {
                    take: 1,
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });

        return posts;
    }

    /**
     * Get categories with post counts
     */
    async getCategories() {
        const categories = await prisma.showcasePost.groupBy({
            by: ['category'],
            where: { status: ShowcasePostStatus.PUBLISHED },
            _count: { category: true },
        });

        return categories.map((c) => ({
            category: c.category,
            count: c._count.category,
        }));
    }

    // Get posts for sitemap
    async getSitemapPosts() {
        return prisma.showcasePost.findMany({
            where: {
                status: ShowcasePostStatus.PUBLISHED,
            },
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 1000,
        });
    }
}
