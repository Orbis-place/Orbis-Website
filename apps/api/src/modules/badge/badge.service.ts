import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBadgeDto } from './dtos/create-badge.dto';
import { UpdateBadgeDto } from './dtos/update-badge.dto';
import { AwardBadgeDto } from './dtos/award-badge.dto';

@Injectable()
export class BadgeService {
    constructor(private readonly prisma: PrismaService) {}

    async createBadge(createDto: CreateBadgeDto) {
        const existing = await this.prisma.badge.findUnique({
            where: { slug: createDto.slug },
        });

        if (existing) {
            throw new ConflictException('Badge with this slug already exists');
        }

        return this.prisma.badge.create({
            data: createDto,
        });
    }

    async findAllBadges(isActive?: boolean) {
        return this.prisma.badge.findMany({
            where: isActive !== undefined ? { isActive } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });
    }

    async findBadgeById(badgeId: string) {
        const badge = await this.prisma.badge.findUnique({
            where: { id: badgeId },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });

        if (!badge) {
            throw new NotFoundException('Badge not found');
        }

        return badge;
    }

    async findBadgeBySlug(slug: string) {
        const badge = await this.prisma.badge.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });

        if (!badge) {
            throw new NotFoundException('Badge not found');
        }

        return badge;
    }

    async updateBadge(badgeId: string, updateDto: UpdateBadgeDto) {
        const badge = await this.prisma.badge.findUnique({
            where: { id: badgeId },
        });

        if (!badge) {
            throw new NotFoundException('Badge not found');
        }

        return this.prisma.badge.update({
            where: { id: badgeId },
            data: updateDto,
        });
    }

    async deleteBadge(badgeId: string) {
        const badge = await this.prisma.badge.findUnique({
            where: { id: badgeId },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });

        if (!badge) {
            throw new NotFoundException('Badge not found');
        }

        if (badge._count.userBadges > 0) {
            throw new BadRequestException(
                'Cannot delete badge that has been awarded to users',
            );
        }

        return this.prisma.badge.delete({
            where: { id: badgeId },
        });
    }

    async awardBadge(awardDto: AwardBadgeDto, awardedBy: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: awardDto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const badge = await this.prisma.badge.findUnique({
            where: { id: awardDto.badgeId },
        });

        if (!badge) {
            throw new NotFoundException('Badge not found');
        }

        if (!badge.isActive) {
            throw new BadRequestException('Cannot award inactive badge');
        }

        const existing = await this.prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId: awardDto.userId,
                    badgeId: awardDto.badgeId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('User already has this badge');
        }

        return this.prisma.userBadge.create({
            data: {
                userId: awardDto.userId,
                badgeId: awardDto.badgeId,
                awardedBy,
                reason: awardDto.reason,
            },
            include: {
                badge: true,
                user: {
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

    async revokeBadge(userId: string, badgeId: string) {
        const userBadge = await this.prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId,
                },
            },
        });

        if (!userBadge) {
            throw new NotFoundException('User does not have this badge');
        }

        return this.prisma.userBadge.delete({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId,
                },
            },
        });
    }

    async getUserBadges(userId: string) {
        return this.prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true,
            },
            orderBy: { awardedAt: 'desc' },
        });
    }

}
