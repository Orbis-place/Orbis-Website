import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';

import { StorageService } from '../storage/storage.service';
import { CreateVersionDto, UpdateVersionDto } from './dtos/version.dto';
import { prisma, VersionStatus, FileType, UserRole } from '@repo/db';
import * as crypto from 'crypto';

@Injectable()
export class VersionService {
    constructor(

        private readonly storageService: StorageService,
    ) { }

    /**
     * Create a new version for a resource
     */
    async create(resourceId: string, userId: string, createDto: CreateVersionDto) {
        // Check if resource exists and user has permission
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

        // Check permission
        const hasPermission =
            resource.ownerUserId === userId ||
            (resource.ownerTeam &&
                resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to create versions for this resource');
        }

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

        // Create version
        const version = await prisma.resourceVersion.create({
            data: {
                resourceId,
                versionNumber: createDto.versionNumber,
                name: createDto.name,
                channel: createDto.channel,
                changelog: createDto.changelog,
                status: VersionStatus.DRAFT,
                compatibleVersions: {
                    create: createDto.compatibleVersions.map((hytaleVersion) => ({
                        hytaleVersion,
                    })),
                },
            },
            include: {
                compatibleVersions: true,
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
                compatibleVersions: true,
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
                compatibleVersions: true,
                files: true,
                primaryFile: true,
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
     * Update a version
     */
    async update(
        resourceId: string,
        versionId: string,
        userId: string,
        updateDto: UpdateVersionDto,
    ) {
        // Get version with resource
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
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        // Check permission
        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to update this version');
        }

        // Prepare update data
        const updateData: any = {};

        if (updateDto.name !== undefined) updateData.name = updateDto.name;
        if (updateDto.channel !== undefined) updateData.channel = updateDto.channel;
        if (updateDto.changelog !== undefined) updateData.changelog = updateDto.changelog;
        if (updateDto.status !== undefined) updateData.status = updateDto.status;

        // Update version
        const updatedVersion = await prisma.resourceVersion.update({
            where: { id: versionId },
            data: updateData,
            include: {
                compatibleVersions: true,
                files: true,
                primaryFile: true,
            },
        });

        // Update compatible versions if provided
        if (updateDto.compatibleVersions) {
            // Delete existing compatible versions
            await prisma.hytaleVersion.deleteMany({
                where: { versionId },
            });

            // Create new compatible versions
            await prisma.hytaleVersion.createMany({
                data: updateDto.compatibleVersions.map((hytaleVersion) => ({
                    versionId,
                    hytaleVersion,
                })),
            });
        }

        // Fetch updated version with new compatible versions
        const finalVersion = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
            include: {
                compatibleVersions: true,
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
     * Delete a version
     */
    async delete(resourceId: string, versionId: string, userId: string) {
        // Get version with resource and files
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
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        // Check permission
        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to delete this version');
        }

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

    /**
     * Upload a file for a version
     */
    async uploadFile(
        resourceId: string,
        versionId: string,
        userId: string,
        file: Express.Multer.File,
        displayName?: string,
    ) {
        // Get version with resource
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
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        // Check permission
        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to upload files for this version');
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
     * Delete a version file
     */
    async deleteFile(
        resourceId: string,
        versionId: string,
        fileId: string,
        userId: string,
    ) {
        // Get version with resource and file
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
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        const file = version.files.find((f) => f.id === fileId);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Check permission
        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to delete this file');
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
     * Set primary file for a version
     */
    async setPrimaryFile(
        resourceId: string,
        versionId: string,
        fileId: string,
        userId: string,
    ) {
        // Get version with resource
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
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        // Check if file exists
        const file = version.files.find((f) => f.id === fileId);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Check permission
        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to modify this version');
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

    /**
     * Download a version file (tracks download statistics)
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

        return {
            downloadUrl: file.url,
            filename: file.filename,
            size: file.size,
        };
    }



    /**
     * Set a version as the latest version for a resource
     */
    async setAsLatest(resourceId: string, versionId: string, userId: string) {
        // Get version with resource
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
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        // Check permission
        const hasPermission =
            version.resource.ownerUserId === userId ||
            (version.resource.ownerTeam &&
                version.resource.ownerTeam.members.some(
                    (member) => member.userId === userId && member.role !== 'MEMBER',
                ));

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to modify this resource');
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