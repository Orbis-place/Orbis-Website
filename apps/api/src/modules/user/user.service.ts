import {BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {UpdateProfileDto} from "./dtos/update-profile.dto";
import {PrismaService} from "../../prisma/prisma.service";
import {StorageService} from "../storage/storage.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) {
    }

    async findById(userId: string) {
        return this.prisma.user.findUnique({
            where: {id: userId},
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
        return this.prisma.user.update({
            where: {id: userId},
            data: updateDto,
        });
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

        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {image: true},
        });

        const imageUrl = await this.storage.uploadFile(
            file,
            `users/${userId}/profile`,
        );

        const updatedUser = await this.prisma.user.update({
            where: {id: userId},
            data: {image: imageUrl},
        });

        if (user?.image) {
            await this.storage.deleteFile(user.image).catch(() => {
            });
        }

        return updatedUser;
    }

    async deleteProfileImage(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {image: true},
        });

        if (user?.image) {
            await this.storage.deleteFile(user.image);
        }

        return this.prisma.user.update({
            where: {id: userId},
            data: {image: null},
        });
    }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        const userToFollow = await this.prisma.user.findUnique({
            where: {id: followingId},
        });

        if (!userToFollow) {
            throw new NotFoundException('User not found');
        }

        const existingFollow = await this.prisma.follow.findUnique({
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

        return this.prisma.follow.create({
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
        const follow = await this.prisma.follow.findUnique({
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

        return this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    async getFollowers(userId: string) {
        const followers = await this.prisma.follow.findMany({
            where: {followingId: userId},
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
        const following = await this.prisma.follow.findMany({
            where: {followerId: userId},
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
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
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
}