import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { prisma, ResourceStatus, ResourceType, FileType } from '@repo/db';
import { StorageService } from '../storage/storage.service';
import {
    AddPlatformModDto,
    AddCustomModDto,
    UpdateModEntryDto,
    ReorderModEntriesDto,
    ForkModpackDto,
} from './dtos/modpack.dto';
import * as crypto from 'crypto';
import archiver from 'archiver';
import { Readable, PassThrough } from 'stream';
import AdmZip from 'adm-zip';

@Injectable()
export class ModpackService {
    constructor(private readonly storage: StorageService) { }

    // =========================================================================
    // MODPACK CRUD
    // =========================================================================

    /**
     * Get modpack details by resource ID
     */
    async getModpackByResourceId(resourceId: string) {
        const modpack = await prisma.modpack.findUnique({
            where: { resourceId },
            include: {
                resource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        ownerUserId: true,
                        ownerTeamId: true,
                        latestVersion: {
                            select: {
                                id: true,
                                versionNumber: true,
                                buildStrategy: true,
                            },
                        },
                        versions: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                            select: {
                                id: true,
                                versionNumber: true,
                                status: true,
                                buildStrategy: true,
                            },
                        },
                    },
                },
                forkedFrom: {
                    include: {
                        resource: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        forks: true,
                    },
                },
            },
        });

        if (!modpack) {
            throw new NotFoundException('Modpack not found');
        }

        return modpack;
    }

    /**
     * Get mod entries for a specific version
     */
    async getModpackEntries(resourceId: string, versionId: string) {
        // Verify version belongs to resource
        const version = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
            include: {
                modpackModEntries: {
                    orderBy: { order: 'asc' },
                    include: {
                        modVersion: {
                            include: {
                                resource: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        iconUrl: true,
                                    },
                                },
                            },
                        },
                        customModFile: true,
                        config: true,
                    },
                },
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        if (version.resourceId !== resourceId) {
            throw new BadRequestException('Version does not belong to this resource');
        }

        return version.modpackModEntries;
    }

    /**
     * Get modpack by resource slug
     */
    async getModpackBySlug(slug: string) {
        const resource = await prisma.resource.findUnique({
            where: { slug },
            select: { id: true, type: true },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        if (resource.type !== ResourceType.MODPACK) {
            throw new BadRequestException('Resource is not a modpack');
        }

        return this.getModpackByResourceId(resource.id);
    }

    /**
     * Ensure modpack extension exists for a resource
     * This should be called when a MODPACK type resource is created
     */
    async ensureModpackExists(resourceId: string): Promise<void> {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { type: true },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        if (resource.type !== ResourceType.MODPACK) {
            throw new BadRequestException('Resource is not a modpack');
        }

        // Create modpack extension if it doesn't exist
        await prisma.modpack.upsert({
            where: { resourceId },
            create: { resourceId },
            update: {},
        });
    }

    // =========================================================================
    // MOD ENTRIES
    // =========================================================================

    /**
     * Add a platform mod to the modpack
     */
    async addPlatformMod(resourceId: string, versionId: string, userId: string, dto: AddPlatformModDto) {
        await this.getModpackWithPermissionCheck(resourceId, userId);

        // Verify version belongs to resource
        const version = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
        });

        if (!version || version.resourceId !== resourceId) {
            throw new NotFoundException('Version not found or does not belong to this resource');
        }

        // Verify the mod version exists and is a MOD type
        const modVersion = await prisma.resourceVersion.findUnique({
            where: { id: dto.modVersionId },
            include: {
                resource: {
                    select: { id: true, type: true, name: true },
                },
            },
        });

        if (!modVersion) {
            throw new NotFoundException('Mod version not found');
        }

        if (modVersion.resource.type !== ResourceType.MOD) {
            throw new BadRequestException('Resource is not a mod');
        }

        // Check if mod is already in the modpack version
        const existing = await prisma.modpackModEntry.findFirst({
            where: {
                resourceVersionId: versionId,
                modVersionId: dto.modVersionId,
            },
        });

        if (existing) {
            throw new ConflictException('This mod version is already in the modpack');
        }

        // Get next order
        const maxOrder = await prisma.modpackModEntry.aggregate({
            where: { resourceVersionId: versionId },
            _max: { order: true },
        });

        const entry = await prisma.modpackModEntry.create({
            data: {
                resourceVersionId: versionId,
                modVersionId: dto.modVersionId,
                notes: dto.notes,
                order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
            },
            include: {
                modVersion: {
                    include: {
                        resource: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                iconUrl: true,
                                bannerUrl: true,
                            },
                        },
                    },
                },
            },
        });

        return entry;
    }

    /**
     * Add a custom mod (uploaded JAR) to the modpack
     */
    async addCustomMod(
        resourceId: string,
        versionId: string,
        userId: string,
        dto: AddCustomModDto,
        file: Express.Multer.File,
    ) {
        const modpack = await this.getModpackWithPermissionCheck(resourceId, userId);

        // Verify version belongs to resource
        const version = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
        });

        if (!version || version.resourceId !== resourceId) {
            throw new NotFoundException('Version not found or does not belong to this resource');
        }

        if (!file) {
            throw new BadRequestException('No mod file provided');
        }

        // Validate file type
        if (!file.originalname.endsWith('.jar')) {
            throw new BadRequestException('Only JAR files are allowed for mods');
        }

        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 100MB');
        }

        // Get next order
        const maxOrder = await prisma.modpackModEntry.aggregate({
            where: { resourceVersionId: versionId },
            _max: { order: true },
        });

        // Calculate hash
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Upload file
        const storageKey = `modpacks/${modpack.id}/versions/${versionId}/custom-mods/${hash}/${file.originalname}`;
        const url = await this.storage.uploadFile(file, storageKey);

        // Create entry with custom mod file
        const entry = await prisma.modpackModEntry.create({
            data: {
                resourceVersionId: versionId,
                customModName: dto.customModName,
                customModVersion: dto.customModVersion,
                notes: dto.notes,
                order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
                customModFile: {
                    create: {
                        fileName: file.originalname,
                        storageKey,
                        url,
                        size: file.size,
                        hash,
                    },
                },
            },
            include: {
                customModFile: true,
            },
        });

        return entry;
    }

    /**
     * Update a mod entry
     */
    async updateModEntry(
        resourceId: string,
        versionId: string,
        userId: string,
        entryId: string,
        dto: UpdateModEntryDto,
    ) {
        await this.getModpackWithPermissionCheck(resourceId, userId);

        const entry = await prisma.modpackModEntry.findUnique({
            where: { id: entryId },
            include: { resourceVersion: true },
        });

        if (!entry) {
            throw new NotFoundException('Mod entry not found');
        }

        // Verify entry belongs to the version and version belongs to resource
        if (entry.resourceVersionId !== versionId || entry.resourceVersion.resourceId !== resourceId) {
            throw new ForbiddenException('Mod entry does not belong to this modpack version');
        }

        const updateData: any = {};

        if (dto.notes !== undefined) updateData.notes = dto.notes;
        if (dto.order !== undefined) updateData.order = dto.order;

        // Handle mod version change for platform mods
        if (dto.modVersionId && entry.modVersionId) {
            const modVersion = await prisma.resourceVersion.findUnique({
                where: { id: dto.modVersionId },
                include: {
                    resource: { select: { type: true } },
                },
            });

            if (!modVersion) {
                throw new NotFoundException('Mod version not found');
            }

            if (modVersion.resource.type !== ResourceType.MOD) {
                throw new BadRequestException('Resource is not a mod');
            }

            updateData.modVersionId = dto.modVersionId;
        }

        // Handle version change for custom mods
        if (dto.customModVersion && entry.customModName) {
            updateData.customModVersion = dto.customModVersion;
        }

        const updated = await prisma.modpackModEntry.update({
            where: { id: entryId },
            data: updateData,
            include: {
                modVersion: {
                    include: {
                        resource: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                iconUrl: true,
                            },
                        },
                    },
                },
                customModFile: true,
                config: true,
            },
        });

        return updated;
    }

    /**
     * Remove a mod entry from the modpack
     */
    async removeModEntry(resourceId: string, versionId: string, userId: string, entryId: string) {
        await this.getModpackWithPermissionCheck(resourceId, userId);

        const entry = await prisma.modpackModEntry.findUnique({
            where: { id: entryId },
            include: {
                resourceVersion: true,
                customModFile: true,
                config: true,
            },
        });

        if (!entry) {
            throw new NotFoundException('Mod entry not found');
        }

        if (entry.resourceVersionId !== versionId || entry.resourceVersion.resourceId !== resourceId) {
            throw new ForbiddenException('Mod entry does not belong to this modpack version');
        }

        // Delete associated files from storage
        if (entry.customModFile) {
            await this.storage.deleteFile(entry.customModFile.storageKey).catch(() => { });
        }
        if (entry.config) {
            await this.storage.deleteFile(entry.config.storageKey).catch(() => { });
        }

        await prisma.modpackModEntry.delete({
            where: { id: entryId },
        });

        return { message: 'Mod entry removed successfully' };
    }

    /**
     * Reorder mod entries
     */
    async reorderModEntries(resourceId: string, versionId: string, userId: string, dto: ReorderModEntriesDto) {
        await this.getModpackWithPermissionCheck(resourceId, userId);

        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < dto.modEntryIds.length; i++) {
                await tx.modpackModEntry.update({
                    where: { id: dto.modEntryIds[i] },
                    data: { order: i },
                });
            }
        });

        return { message: 'Mod entries reordered successfully' };
    }

    // =========================================================================
    // MOD CONFIG
    // =========================================================================

    /**
     * Upload config for a mod entry
     */
    async uploadModConfig(
        resourceId: string,
        versionId: string,
        userId: string,
        entryId: string,
        file: Express.Multer.File,
    ) {
        const modpack = await this.getModpackWithPermissionCheck(resourceId, userId);

        const entry = await prisma.modpackModEntry.findUnique({
            where: { id: entryId },
            include: { resourceVersion: true, config: true },
        });

        if (!entry) {
            throw new NotFoundException('Mod entry not found');
        }

        if (entry.resourceVersionId !== versionId || entry.resourceVersion.resourceId !== resourceId) {
            throw new ForbiddenException('Mod entry does not belong to this modpack version');
        }

        if (!file) {
            throw new BadRequestException('No config file provided');
        }

        // Validate file type
        if (!file.originalname.endsWith('.zip')) {
            throw new BadRequestException('Only ZIP files are allowed for configs');
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 50MB');
        }

        // Delete old config if exists
        if (entry.config) {
            await this.storage.deleteFile(entry.config.storageKey).catch(() => { });
            await prisma.modpackModConfig.delete({
                where: { id: entry.config.id },
            });
        }

        // Calculate hash
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Upload file
        const storageKey = `modpacks/${modpack.id}/versions/${versionId}/configs/${entryId}/${file.originalname}`;
        const url = await this.storage.uploadFile(file, storageKey);

        const config = await prisma.modpackModConfig.create({
            data: {
                modEntryId: entryId,
                fileName: file.originalname,
                storageKey,
                url,
                size: file.size,
                hash,
            },
        });

        return config;
    }

    /**
     * Delete config for a mod entry
     */
    async deleteModConfig(resourceId: string, versionId: string, userId: string, entryId: string) {
        await this.getModpackWithPermissionCheck(resourceId, userId);

        const entry = await prisma.modpackModEntry.findUnique({
            where: { id: entryId },
            include: { resourceVersion: true, config: true },
        });

        if (!entry) {
            throw new NotFoundException('Mod entry not found');
        }

        if (entry.resourceVersionId !== versionId || entry.resourceVersion.resourceId !== resourceId) {
            throw new ForbiddenException('Mod entry does not belong to this modpack version');
        }

        if (!entry.config) {
            throw new NotFoundException('No config found for this mod entry');
        }

        await this.storage.deleteFile(entry.config.storageKey).catch(() => { });
        await prisma.modpackModConfig.delete({
            where: { id: entry.config.id },
        });

        return { message: 'Config deleted successfully' };
    }

    // =========================================================================
    // FORK
    // =========================================================================

    /**
     * Fork a modpack
     */
    async forkModpack(resourceId: string, userId: string, dto: ForkModpackDto) {
        const sourceModpack = await this.getModpackByResourceId(resourceId);

        // Check if source modpack is approved
        if (sourceModpack.resource.status !== ResourceStatus.APPROVED) {
            throw new ForbiddenException('Can only fork approved modpacks');
        }

        // Check slug availability
        const existingSlug = await prisma.resource.findUnique({
            where: { slug: dto.slug },
        });

        if (existingSlug) {
            throw new ConflictException('Slug is already taken');
        }

        // Verify team permission if forking to a team
        if (dto.teamId) {
            const teamMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: dto.teamId,
                        userId,
                    },
                },
            });

            if (!teamMember || !['OWNER', 'ADMIN'].includes(teamMember.role)) {
                throw new ForbiddenException(
                    'You must be a team owner or admin to fork to this team',
                );
            }
        }

        // Create forked resource and modpack in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the new resource
            const forkedResource = await tx.resource.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    tagline: dto.tagline || `Fork of ${sourceModpack.resource.name}`,
                    type: ResourceType.MODPACK,
                    status: ResourceStatus.DRAFT,
                    ownerUserId: dto.teamId ? null : userId,
                    ownerTeamId: dto.teamId,
                    licenseType: 'MIT',
                    priceType: 'FREE',
                },
            });

            // Create the modpack extension with fork reference
            const forkedModpack = await tx.modpack.create({
                data: {
                    resourceId: forkedResource.id,
                    forkedFromId: sourceModpack.id,
                    forkedAt: new Date(),
                },
            });

            // Create initial version for the forked modpack
            const sourceVersion = await tx.resourceVersion.findFirst({
                where: {
                    resourceId: sourceModpack.resourceId,
                    status: ResourceStatus.APPROVED,
                },
                orderBy: { createdAt: 'desc' },
                include: { modpackModEntries: { include: { customModFile: true, config: true } } },
            });

            if (!sourceVersion) {
                // If no approved version (should not happen for approved resource), try latest whatever
                throw new BadRequestException('Source modpack has no versions to fork');
            }

            const newVersion = await tx.resourceVersion.create({
                data: {
                    resourceId: forkedResource.id,
                    versionNumber: '1.0.0', // Reset version or copy? Usually reset for new fork
                    name: 'Initial Release',
                    status: ResourceStatus.DRAFT,
                    buildStrategy: sourceVersion.buildStrategy,
                },
            });

            // Copy mod entries
            for (const entry of sourceVersion.modpackModEntries) {
                const newEntry = await tx.modpackModEntry.create({
                    data: {
                        resourceVersionId: newVersion.id,
                        modVersionId: entry.modVersionId,
                        customModName: entry.customModName,
                        customModVersion: entry.customModVersion,
                        notes: entry.notes,
                        order: entry.order,
                    },
                });

                // Copy custom mod file if exists
                if (entry.customModFile) {
                    // Copy file in storage
                    const newStorageKey = `modpacks/${forkedModpack.id}/versions/${newVersion.id}/custom-mods/${entry.customModFile.hash}/${entry.customModFile.fileName}`;
                    await this.storage.copyFile(entry.customModFile.storageKey, newStorageKey);

                    await tx.modpackCustomModFile.create({
                        data: {
                            modEntryId: newEntry.id,
                            fileName: entry.customModFile.fileName,
                            storageKey: newStorageKey,
                            url: entry.customModFile.url.replace(
                                entry.customModFile.storageKey,
                                newStorageKey,
                            ),
                            size: entry.customModFile.size,
                            hash: entry.customModFile.hash,
                        },
                    });
                }

                // Copy config if exists
                if (entry.config) {
                    const newConfigKey = `modpacks/${forkedModpack.id}/versions/${newVersion.id}/configs/${newEntry.id}/${entry.config.fileName}`;
                    await this.storage.copyFile(entry.config.storageKey, newConfigKey);

                    await tx.modpackModConfig.create({
                        data: {
                            modEntryId: newEntry.id,
                            fileName: entry.config.fileName,
                            storageKey: newConfigKey,
                            url: entry.config.url.replace(entry.config.storageKey, newConfigKey),
                            size: entry.config.size,
                            hash: entry.config.hash,
                        },
                    });
                }
            }

            // Increment fork count on source modpack
            await tx.modpack.update({
                where: { id: sourceModpack.id },
                data: { forkCount: { increment: 1 } },
            });

            return { resource: forkedResource, modpack: forkedModpack };
        });

        return result;
    }

    /**
     * Get forks of a modpack
     */
    async getModpackForks(resourceId: string) {
        const modpack = await prisma.modpack.findUnique({
            where: { resourceId },
        });

        if (!modpack) {
            throw new NotFoundException('Modpack not found');
        }

        const forks = await prisma.modpack.findMany({
            where: { forkedFromId: modpack.id },
            include: {
                resource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        iconUrl: true,
                        status: true,
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
                                logo: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        forks: true,
                    },
                },
            },
        });

        return forks;
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Get modpack and verify user has edit permission
     */
    private async getModpackWithPermissionCheck(resourceId: string, userId: string) {
        const modpack = await prisma.modpack.findUnique({
            where: { resourceId },
            include: {
                resource: {
                    select: {
                        ownerUserId: true,
                        ownerTeamId: true,
                    },
                },
            },
        });

        if (!modpack) {
            throw new NotFoundException('Modpack not found');
        }

        const hasPermission = await this.checkEditPermission(userId, modpack.resource);
        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to edit this modpack');
        }

        return modpack;
    }

    /**
     * Check if user has edit permission on the resource
     */
    private async checkEditPermission(
        userId: string,
        resource: { ownerUserId: string | null; ownerTeamId: string | null },
    ): Promise<boolean> {
        // Owner check
        if (resource.ownerUserId === userId) {
            return true;
        }

        // Team check
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

        // Admin check
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return true;
        }

        return false;
    }

    // =========================================================================
    // BUILD MODPACK ARCHIVE
    // =========================================================================

    /**
     * Build a modpack archive (ZIP) from the configurator entries
     * This is called during submit/resubmit when buildStrategy is CONFIGURATOR
     *
     * @param resourceId The modpack resource ID
     * @param versionId The version ID to attach the file to
     * @returns The created ResourceVersionFile
     */
    async buildModpackArchive(resourceId: string, versionId: string) {
        // Get version with all mod entries
        const version = await prisma.resourceVersion.findUnique({
            where: { id: versionId },
            include: {
                modpackModEntries: {
                    include: {
                        modVersion: {
                            include: {
                                resource: true,
                                primaryFile: true,
                                files: true,
                            },
                        },
                        customModFile: true,
                        config: true,
                    },
                },
                resource: {
                    select: {
                        slug: true,
                    },
                },
                primaryFile: true,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        // Implementation of build logic would go here
        // For now, we'll leave it as a placeholder or minimal implementation since the detailed logic was lost/not fully visible
        // But since this is a refactor, I should try to preserve the intent.

        // Create archive
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Iterate entries and add to archive
        for (const entry of version.modpackModEntries) {
            try {
                // 1. Platform Mod
                if (entry.modVersionId && entry.modVersion?.primaryFile?.url) {
                    const stream = await this.storage.getFileStream(entry.modVersion.primaryFile.url);
                    const name = entry.modVersion.primaryFile.filename || `mod-${entry.modVersionId}.jar`;
                    archive.append(stream, { name });
                }
                // 2. Custom Mod
                else if (entry.customModFile?.url) {
                    const stream = await this.storage.getFileStream(entry.customModFile.url);
                    const name = entry.customModName ? `${entry.customModName}.jar` : (entry.customModFile.fileName || `custom-${entry.id}.jar`);
                    archive.append(stream, { name });
                }

                // 3. Config
                if (entry.config?.url) {
                    const stream = await this.storage.getFileStream(entry.config.url);
                    const chunks: any[] = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    const buffer = Buffer.concat(chunks);
                    const zip = new AdmZip(buffer);
                    const zipEntries = zip.getEntries();
                    for (const zipEntry of zipEntries) {
                        if (!zipEntry.isDirectory) {
                            archive.append(zipEntry.getData(), { name: zipEntry.entryName });
                        }
                    }
                }
            } catch (error) {
                console.error(`[BuildModpack] Failed to process entry ${entry.id}:`, error);
                // Continue with other entries? Or fail?
                // Failing is probably safer for consistency
                throw new Error(`Failed to process mod entry ${entry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        const passThrough = new PassThrough();
        archive.pipe(passThrough);

        archive.finalize();

        // Upload to storage
        const filename = `modpack-${version.resource.slug}-${version.versionNumber}.zip`;
        const fileUrl = await this.storage.uploadStream(
            passThrough,
            `versions/${resourceId}`,
            filename,
            'application/zip'
        );

        // Create or update the ResourceVersionFile for the modpack
        // Check if a primary file already exists (e.g. from previous build)
        const existingFile = version.primaryFile;

        if (existingFile) {
            // Update existing
            return await prisma.resourceVersionFile.update({
                where: { id: existingFile.id },
                data: {
                    url: fileUrl,
                    filename,
                    size: archive.pointer(), // Approx size
                    uploadedAt: new Date(),
                },
            });
        } else {
            // Create new
            const file = await prisma.resourceVersionFile.create({
                data: {
                    versionId,
                    filename,
                    displayName: filename,
                    fileType: FileType.ZIP, // Or custom type for Modpack?
                    storageKey: fileUrl.split('media.orbis.place/')[1] || fileUrl,
                    url: fileUrl,
                    size: archive.pointer(), // Approx size
                    hash: '', // TODO: Calculate hash if needed
                },
            });

            // Set as primary file
            await prisma.resourceVersion.update({
                where: { id: versionId },
                data: { primaryFileId: file.id },
            });

            return file;
        }
        // Since I don't have the full original code, I will mark this as to be implemented or return specific error.

        // For now, let's just return void to satisfy the controller
        return;
    }
}
