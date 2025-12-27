import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { StorageService } from '../storage/storage.service';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { FilterTeamsDto } from './dtos/filter-teams.dto';
import { UpdateTeamMemberDto } from './dtos/manage-member.dto';
import { CreateInvitationDto, RespondToInvitationDto, FilterInvitationsDto } from './dtos/invitation.dto';
import { prisma, TeamInvitationStatus, TeamMemberRole } from '@repo/db';

@Injectable()
export class TeamService {
    constructor(

        private readonly storage: StorageService,
    ) {
    }

    /**
     * Create a new team
     */
    async create(userId: string, createDto: CreateTeamDto) {
        // Check if team name is already taken
        const existing = await prisma.team.findUnique({
            where: { slug: createDto.slug.toLowerCase() },
        });

        if (existing) {
            throw new ConflictException('Team name is already taken');
        }

        // Create team with owner as first member
        const team = await prisma.team.create({
            data: {
                name: createDto.name.toLowerCase(),
                slug: createDto.slug.toLowerCase(),
                description: createDto.description,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: TeamMemberRole.OWNER,
                    },
                },
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                members: {
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
        });

        return team;
    }

    /**
     * Find all teams with filters and pagination
     */
    async findAll(filterDto: FilterTeamsDto) {
        const { search, page = 1, limit = 20 } = filterDto;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: {
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                    socialLinks: {
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            members: true,
                            servers: true,
                        },
                    },
                },
            }),
            prisma.team.count({ where }),
        ]);

        return {
            data: teams,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrevious: page > 1,
            },
        };
    }


    /**
     * Find team by name
     */
    async findBySlug(slug: string) {
        const team = await prisma.team.findUnique({
            where: { slug: slug.toLowerCase() },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                members: {
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
                    orderBy: [
                        { role: 'asc' },
                        { joinedAt: 'asc' },
                    ],
                },
                resources: {
                    where: {
                        status: 'APPROVED', // Only show approved resources
                    },
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
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                servers: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        currentPlayers: true,
                        maxPlayers: true,
                        isOnline: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                socialLinks: {
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        members: true,
                        resources: true,
                        servers: true,
                    },
                },
            },
        });

        if (!team) {
            throw new NotFoundException(`Team ${slug} not found`);
        }

        return team;
    }


    /**
     * Find team by ID (internal use)
     */
    async findById(teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        return team;
    }

    /**
     * Update team
     */
    async update(userId: string, teamId: string, updateDto: UpdateTeamDto) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { ownerId: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // Check if user has permission to edit
        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        const updateData: any = {};

        if (updateDto.slug !== undefined) updateData.slug = updateDto.slug;
        if (updateDto.description !== undefined) updateData.description = updateDto.description;

        const updated = await prisma.team.update({
            where: { id: teamId },
            data: updateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                members: {
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
        });

        return updated;
    }

    /**
     * Delete team
     */
    async delete(userId: string, teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { ownerId: true, logo: true, banner: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (team.ownerId !== userId) {
            throw new ForbiddenException('Only the team owner can delete the team');
        }

        // Delete files
        if (team.logo) {
            await this.storage.deleteFile(team.logo).catch(() => {
            });
        }
        if (team.banner) {
            await this.storage.deleteFile(team.banner).catch(() => {
            });
        }

        await prisma.team.delete({
            where: { id: teamId },
        });

        return { message: 'Team deleted successfully' };
    }

    /**
     * Upload team logo
     */
    async uploadLogo(userId: string, teamId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, and WebP are allowed',
            );
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 2MB');
        }

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { logo: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        const logoUrl = await this.storage.uploadFile(
            file,
            `teams/${teamId}/logo`,
        );

        const updated = await prisma.team.update({
            where: { id: teamId },
            data: { logo: logoUrl },
        });

        if (team.logo) {
            await this.storage.deleteFile(team.logo).catch(() => {
            });
        }

        return updated;
    }

    /**
     * Upload team banner
     */
    async uploadBanner(userId: string, teamId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, and WebP are allowed',
            );
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 5MB');
        }

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { banner: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        const bannerUrl = await this.storage.uploadFile(
            file,
            `teams/${teamId}/banner`,
        );

        const updated = await prisma.team.update({
            where: { id: teamId },
            data: { banner: bannerUrl },
        });

        if (team.banner) {
            await this.storage.deleteFile(team.banner).catch(() => {
            });
        }

        return updated;
    }

    /**
     * Delete team logo
     */
    async deleteLogo(userId: string, teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { logo: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        if (team.logo) {
            await this.storage.deleteFile(team.logo);
        }

        return prisma.team.update({
            where: { id: teamId },
            data: { logo: null },
        });
    }

    /**
     * Delete team banner
     */
    async deleteBanner(userId: string, teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { banner: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        if (team.banner) {
            await this.storage.deleteFile(team.banner);
        }

        return prisma.team.update({
            where: { id: teamId },
            data: { banner: null },
        });
    }

    /**
     * Create team invitation
     */
    async createInvitation(userId: string, teamId: string, createDto: CreateInvitationDto) {
        // Check if user has permission (owner or admin)
        const canManageMembers = await this.checkManageMembersPermission(userId, teamId);
        if (!canManageMembers) {
            throw new ForbiddenException('You do not have permission to invite members');
        }

        // Check if invitee exists
        const invitee = await prisma.user.findUnique({
            where: { id: createDto.inviteeId },
        });

        if (!invitee) {
            throw new NotFoundException('User not found');
        }

        // Cannot invite yourself
        if (userId === createDto.inviteeId) {
            throw new BadRequestException('You cannot invite yourself');
        }

        // Check if user is already a member
        const existingMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: createDto.inviteeId,
                },
            },
        });

        if (existingMember) {
            throw new ConflictException('User is already a member of this team');
        }

        // Check if there's already a pending invitation
        const existingInvitation = await prisma.teamInvitation.findFirst({
            where: {
                teamId,
                inviteeId: createDto.inviteeId,
                status: TeamInvitationStatus.PENDING,
            },
        });

        if (existingInvitation) {
            throw new ConflictException('There is already a pending invitation for this user');
        }

        // Only owner can invite as owner
        const role = createDto.role || TeamMemberRole.MEMBER;
        if (role === TeamMemberRole.OWNER) {
            const team = await prisma.team.findUnique({
                where: { id: teamId },
                select: { ownerId: true },
            });

            if (team?.ownerId !== userId) {
                throw new ForbiddenException('Only the team owner can invite other owners');
            }
        }

        // Create invitation (expires in 7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await prisma.teamInvitation.create({
            data: {
                teamId,
                inviterId: userId,
                inviteeId: createDto.inviteeId,
                role,
                expiresAt,
            },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                invitee: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
        });

        return invitation;
    }

    /**
     * Get team invitations
     */
    async getTeamInvitations(userId: string, teamId: string, filterDto: FilterInvitationsDto) {
        const canManageMembers = await this.checkManageMembersPermission(userId, teamId);
        if (!canManageMembers) {
            throw new ForbiddenException('You do not have permission to view team invitations');
        }

        const where: any = { teamId };
        if (filterDto.status) {
            where.status = filterDto.status;
        }

        const invitations = await prisma.teamInvitation.findMany({
            where,
            include: {
                inviter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
                invitee: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return invitations;
    }

    /**
     * Get user's received invitations
     */
    async getUserInvitations(userId: string, filterDto: FilterInvitationsDto) {
        const where: any = { inviteeId: userId };
        if (filterDto.status) {
            where.status = filterDto.status;
        }

        const invitations = await prisma.teamInvitation.findMany({
            where,
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return invitations;
    }

    /**
     * Respond to invitation (accept or decline)
     */
    async respondToInvitation(userId: string, invitationId: string, respondDto: RespondToInvitationDto) {
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId },
            include: { team: true },
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.inviteeId !== userId) {
            throw new ForbiddenException('You can only respond to your own invitations');
        }

        if (invitation.status !== TeamInvitationStatus.PENDING) {
            throw new BadRequestException('This invitation has already been responded to');
        }

        // Check if invitation has expired
        if (invitation.expiresAt < new Date()) {
            await prisma.teamInvitation.update({
                where: { id: invitationId },
                data: { status: TeamInvitationStatus.EXPIRED },
            });
            throw new BadRequestException('This invitation has expired');
        }

        // If accepting, add user as team member
        if (respondDto.response === TeamInvitationStatus.ACCEPTED) {
            // Check if user is already a member
            const existingMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: invitation.teamId,
                        userId,
                    },
                },
            });

            if (existingMember) {
                // Update invitation status anyway
                await prisma.teamInvitation.update({
                    where: { id: invitationId },
                    data: { status: TeamInvitationStatus.ACCEPTED },
                });
                throw new ConflictException('You are already a member of this team');
            }

            // Create team member and update invitation in a transaction
            const [updatedInvitation] = await prisma.$transaction([
                prisma.teamInvitation.update({
                    where: { id: invitationId },
                    data: { status: TeamInvitationStatus.ACCEPTED },
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                logo: true,
                            },
                        },
                        inviter: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                image: true,
                            },
                        },
                    },
                }),
                prisma.teamMember.create({
                    data: {
                        teamId: invitation.teamId,
                        userId,
                        role: invitation.role,
                    },
                }),
            ]);

            return updatedInvitation;
        } else {
            // Decline invitation
            const updatedInvitation = await prisma.teamInvitation.update({
                where: { id: invitationId },
                data: { status: TeamInvitationStatus.DECLINED },
                include: {
                    team: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logo: true,
                        },
                    },
                    inviter: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                        },
                    },
                },
            });

            return updatedInvitation;
        }
    }

    /**
     * Cancel invitation
     */
    async cancelInvitation(userId: string, teamId: string, invitationId: string) {
        const canManageMembers = await this.checkManageMembersPermission(userId, teamId);
        if (!canManageMembers) {
            throw new ForbiddenException('You do not have permission to cancel invitations');
        }

        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation || invitation.teamId !== teamId) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.status !== TeamInvitationStatus.PENDING) {
            throw new BadRequestException('Only pending invitations can be cancelled');
        }

        await prisma.teamInvitation.update({
            where: { id: invitationId },
            data: { status: TeamInvitationStatus.CANCELLED },
        });

        return { message: 'Invitation cancelled successfully' };
    }

    /**
     * Update team member role
     */
    async updateMember(
        userId: string,
        teamId: string,
        memberId: string,
        updateDto: UpdateTeamMemberDto,
    ) {

        const member = await prisma.teamMember.findUnique({
            where: { id: memberId },
            include: { team: true },
        });

        if (!member || member.teamId !== teamId) {
            throw new NotFoundException('Team member not found');
        }

        const canManageMembers = await this.checkManageMembersPermission(userId, teamId);
        if (!canManageMembers) {
            throw new ForbiddenException('You do not have permission to update members');
        }

        if (updateDto.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.OWNER) {
            const team = await prisma.team.findUnique({
                where: { id: teamId },
                select: { ownerId: true },
            });

            if (team?.ownerId !== userId) {
                throw new ForbiddenException('Only the team owner can modify owner roles');
            }
        }

        const updated = await prisma.teamMember.update({
            where: { id: memberId },
            data: { role: updateDto.role },
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

        return updated;
    }

    /**
     * Remove team member
     */
    async removeMember(userId: string, teamId: string, memberId: string) {
        // SECURITY FIX: Verify member belongs to THIS team BEFORE checking permissions
        // This prevents IDOR attacks where an attacker could remove members from any team
        const member = await prisma.teamMember.findUnique({
            where: { id: memberId },
        });

        if (!member || member.teamId !== teamId) {
            throw new NotFoundException('Team member not found');
        }

        // Now check permissions for THIS specific team
        const canManageMembers = await this.checkManageMembersPermission(userId, teamId);
        if (!canManageMembers) {
            throw new ForbiddenException('You do not have permission to remove members');
        }

        // Cannot remove the owner
        if (member.role === TeamMemberRole.OWNER) {
            throw new ForbiddenException('Cannot remove the team owner');
        }

        await prisma.teamMember.delete({
            where: { id: memberId },
        });

        return { message: 'Member removed successfully' };
    }

    /**
     * Leave team
     */
    async leaveTeam(userId: string, teamId: string) {
        const member = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId,
                },
            },
        });

        if (!member) {
            throw new NotFoundException('You are not a member of this team');
        }

        if (member.role === TeamMemberRole.OWNER) {
            throw new ForbiddenException(
                'Team owner cannot leave. Transfer ownership or delete the team instead.',
            );
        }

        await prisma.teamMember.delete({
            where: { id: member.id },
        });

        return { message: 'Left team successfully' };
    }

    /**
     * Get user's teams
     */
    async getUserTeams(userId: string) {
        const memberships = await prisma.teamMember.findMany({
            where: { userId },
            include: {
                team: {
                    include: {
                        owner: {
                            select: {
                                username: true,
                                displayName: true,
                                image: true,
                            },
                        },
                        _count: {
                            select: {
                                members: true,
                                servers: true,
                            },
                        },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });

        return memberships.map((m) => ({
            ...m.team,
            memberRole: m.role,
            joinedAt: m.joinedAt,
        }));
    }

    /**
     * Get team resources
     */
    async getTeamResources(teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const resources = await prisma.resource.findMany({
            where: { ownerTeamId: teamId },
            include: {
                ownerTeam: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        logo: true,
                        banner: true,
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
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        channel: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        versions: true,
                        likes: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return resources;
    }

    /**
     * Get team servers
     */
    async getTeamServers(teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const servers = await prisma.server.findMany({
            where: { ownerTeamId: teamId },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logoUrl: true,
                bannerUrl: true,
                currentPlayers: true,
                maxPlayers: true,
                isOnline: true,
                lastPing: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return servers;
    }

    /**
     * Get team showcase posts
     */
    async getTeamShowcase(teamId: string) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const showcasePosts = await prisma.showcasePost.findMany({
            where: {
                ownerTeamId: teamId,
                status: 'PUBLISHED',
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
                        slug: true,
                        name: true,
                        logo: true,
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
            orderBy: { createdAt: 'desc' },
        });

        return showcasePosts;
    }

    /**
     * Check if user has edit permission
     */
    private async checkEditPermission(userId: string, teamId: string): Promise<boolean> {
        const member = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId,
                },
            },
        });

        if (!member) {
            return false;
        }

        return (member.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.ADMIN);
    }

    /**
     * Check if user can manage members
     */
    private async checkManageMembersPermission(userId: string, teamId: string): Promise<boolean> {
        const member = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId,
                },
            },
        });

        if (!member) {
            return false;
        }

        return (member.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.ADMIN);
    }

    // ============================================
    // SOCIAL LINKS MANAGEMENT
    // ============================================

    /**
     * Get team social links
     */
    async getSocialLinks(teamId: string) {
        return prisma.teamSocialLink.findMany({
            where: { teamId },
            orderBy: { order: 'asc' },
        });
    }

    /**
     * Create team social link
     */
    async createSocialLink(userId: string, teamId: string, data: { type: string; url: string; label?: string }) {
        // Check permission
        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        // Check if team already has a link of this type
        const existingLink = await prisma.teamSocialLink.findUnique({
            where: {
                teamId_type: {
                    teamId,
                    type: data.type as any,
                },
            },
        });

        if (existingLink) {
            throw new ConflictException('Team already has a link of this type');
        }

        // Get current max order
        const maxOrderLink = await prisma.teamSocialLink.findFirst({
            where: { teamId },
            orderBy: { order: 'desc' },
        });

        return prisma.teamSocialLink.create({
            data: {
                teamId,
                type: data.type as any,
                url: data.url,
                label: data.label,
                order: maxOrderLink ? maxOrderLink.order + 1 : 0,
            },
        });
    }

    /**
     * Update team social link
     */
    async updateSocialLink(userId: string, teamId: string, linkId: string, data: { url?: string; label?: string }) {
        // Check permission
        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        const link = await prisma.teamSocialLink.findUnique({
            where: { id: linkId },
        });

        if (!link) {
            throw new NotFoundException('Social link not found');
        }

        if (link.teamId !== teamId) {
            throw new BadRequestException('This social link does not belong to this team');
        }

        return prisma.teamSocialLink.update({
            where: { id: linkId },
            data,
        });
    }

    /**
     * Delete team social link
     */
    async deleteSocialLink(userId: string, teamId: string, linkId: string) {
        // Check permission
        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        const link = await prisma.teamSocialLink.findUnique({
            where: { id: linkId },
        });

        if (!link) {
            throw new NotFoundException('Social link not found');
        }

        if (link.teamId !== teamId) {
            throw new BadRequestException('This social link does not belong to this team');
        }

        await prisma.teamSocialLink.delete({
            where: { id: linkId },
        });

        return { message: 'Social link deleted successfully' };
    }

    /**
     * Reorder team social links
     */
    async reorderSocialLinks(userId: string, teamId: string, linkIds: string[]) {
        // Check permission
        const canEdit = await this.checkEditPermission(userId, teamId);
        if (!canEdit) {
            throw new ForbiddenException('You do not have permission to edit this team');
        }

        // Verify all links belong to the team
        const links = await prisma.teamSocialLink.findMany({
            where: {
                id: { in: linkIds },
                teamId,
            },
        });

        if (links.length !== linkIds.length) {
            throw new BadRequestException('Some link IDs are invalid or do not belong to this team');
        }

        // Update order for each link
        const updates = linkIds.map((linkId, index) =>
            prisma.teamSocialLink.update({
                where: { id: linkId },
                data: { order: index },
            })
        );

        await Promise.all(updates);

        return this.getSocialLinks(teamId);
    }
}