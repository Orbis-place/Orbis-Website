import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { StorageService } from "../storage/storage.service";
import { SearchUsersDto } from "./dtos/search-users.dto";
import { prisma } from '@repo/db';

@Injectable()
export class UserService {
    constructor(

        private readonly storage: StorageService,
    ) {
    }

    async findById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                emailVerified: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                displayName: true,
                banner: true,
                bio: true,
                location: true,
                website: true,
                role: true,
                status: true,
                reputation: true,
                emailNotifications: true,
                marketingEmails: true,
                showEmail: true,
                showLocation: true,
                showOnlineStatus: true,
                theme: true,
                language: true,
                lastLoginAt: true,
                lastActiveAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
                userBadges: {
                    select: {
                        id: true,
                        awardedAt: true,
                        badge: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                description: true,
                                icon: true,
                                color: true,
                                rarity: true,
                            },
                        },
                    },
                    orderBy: {
                        awardedAt: 'desc',
                    },
                },
            },
        });
    }

    async updateProfile(userId: string, updateDto: UpdateProfileDto) {
        try {
            return await prisma.user.update({
                where: { id: userId },
                data: updateDto,
            });
        } catch (error: any) {
            // Handle Prisma unique constraint violation (P2002)
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                if (field === 'username') {
                    throw new ConflictException('This username is already taken');
                }
                throw new ConflictException(`This ${field} is already taken`);
            }
            throw error;
        }
    }

    async uploadProfileImage(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed');
        }

        // Max 5MB
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 5MB');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { image: true },
        });

        const imageUrl = await this.storage.uploadFile(
            file,
            `users/${userId}/profile`,
        );

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
        });

        if (user?.image) {
            await this.storage.deleteFile(user.image).catch(() => {
            });
        }

        return updatedUser;
    }

    async deleteProfileImage(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { image: true },
        });

        if (user?.image) {
            await this.storage.deleteFile(user.image);
        }

        return prisma.user.update({
            where: { id: userId },
            data: { image: null },
        });
    }

    async uploadProfileBanner(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed');
        }

        // Max 10MB for banner
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 10MB');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { banner: true },
        });

        const bannerUrl = await this.storage.uploadFile(
            file,
            `users/${userId}/banner`,
        );

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { banner: bannerUrl },
        });

        if (user?.banner) {
            await this.storage.deleteFile(user.banner).catch(() => {
            });
        }

        return updatedUser;
    }

    async deleteProfileBanner(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { banner: true },
        });

        if (user?.banner) {
            await this.storage.deleteFile(user.banner);
        }

        return prisma.user.update({
            where: { id: userId },
            data: { banner: null },
        });
    }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        const userToFollow = await prisma.user.findUnique({
            where: { id: followingId },
        });

        if (!userToFollow) {
            throw new NotFoundException('User not found');
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            throw new ConflictException('You are already following this user');
        }

        return prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
        });
    }

    async unfollowUser(followerId: string, followingId: string) {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (!follow) {
            throw new NotFoundException('You are not following this user');
        }

        return prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    async getFollowers(userId: string) {
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                        bio: true,
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return followers.map(f => ({
            ...f.follower,
            followedAt: f.createdAt,
        }));
    }

    async getFollowing(userId: string) {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                        bio: true,
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return following.map(f => ({
            ...f.following,
            followedAt: f.createdAt,
        }));
    }

    async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                displayName: true,
                image: true,
                banner: true,
                bio: true,
                location: true,
                website: true,
                role: true,
                status: true,
                reputation: true,
                showEmail: true,
                showLocation: true,
                showOnlineStatus: true,
                createdAt: true,
                lastActiveAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
                userBadges: {
                    select: {
                        id: true,
                        awardedAt: true,
                        badge: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                description: true,
                                icon: true,
                                color: true,
                                rarity: true,
                            },
                        },
                    },
                    orderBy: {
                        awardedAt: 'desc',
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getUserProfileByUsername(username: string, currentUserId?: string) {
        const user = await prisma.user.findFirst({
            where: { username: { equals: username, mode: 'insensitive' } },
            select: {
                id: true,
                username: true,
                displayName: true,
                image: true,
                banner: true,
                bio: true,
                location: true,
                website: true,
                role: true,
                status: true,
                reputation: true,
                showEmail: true,
                showLocation: true,
                showOnlineStatus: true,
                createdAt: true,
                lastActiveAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        ownedResources: {
                            where: {
                                status: 'APPROVED',
                            },
                        },
                        ownedServers: {
                            where: {
                                status: 'APPROVED',
                            },
                        },
                    },
                },
                userBadges: {
                    select: {
                        id: true,
                        awardedAt: true,
                        badge: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                description: true,
                                icon: true,
                                color: true,
                                rarity: true,
                            },
                        },
                    },
                    orderBy: {
                        awardedAt: 'desc',
                    },
                },
                teamMemberships: {
                    select: {
                        id: true,
                        role: true,
                        joinedAt: true,
                        team: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                            },
                        },
                    },
                    orderBy: {
                        joinedAt: 'desc',
                    },
                },
                ownedResources: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        tagline: true,
                        iconUrl: true,
                        type: true,
                        status: true,
                        downloadCount: true,
                        likeCount: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    where: {
                        status: 'APPROVED',
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 6,
                },
                ownedServers: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        shortDesc: true,
                        logoUrl: true,
                        serverAddress: true,
                        status: true,
                        isOnline: true,
                        currentPlayers: true,
                        maxPlayers: true,
                        createdAt: true,
                    },
                    where: {
                        status: 'APPROVED',
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 6,
                },
                socialLinks: {
                    select: {
                        id: true,
                        type: true,
                        url: true,
                        label: true,
                        order: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        let isFollowing = false;
        if (currentUserId) {
            console.log('Checking follow status for:', { currentUserId, targetUserId: user.id });
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id,
                    },
                },
            });
            console.log('Follow result:', follow);
            isFollowing = !!follow;
        }

        return {
            ...user,
            isFollowing,
        };
    }

    /**
     * Search users by username or display name
     * Results are sorted by query length match (shorter matches first for 3-letter queries)
     */
    async searchUsers(searchDto: SearchUsersDto) {
        const { query, limit = 10 } = searchDto;
        const queryLower = query.toLowerCase();

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        status: 'ACTIVE',
                    },
                    {
                        OR: [
                            {
                                username: {
                                    contains: queryLower,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                displayName: {
                                    contains: queryLower,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                image: true,
                reputation: true,
            },
            take: limit * 2, // Get more results for sorting
        });

        // Sort by length (shorter names first for 3-letter queries)
        const sortedUsers = users.sort((a, b) => {
            const aUsername = a.username.toLowerCase();
            const bUsername = b.username.toLowerCase();
            const aDisplayName = (a.displayName || '').toLowerCase();
            const bDisplayName = (b.displayName || '').toLowerCase();

            // Check if username or displayName starts with the query
            const aUsernameStarts = aUsername.startsWith(queryLower);
            const bUsernameStarts = bUsername.startsWith(queryLower);
            const aDisplayNameStarts = aDisplayName.startsWith(queryLower);
            const bDisplayNameStarts = bDisplayName.startsWith(queryLower);

            // Prioritize results that start with the query
            if ((aUsernameStarts || aDisplayNameStarts) && !(bUsernameStarts || bDisplayNameStarts)) {
                return -1;
            }
            if (!(aUsernameStarts || aDisplayNameStarts) && (bUsernameStarts || bDisplayNameStarts)) {
                return 1;
            }

            // For 3-letter queries, sort by length (shorter first)
            if (query.length === 3) {
                const aMinLength = Math.min(aUsername.length, aDisplayName.length || Infinity);
                const bMinLength = Math.min(bUsername.length, bDisplayName.length || Infinity);
                return aMinLength - bMinLength;
            }

            // Default sort by username
            return aUsername.localeCompare(bUsername);
        });

        return sortedUsers.slice(0, limit);
    }

    // ============================================
    // SOCIAL LINKS
    // ============================================

    async getSocialLinks(userId: string) {
        return prisma.userSocialLink.findMany({
            where: { userId },
            orderBy: { order: 'asc' },
        });
    }

    async createSocialLink(userId: string, data: { type: string; url: string; label?: string }) {
        // Check if user already has a link of this type
        const existingLink = await prisma.userSocialLink.findUnique({
            where: {
                userId_type: {
                    userId,
                    type: data.type as any,
                },
            },
        });

        if (existingLink) {
            throw new ConflictException('You already have a link of this type');
        }

        // Get current max order
        const maxOrderLink = await prisma.userSocialLink.findFirst({
            where: { userId },
            orderBy: { order: 'desc' },
        });

        return prisma.userSocialLink.create({
            data: {
                userId,
                type: data.type as any,
                url: data.url,
                label: data.label,
                order: maxOrderLink ? maxOrderLink.order + 1 : 0,
            },
        });
    }

    async updateSocialLink(userId: string, linkId: string, data: { url?: string; label?: string }) {
        const link = await prisma.userSocialLink.findUnique({
            where: { id: linkId },
        });

        if (!link) {
            throw new NotFoundException('Social link not found');
        }

        if (link.userId !== userId) {
            throw new BadRequestException('You can only update your own social links');
        }

        return prisma.userSocialLink.update({
            where: { id: linkId },
            data,
        });
    }

    async deleteSocialLink(userId: string, linkId: string) {
        const link = await prisma.userSocialLink.findUnique({
            where: { id: linkId },
        });

        if (!link) {
            throw new NotFoundException('Social link not found');
        }

        if (link.userId !== userId) {
            throw new BadRequestException('You can only delete your own social links');
        }

        await prisma.userSocialLink.delete({
            where: { id: linkId },
        });

        return { message: 'Social link deleted successfully' };
    }

    async reorderSocialLinks(userId: string, linkIds: string[]) {
        // Verify all links belong to the user
        const links = await prisma.userSocialLink.findMany({
            where: {
                id: { in: linkIds },
                userId,
            },
        });

        if (links.length !== linkIds.length) {
            throw new BadRequestException('Some link IDs are invalid or do not belong to you');
        }

        // Update order for each link
        const updates = linkIds.map((linkId, index) =>
            prisma.userSocialLink.update({
                where: { id: linkId },
                data: { order: index },
            })
        );

        await Promise.all(updates);

        return this.getSocialLinks(userId);
    }
}