import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { AddContributorDto, UpdateContributorDto } from './dtos/contributor.dto';
import { prisma } from '@repo/db';

@Injectable()
export class ContributorService {
    constructor() { }

    /**
     * Add a contributor to a resource
     */
    async addContributor(resourceId: string, userId: string, dto: AddContributorDto) {
        // Check if resource exists and user is owner
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canManage = await this.checkManagePermission(userId, resource);
        if (!canManage) {
            throw new ForbiddenException('Only the resource owner or team admins can add contributors');
        }

        // Check if user to add exists
        const userToAdd = await prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!userToAdd) {
            throw new NotFoundException('User to add not found');
        }

        // Check if already a contributor
        const existingContributor = await prisma.resourceContributor.findUnique({
            where: {
                resourceId_userId: {
                    resourceId,
                    userId: dto.userId,
                },
            },
        });

        if (existingContributor) {
            throw new BadRequestException('User is already a contributor');
        }

        // Add contributor
        const contributor = await prisma.resourceContributor.create({
            data: {
                resourceId,
                userId: dto.userId,
                role: dto.role,
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
        });

        return {
            message: 'Contributor added successfully',
            contributor,
        };
    }

    /**
     * Update a contributor's role
     */
    async updateContributor(resourceId: string, contributorUserId: string, userId: string, dto: UpdateContributorDto) {
        // Check if resource exists and user is owner
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canManage = await this.checkManagePermission(userId, resource);
        if (!canManage) {
            throw new ForbiddenException('Only the resource owner or team admins can update contributors');
        }

        // Check if contributor exists
        const contributor = await prisma.resourceContributor.findUnique({
            where: {
                resourceId_userId: {
                    resourceId,
                    userId: contributorUserId,
                },
            },
        });

        if (!contributor) {
            throw new NotFoundException('Contributor not found');
        }

        // Update contributor
        const updatedContributor = await prisma.resourceContributor.update({
            where: {
                resourceId_userId: {
                    resourceId,
                    userId: contributorUserId,
                },
            },
            data: {
                role: dto.role,
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
        });

        return {
            message: 'Contributor updated successfully',
            contributor: updatedContributor,
        };
    }

    /**
     * Remove a contributor from a resource
     */
    async removeContributor(resourceId: string, contributorUserId: string, userId: string) {
        // Check if resource exists and user is owner
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Check permission
        const canManage = await this.checkManagePermission(userId, resource);
        if (!canManage) {
            throw new ForbiddenException('Only the resource owner or team admins can remove contributors');
        }

        // Check if contributor exists
        const contributor = await prisma.resourceContributor.findUnique({
            where: {
                resourceId_userId: {
                    resourceId,
                    userId: contributorUserId,
                },
            },
        });

        if (!contributor) {
            throw new NotFoundException('Contributor not found');
        }

        // Remove contributor
        await prisma.resourceContributor.delete({
            where: {
                resourceId_userId: {
                    resourceId,
                    userId: contributorUserId,
                },
            },
        });

        return {
            message: 'Contributor removed successfully',
        };
    }

    /**
     * Get all contributors for a resource
     */
    async getContributors(resourceId: string) {
        const contributors = await prisma.resourceContributor.findMany({
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
                addedAt: 'asc',
            },
        });

        return {
            contributors,
        };
    }


    /**
     * Check if user has permission to manage contributors
     */
    private async checkManagePermission(
        userId: string,
        resource: { ownerUserId?: string | null; ownerTeamId?: string | null },
    ): Promise<boolean> {
        // Direct owner
        if (resource.ownerUserId === userId) {
            return true;
        }

        // Team member with permission
        if (resource.ownerTeamId) {
            const member = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: resource.ownerTeamId,
                        userId,
                    },
                },
            });

            if (member && ['OWNER', 'ADMIN'].includes(member.role)) {
                return true;
            }
        }

        return false;
    }
}
