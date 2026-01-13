import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';

import { StorageService } from '../storage/storage.service';
import { RedisService } from '../../common/redis.service';
import { VersionChangelogImageService } from './version-changelog-image.service';
import {
    CreateVersionDto,
    UpdateVersionDto,
    UpdateChangelogDto,
    RejectVersionDto,
} from './dtos/version.dto';
import { prisma, VersionStatus, FileType, UserRole, NotificationType, ResourceStatus } from '@repo/db';
import { NotificationService } from '../notification/notification.service';
import * as crypto from 'crypto';
import archiver from 'archiver';
import { Response } from 'express';

@Injectable()
export class VersionService {
    constructor(
        private readonly storageService: StorageService,
        private readonly redisService: RedisService,
        private readonly changelogImageService: VersionChangelogImageService,
        private readonly notificationService: NotificationService,
    ) { }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if user has permission to manage resource versions
     */
    private async checkResourcePermission(resourceId: string, userId: string) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                ownerTeam: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        const hasPermission =
            resource.ownerUserId === userId ||
            (resource.ownerTeam &&
                resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to manage this resource');
        }

        return resource;
    }

    /**
     * Check if user has moderation permission
     */
    private async checkModeratorPermission(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user || (user.role !== UserRole.MODERATOR && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new ForbiddenException('You do not have permission to moderate versions');
        }
    }

    /**
     * Get version with permission check
     */
    private async getVersionWithPermission(resourceId: string, versionId: string, userId: string) {
        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
            include: {
                resource: {
                    include: {
                        ownerTeam: {
                            include: {
                                members: true,
                            },
                        },
                    },
                },
                files: true,
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to manage this version');
        }

        return version;
    }

    // ============================================
    // VERSION CRUD
    // ============================================

    /**
     * Create a new version for a resource (DRAFT status)
     */
    async create(resourceId: string, userId: string, createDto: CreateVersionDto) {
        // Check permission
        await this.checkResourcePermission(resourceId, userId);

        // Check if version number already exists
        const existingVersion = await prisma.resourceVersion.findUnique({
            where: {
                resourceId_versionNumber: {
                    resourceId,
                    versionNumber: createDto.versionNumber,
                },
            },
        });

        if (existingVersion) {
            throw new BadRequestException(
                `Version ${createDto.versionNumber} already exists for this resource`,
            );
        }

        // Validate that all Hytale versions exist
        const hytaleVersions = await prisma.hytaleVersion.findMany({
            where: {
                id: { in: createDto.compatibleHytaleVersionIds },
            },
        });

        if (hytaleVersions.length !== createDto.compatibleHytaleVersionIds.length) {
            throw new BadRequestException('One or more Hytale version IDs are invalid');
        }

        // Create version
        const version = await prisma.resourceVersion.create({
            data: {
                resourceId,
                versionNumber: createDto.versionNumber,
                name: createDto.name,
                channel: createDto.channel,
                status: VersionStatus.DRAFT,
                compatibleVersions: {
                    create: createDto.compatibleHytaleVersionIds.map((hytaleVersionId) => ({
                        hytaleVersion: {
                            connect: { id: hytaleVersionId },
                        },
                    })),
                },
            },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
            },
        });

        // Update resource lastActivityAt
        await prisma.resource.update({
            where: { id: resourceId },
            data: { lastActivityAt: new Date() },
        });

        return {
            message: 'Version created successfully',
            version,
        };
    }

    /**
     * Get all versions for a resource
     */
    async findAll(resourceId: string) {
        const versions = await prisma.resourceVersion.findMany({
            where: { resourceId },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
                primaryFile: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            versions,
            total: versions.length,
        };
    }

    /**
     * Get a specific version by ID
     */
    async findOne(resourceId: string, versionId: string) {
        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
                primaryFile: true,
                changelogImages: true,
                resource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        ownerUserId: true,
                    },
                },
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        return { version };
    }

    /**
     * Update a version (status-aware restrictions)
     * - DRAFT & REJECTED: name, channel, compatible versions editable
     * - PENDING & APPROVED: not editable via this method
     */
    async update(
        resourceId: string,
        versionId: string,
        userId: string,
        updateDto: UpdateVersionDto,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Check status restrictions
        if (version.status === VersionStatus.PENDING || version.status === VersionStatus.APPROVED) {
            throw new BadRequestException(
                'Cannot modify version metadata while in PENDING or APPROVED status. Only changelog and files can be updated.',
            );
        }

        if (version.status === VersionStatus.ARCHIVED) {
            throw new BadRequestException('Cannot modify archived versions');
        }

        // Prepare update data
        const updateData: any = {};

        if (updateDto.name !== undefined) updateData.name = updateDto.name;
        if (updateDto.channel !== undefined) updateData.channel = updateDto.channel;

        // Update version
        await prisma.resourceVersion.update({
            where: { id: versionId },
            data: updateData,
        });

        // Update compatible versions if provided
        if (updateDto.compatibleHytaleVersionIds) {
            // Validate that all Hytale versions exist
            const hytaleVersions = await prisma.hytaleVersion.findMany({
                where: {
                    id: { in: updateDto.compatibleHytaleVersionIds },
                },
            });

            if (hytaleVersions.length !== updateDto.compatibleHytaleVersionIds.length) {
                throw new BadRequestException('One or more Hytale version IDs are invalid');
            }

            // Delete existing junction table entries
            await prisma.resourceVersionToHytaleVersion.deleteMany({
                where: { resourceVersionId: versionId },
            });

            // Create new junction table entries
            for (const hytaleVersionId of updateDto.compatibleHytaleVersionIds) {
                await prisma.resourceVersionToHytaleVersion.create({
                    data: {
                        resourceVersionId: versionId,
                        hytaleVersionId,
                    },
                });
            }
        }

        // Fetch updated version
        const finalVersion = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
                primaryFile: true,
            },
        });

        return {
            message: 'Version updated successfully',
            version: finalVersion,
        };
    }

    /**
     * Update version changelog (allowed in all statuses except ARCHIVED)
     */
    async updateChangelog(
        resourceId: string,
        versionId: string,
        userId: string,
        updateDto: UpdateChangelogDto,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        if (version.status === VersionStatus.ARCHIVED) {
            throw new BadRequestException('Cannot modify archived versions');
        }

        const updatedVersion = await prisma.resourceVersion.update({
            where: { id: versionId },
            data: { changelog: updateDto.changelog },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
                primaryFile: true,
            },
        });

        // Validate and mark changelog images as permanent
        if (updateDto.changelog) {
            await this.changelogImageService.validateImagesInChangelog(
                versionId,
                userId,
                updateDto.changelog,
            );
        }

        return {
            message: 'Changelog updated successfully',
            version: updatedVersion,
        };
    }

    /**
     * Delete a version
     */
    async delete(resourceId: string, versionId: string, userId: string) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Check if this is the latest version
        if (version.resource.latestVersionId === versionId) {
            throw new BadRequestException(
                'Cannot delete the latest version. Please set another version as latest first.',
            );
        }

        // Delete files from storage
        for (const file of version.files) {
            try {
                await this.storageService.deleteFile(file.url);
            } catch (error) {
                console.error(`Failed to delete file ${file.url}:`, error);
            }
        }

        // Delete version (cascade will delete files and compatible versions)
        await prisma.resourceVersion.delete({
            where: { id: versionId },
        });

        return {
            message: 'Version deleted successfully',
        };
    }

    // ============================================
    // VERSION WORKFLOW
    // ============================================

    /**
     * Submit a version for review (DRAFT -> PENDING)
     */
    async submit(resourceId: string, versionId: string, userId: string) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        if (version.status !== VersionStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT versions can be submitted for review');
        }

        // Validate that at least one file is uploaded
        if (version.files.length === 0) {
            throw new BadRequestException('At least one file must be uploaded before submitting');
        }

        // Validate that a primary file is set
        if (!version.primaryFileId) {
            throw new BadRequestException('A primary file must be set before submitting');
        }

        // Check if this is the first version being submitted
        const approvedVersionsCount = await prisma.resourceVersion.count({
            where: {
                resourceId,
                status: VersionStatus.APPROVED,
            },
        });

        const isFirstVersion = approvedVersionsCount === 0;

        const updatedVersion = await prisma.resourceVersion.update({
            where: { id: versionId },
            data: { status: VersionStatus.PENDING },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
                primaryFile: true,
            },
        });

        // If this is the first version and resource is DRAFT, update resource to PENDING
        if (isFirstVersion && version.resource.status === ResourceStatus.DRAFT) {
            await prisma.resource.update({
                where: { id: resourceId },
                data: { status: ResourceStatus.PENDING },
            });
        }

        return {
            message: 'Version submitted for review',
            version: updatedVersion,
        };
    }

    /**
     * Resubmit a rejected version for review (REJECTED -> PENDING)
     */
    async resubmit(resourceId: string, versionId: string, userId: string) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        if (version.status !== VersionStatus.REJECTED) {
            throw new BadRequestException('Only REJECTED versions can be resubmitted');
        }

        // Validate that at least one file is uploaded
        if (version.files.length === 0) {
            throw new BadRequestException('At least one file must be uploaded before resubmitting');
        }

        // Validate that a primary file is set
        if (!version.primaryFileId) {
            throw new BadRequestException('A primary file must be set before resubmitting');
        }

        // Check if this is the first version being resubmitted
        const approvedVersionsCount = await prisma.resourceVersion.count({
            where: {
                resourceId,
                status: VersionStatus.APPROVED,
            },
        });

        const isFirstVersion = approvedVersionsCount === 0;

        const updatedVersion = await prisma.resourceVersion.update({
            where: { id: versionId },
            data: {
                status: VersionStatus.PENDING,
                rejectionReason: null, // Clear rejection reason
            },
            include: {
                compatibleVersions: {
                    include: {
                        hytaleVersion: true,
                    },
                },
                files: true,
                primaryFile: true,
            },
        });

        // If this is the first version and resource is REJECTED or DRAFT, update resource to PENDING
        if (isFirstVersion && (version.resource.status === ResourceStatus.REJECTED || version.resource.status === ResourceStatus.DRAFT)) {
            await prisma.resource.update({
                where: { id: resourceId },
                data: { status: ResourceStatus.PENDING },
            });
        }

        return {
            message: 'Version resubmitted for review',
            version: updatedVersion,
        };
    }

    /**
     * Approve a pending version (PENDING -> APPROVED) - Moderators only
     */
    async approve(resourceId: string, versionId: string, userId: string) {
        console.log('[VersionService] approve() called:', { resourceId, versionId, userId });
        await this.checkModeratorPermission(userId);

        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        if (version.status !== VersionStatus.PENDING) {
            throw new BadRequestException('Only PENDING versions can be approved');
        }

        const updateData: any = {
            status: VersionStatus.APPROVED,
        };

        // Set publishedAt if first approval
        if (!version.publishedAt) {
            updateData.publishedAt = new Date();
        }

        const updatedVersion = await prisma.resourceVersion.update({
            where: { id: versionId },
            data: updateData,
            include: {
                compatibleVersions: { include: { hytaleVersion: true } },
                files: true,
                primaryFile: true,
                resource: {
                    select: {
                        id: true,
                        name: true,
                        ownerUserId: true,
                        ownerTeamId: true,
                        ownerTeam: {
                            select: {
                                id: true,
                                name: true,
                                ownerId: true,
                            },
                        },
                    },
                },
            },
        });

        console.log('[VERSION APPROVAL] Version approved:', {
            versionId,
            resourceId,
            ownerUserId: updatedVersion.resource.ownerUserId,
            ownerTeamId: updatedVersion.resource.ownerTeamId,
            teamOwnerId: updatedVersion.resource.ownerTeam?.ownerId,
            resourceName: updatedVersion.resource.name,
        });

        // Determine notification recipient (team owner or resource owner)
        const notificationRecipientId = updatedVersion.resource.ownerTeamId
            ? updatedVersion.resource.ownerTeam?.ownerId
            : updatedVersion.resource.ownerUserId;

        // Create notification for resource/team owner
        if (notificationRecipientId) {
            console.log('[NOTIFICATION] Creating VERSION_APPROVED notification for user:', notificationRecipientId);
            try {
                await this.notificationService.createNotification({
                    userId: notificationRecipientId,
                    type: NotificationType.VERSION_APPROVED,
                    title: 'Version Approved',
                    message: `Your version ${updatedVersion.versionNumber} for ${updatedVersion.resource.name} has been approved`,
                    data: { resourceId, versionId },
                });
                console.log('[NOTIFICATION] VERSION_APPROVED notification created successfully');
            } catch (error) {
                console.error('[NOTIFICATION] Failed to create VERSION_APPROVED notification:', error);
            }

            // Use creator ID for follower notifications
            const creatorId = notificationRecipientId;

            // Notify followers about new creator upload
            const followers = await prisma.follow.findMany({
                where: { followingId: creatorId },
                select: { followerId: true },
            });

            console.log('[NOTIFICATION] Found', followers.length, 'followers to notify for creator:', creatorId);

            const followerNotifications = followers.map(follower =>
                this.notificationService!.createNotification({
                    userId: follower.followerId,
                    type: NotificationType.NEW_CREATOR_UPLOAD,
                    title: 'New Upload',
                    message: `${updatedVersion.resource.name} has a new version: ${updatedVersion.versionNumber}`,
                    data: { resourceId, versionId, creatorId },
                })
            );

            await Promise.all(followerNotifications);
            console.log('[NOTIFICATION] Created', followerNotifications.length, 'follower notifications');
        } else {
            console.log('[NOTIFICATION] No ownerUserId or team owner found, skipping notifications');
        }

        // Update resource lastActivityAt
        await prisma.resource.update({
            where: { id: resourceId },
            data: { lastActivityAt: new Date() },
        });

        return {
            message: 'Version approved',
            version: updatedVersion,
        };
    }

    /**
     * Reject a pending version (PENDING -> REJECTED) - Moderators only
     */
    async reject(resourceId: string, versionId: string, userId: string, rejectDto: RejectVersionDto) {
        await this.checkModeratorPermission(userId);

        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        if (version.status !== VersionStatus.PENDING) {
            throw new BadRequestException('Only PENDING versions can be rejected');
        }

        const updatedVersion = await prisma.resourceVersion.update({
            where: { id: versionId },
            data: {
                status: VersionStatus.REJECTED,
                rejectionReason: rejectDto.reason,
            },
            include: {
                compatibleVersions: { include: { hytaleVersion: true } },
                files: true,
                primaryFile: true,
                resource: {
                    select: {
                        id: true,
                        name: true,
                        ownerUserId: true,
                        ownerTeamId: true,
                        ownerTeam: {
                            select: {
                                id: true,
                                name: true,
                                ownerId: true,
                            },
                        },
                    },
                },
            },
        });

        // Determine notification recipient (team owner or resource owner)
        const notificationRecipientId = updatedVersion.resource.ownerTeamId
            ? updatedVersion.resource.ownerTeam?.ownerId
            : updatedVersion.resource.ownerUserId;

        // Create notification for resource/team owner
        if (notificationRecipientId) {
            await this.notificationService.createNotification({
                userId: notificationRecipientId,
                type: NotificationType.VERSION_REJECTED,
                title: 'Version Rejected',
                message: `Your version ${updatedVersion.versionNumber} for ${updatedVersion.resource.name} was rejected: ${rejectDto.reason}`,
                data: { resourceId, versionId, reason: rejectDto.reason },
            });
        }

        return {
            message: 'Version rejected',
            version: updatedVersion,
        };
    }

    // ============================================
    // FILE MANAGEMENT
    // ============================================

    /**
     * Upload a file for a version (allowed in all statuses except ARCHIVED)
     */
    async uploadFile(
        resourceId: string,
        versionId: string,
        userId: string,
        file: Express.Multer.File,
        displayName?: string,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Cannot modify files on pending, approved or archived versions
        if (version.status === VersionStatus.PENDING || version.status === VersionStatus.APPROVED || version.status === VersionStatus.ARCHIVED) {
            throw new BadRequestException(
                'Cannot upload files to pending, approved or archived versions. Only DRAFT and REJECTED versions can be modified.',
            );
        }

        // Determine file type based on extension
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        let fileType: FileType = FileType.OTHER;

        switch (extension) {
            case 'jar':
                fileType = FileType.JAR;
                break;
            case 'zip':
                fileType = FileType.ZIP;
                break;
            case 'schematic':
                fileType = FileType.SCHEMATIC;
                break;
            case 'json':
                fileType = FileType.JSON;
                break;
        }

        // Calculate file hash
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Upload file to storage
        const fileUrl = await this.storageService.uploadFile(file, `versions/${resourceId}`);

        // Extract storage key from URL
        const storageKey = fileUrl.split('media.orbis.place/')[1] || fileUrl;

        // Create file record
        const versionFile = await prisma.resourceVersionFile.create({
            data: {
                versionId,
                filename: file.originalname,
                displayName: displayName || file.originalname,
                fileType,
                storageKey,
                url: fileUrl,
                size: file.size,
                hash,
            },
        });

        // If this is the first file, set it as primary
        if (!version.primaryFileId) {
            await prisma.resourceVersion.update({
                where: { id: versionId },
                data: { primaryFileId: versionFile.id },
            });
        }

        return {
            message: 'File uploaded successfully',
            file: versionFile,
        };
    }

    /**
     * Delete a version file (allowed in all statuses except ARCHIVED)
     */
    async deleteFile(
        resourceId: string,
        versionId: string,
        fileId: string,
        userId: string,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Cannot modify files on pending, approved or archived versions
        if (version.status === VersionStatus.PENDING || version.status === VersionStatus.APPROVED || version.status === VersionStatus.ARCHIVED) {
            throw new BadRequestException(
                'Cannot delete files from pending, approved or archived versions. Only DRAFT and REJECTED versions can be modified.',
            );
        }

        const file = version.files.find((f) => f.id === fileId);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Cannot delete the primary file if there are other files
        if (version.primaryFileId === fileId && version.files.length > 1) {
            throw new BadRequestException(
                'Cannot delete the primary file. Please set another file as primary first.',
            );
        }

        // Delete file from storage
        try {
            await this.storageService.deleteFile(file.url);
        } catch (error) {
            console.error(`Failed to delete file ${file.url}:`, error);
        }

        // Delete file record
        await prisma.resourceVersionFile.delete({
            where: { id: fileId },
        });

        // If this was the primary file, clear the primary file ID
        if (version.primaryFileId === fileId) {
            await prisma.resourceVersion.update({
                where: { id: versionId },
                data: { primaryFileId: null },
            });
        }

        return {
            message: 'File deleted successfully',
        };
    }

    /**
     * Set primary file for a version (allowed in all statuses except ARCHIVED)
     */
    async setPrimaryFile(
        resourceId: string,
        versionId: string,
        fileId: string,
        userId: string,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Cannot modify on pending, approved or archived versions
        if (version.status === VersionStatus.PENDING || version.status === VersionStatus.APPROVED || version.status === VersionStatus.ARCHIVED) {
            throw new BadRequestException(
                'Cannot modify primary file on pending, approved or archived versions.',
            );
        }

        // Check if file exists
        const file = version.files.find((f) => f.id === fileId);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Update primary file
        await prisma.resourceVersion.update({
            where: { id: versionId },
            data: { primaryFileId: fileId },
        });

        return {
            message: 'Primary file set successfully',
        };
    }

    // ============================================
    // DOWNLOAD
    // ============================================

    /**
     * Download a version file (tracks download statistics)
     * Downloads are deduplicated by IP - only one count per IP per version per day
     */
    async downloadFile(
        resourceId: string,
        versionId: string,
        fileId: string,
        userId?: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        // Get version with file
        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
            include: {
                files: true,
                resource: true,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        const file = version.files.find((f) => f.id === fileId);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Check if this download should be counted (deduplicated by IP per day)
        const shouldCount = ipAddress
            ? await this.redisService.shouldCountDownload(versionId, ipAddress)
            : true;

        if (shouldCount) {
            // Track download
            await prisma.resourceDownload.create({
                data: {
                    resourceId,
                    versionId,
                    userId,
                    ipAddress,
                    userAgent,
                },
            });

            // Increment download counters
            await prisma.$transaction([
                prisma.resource.update({
                    where: { id: resourceId },
                    data: { downloadCount: { increment: 1 } },
                }),
                prisma.resourceVersion.update({
                    where: { id: versionId },
                    data: { downloadCount: { increment: 1 } },
                }),
            ]);
        }

        return {
            downloadUrl: file.url,
            filename: file.filename,
            size: file.size,
        };
    }

    /**
     * Download a version (smart download - single file or ZIP)
     * - If version has 1 file: direct download
     * - If version has multiple files: create ZIP archive
     */
    async downloadVersion(
        resourceId: string,
        versionId: string,
        userId?: string,
        ipAddress?: string,
        userAgent?: string,
        res?: Response,
    ) {
        // Get version with files and resource info
        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
            include: {
                files: true,
                resource: true,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        if (version.files.length === 0) {
            throw new BadRequestException('No files available for download');
        }

        // Debug logging
        console.log(`[Download Debug] Version ${versionId}: ${version.files.length} file(s)`);
        version.files.forEach((f, i) => {
            console.log(`  File ${i + 1}: ${f.filename} (${f.id})`);
        });

        // Check if this download should be counted
        const shouldCount = ipAddress
            ? await this.redisService.shouldCountDownload(versionId, ipAddress)
            : true;

        if (shouldCount) {
            // Track download
            await prisma.resourceDownload.create({
                data: {
                    resourceId,
                    versionId,
                    userId,
                    ipAddress,
                    userAgent,
                },
            });

            // Increment download counters
            await prisma.$transaction([
                prisma.resource.update({
                    where: { id: resourceId },
                    data: { downloadCount: { increment: 1 } },
                }),
                prisma.resourceVersion.update({
                    where: { id: versionId },
                    data: { downloadCount: { increment: 1 } },
                }),
            ]);
        }

        // If only one file, return direct download
        if (version.files.length === 1) {
            console.log('[Download Debug] Single file - redirecting to:', version.files[0].url);
            const file = version.files[0];
            return {
                type: 'single' as const,
                downloadUrl: file.url,
                filename: file.filename,
            };
        }

        console.log('[Download Debug] Multiple files - creating ZIP');

        // Multiple files - create ZIP
        if (!res) {
            throw new BadRequestException('Response object required for ZIP download');
        }

        // Generate ZIP filename: ResourceName-vX.X.X.zip
        const zipFilename = `${version.resource.slug}-v${version.versionNumber}.zip`;

        // Set response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

        // Create archiver instance
        const archive = archiver('zip', {
            zlib: { level: 9 }, // Maximum compression
        });

        // Pipe archive to response
        archive.pipe(res);

        // Handle errors
        archive.on('error', (err) => {
            throw new BadRequestException(`Error creating ZIP: ${err.message}`);
        });

        // Add all files to the ZIP
        for (const file of version.files) {
            try {
                // Fetch file from S3 URL
                const response = await fetch(file.url);

                if (!response.ok) {
                    console.error(`Failed to fetch file ${file.filename}: ${response.statusText}`);
                    continue;
                }

                // Get readable stream from response
                const fileBuffer = await response.arrayBuffer();

                // Add to archive with display name or filename
                archive.append(Buffer.from(fileBuffer), { name: file.displayName || file.filename });
            } catch (error) {
                console.error(`Error adding file ${file.filename} to ZIP:`, error);
                // Continue with other files
            }
        }

        // Finalize the archive
        await archive.finalize();

        // Don't return anything - response is already handled via streaming
    }

    // ============================================
    // VERSION MANAGEMENT
    // ============================================

    /**
     * Set a version as the latest version for a resource
     */
    async setAsLatest(resourceId: string, versionId: string, userId: string) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Only approved versions can be set as latest
        if (version.status !== VersionStatus.APPROVED) {
            throw new BadRequestException('Only APPROVED versions can be set as the latest version');
        }

        // Update resource latest version
        await prisma.resource.update({
            where: { id: resourceId },
            data: {
                latestVersionId: versionId,
                lastActivityAt: new Date(),
            },
        });

        return {
            message: 'Version set as latest successfully',
        };
    }
}