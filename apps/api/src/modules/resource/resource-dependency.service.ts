import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { prisma, VersionStatus } from '@repo/db';
import { CreateDependencyDto, UpdateDependencyDto, DependencyResponseDto } from './dtos/resource-dependency.dto';

@Injectable()
export class ResourceDependencyService {
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

    /**
     * Transform dependency to response DTO
     */
    private transformToResponse(dependency: any): DependencyResponseDto {
        const isInternal = !!dependency.dependencyResourceId;

        return {
            id: dependency.id,
            dependencyType: dependency.dependencyType,
            isInternal,
            // Internal dependency fields
            dependencyResource: dependency.dependencyResource
                ? {
                    id: dependency.dependencyResource.id,
                    name: dependency.dependencyResource.name,
                    slug: dependency.dependencyResource.slug,
                    iconUrl: dependency.dependencyResource.iconUrl,
                }
                : null,
            minVersion: dependency.minVersionRef
                ? {
                    id: dependency.minVersionRef.id,
                    versionNumber: dependency.minVersionRef.versionNumber,
                }
                : null,
            // External dependency fields
            externalName: dependency.externalName,
            externalUrl: dependency.externalUrl,
            externalMinVersion: dependency.externalMinVersion,
            createdAt: dependency.createdAt,
        };
    }

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    /**
     * Add a dependency to a version
     */
    async addDependency(
        resourceId: string,
        versionId: string,
        userId: string,
        createDto: CreateDependencyDto,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Check status restrictions - only DRAFT and REJECTED can be modified
        if (
            version.status !== VersionStatus.DRAFT &&
            version.status !== VersionStatus.REJECTED
        ) {
            throw new BadRequestException(
                'Dependencies can only be modified on DRAFT or REJECTED versions',
            );
        }

        // Validate that either internal or external dependency is provided
        const hasInternal = !!createDto.dependencyResourceId;
        const hasExternal = !!createDto.externalName && !!createDto.externalUrl;

        if (!hasInternal && !hasExternal) {
            throw new BadRequestException(
                'Either dependencyResourceId (internal) or externalName + externalUrl (external) must be provided',
            );
        }

        if (hasInternal && hasExternal) {
            throw new BadRequestException(
                'Cannot specify both internal and external dependency. Choose one.',
            );
        }

        // For internal dependencies, validate the resource and version exist
        if (hasInternal) {
            const dependencyResource = await prisma.resource.findUnique({
                where: { id: createDto.dependencyResourceId },
            });

            if (!dependencyResource) {
                throw new BadRequestException('Dependency resource not found');
            }

            // Prevent self-dependency
            if (createDto.dependencyResourceId === resourceId) {
                throw new BadRequestException('A resource cannot depend on itself');
            }

            // Validate minVersionId if provided
            if (createDto.minVersionId) {
                const minVersion = await prisma.resourceVersion.findFirst({
                    where: {
                        id: createDto.minVersionId,
                        resourceId: createDto.dependencyResourceId,
                    },
                });

                if (!minVersion) {
                    throw new BadRequestException('Minimum version not found for this dependency resource');
                }
            }

            // Check for duplicate internal dependency
            const existingDependency = await prisma.resourceVersionDependency.findFirst({
                where: {
                    versionId,
                    dependencyResourceId: createDto.dependencyResourceId,
                },
            });

            if (existingDependency) {
                throw new BadRequestException('This dependency already exists for this version');
            }
        }

        // For external dependencies, check for duplicate by name
        if (hasExternal) {
            const existingExternal = await prisma.resourceVersionDependency.findFirst({
                where: {
                    versionId,
                    externalName: createDto.externalName,
                },
            });

            if (existingExternal) {
                throw new BadRequestException(
                    `External dependency "${createDto.externalName}" already exists for this version`,
                );
            }
        }

        // Create the dependency
        const dependency = await prisma.resourceVersionDependency.create({
            data: {
                versionId,
                dependencyType: createDto.dependencyType,
                // Internal dependency fields
                dependencyResourceId: createDto.dependencyResourceId || null,
                minVersionId: createDto.minVersionId || null,
                // External dependency fields
                externalName: createDto.externalName || null,
                externalUrl: createDto.externalUrl || null,
                externalMinVersion: createDto.externalMinVersion || null,
            },
            include: {
                dependencyResource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        iconUrl: true,
                    },
                },
                minVersionRef: {
                    select: {
                        id: true,
                        versionNumber: true,
                    },
                },
            },
        });

        return {
            message: 'Dependency added successfully',
            dependency: this.transformToResponse(dependency),
        };
    }

    /**
     * Get all dependencies for a version
     */
    async getDependencies(resourceId: string, versionId: string) {
        // Verify version exists
        const version = await prisma.resourceVersion.findFirst({
            where: {
                id: versionId,
                resourceId,
            },
        });

        if (!version) {
            throw new NotFoundException('Version not found');
        }

        const dependencies = await prisma.resourceVersionDependency.findMany({
            where: { versionId },
            include: {
                dependencyResource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        iconUrl: true,
                    },
                },
                minVersionRef: {
                    select: {
                        id: true,
                        versionNumber: true,
                    },
                },
            },
            orderBy: [
                { dependencyType: 'asc' }, // REQUIRED first
                { createdAt: 'asc' },
            ],
        });

        return {
            dependencies: dependencies.map((d) => this.transformToResponse(d)),
            total: dependencies.length,
        };
    }

    /**
     * Update a dependency
     */
    async updateDependency(
        resourceId: string,
        versionId: string,
        dependencyId: string,
        userId: string,
        updateDto: UpdateDependencyDto,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Check status restrictions
        if (
            version.status !== VersionStatus.DRAFT &&
            version.status !== VersionStatus.REJECTED
        ) {
            throw new BadRequestException(
                'Dependencies can only be modified on DRAFT or REJECTED versions',
            );
        }

        // Verify dependency exists
        const dependency = await prisma.resourceVersionDependency.findFirst({
            where: {
                id: dependencyId,
                versionId,
            },
        });

        if (!dependency) {
            throw new NotFoundException('Dependency not found');
        }

        const isInternal = !!dependency.dependencyResourceId;

        // Validate minVersionId if updating internal dependency
        if (isInternal && updateDto.minVersionId) {
            const minVersion = await prisma.resourceVersion.findFirst({
                where: {
                    id: updateDto.minVersionId,
                    resourceId: dependency.dependencyResourceId!,
                },
            });

            if (!minVersion) {
                throw new BadRequestException('Minimum version not found for this dependency resource');
            }
        }

        // Build update data based on dependency type
        const updateData: any = {
            dependencyType: updateDto.dependencyType ?? dependency.dependencyType,
        };

        if (isInternal) {
            // Update internal dependency version
            if (updateDto.minVersionId !== undefined) {
                updateData.minVersionId = updateDto.minVersionId;
            }
        } else {
            // Update external dependency version
            if (updateDto.externalMinVersion !== undefined) {
                updateData.externalMinVersion = updateDto.externalMinVersion;
            }
        }

        // Update the dependency
        const updatedDependency = await prisma.resourceVersionDependency.update({
            where: { id: dependencyId },
            data: updateData,
            include: {
                dependencyResource: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        iconUrl: true,
                    },
                },
                minVersionRef: {
                    select: {
                        id: true,
                        versionNumber: true,
                    },
                },
            },
        });

        return {
            message: 'Dependency updated successfully',
            dependency: this.transformToResponse(updatedDependency),
        };
    }

    /**
     * Remove a dependency
     */
    async removeDependency(
        resourceId: string,
        versionId: string,
        dependencyId: string,
        userId: string,
    ) {
        const version = await this.getVersionWithPermission(resourceId, versionId, userId);

        // Check status restrictions
        if (
            version.status !== VersionStatus.DRAFT &&
            version.status !== VersionStatus.REJECTED
        ) {
            throw new BadRequestException(
                'Dependencies can only be modified on DRAFT or REJECTED versions',
            );
        }

        // Verify dependency exists
        const dependency = await prisma.resourceVersionDependency.findFirst({
            where: {
                id: dependencyId,
                versionId,
            },
        });

        if (!dependency) {
            throw new NotFoundException('Dependency not found');
        }

        // Delete the dependency
        await prisma.resourceVersionDependency.delete({
            where: { id: dependencyId },
        });

        return {
            message: 'Dependency removed successfully',
        };
    }

    /**
     * Get resources that depend on a specific resource (dependents)
     */
    async getDependents(resourceId: string, page: number = 1, limit: number = 20) {
        // Verify resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        const skip = (page - 1) * limit;

        // Find all versions that depend on this resource
        const [dependents, total] = await Promise.all([
            prisma.resourceVersionDependency.findMany({
                where: {
                    dependencyResourceId: resourceId,
                },
                include: {
                    version: {
                        include: {
                            resource: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    iconUrl: true,
                                    type: true,
                                },
                            },
                        },
                    },
                    minVersionRef: {
                        select: {
                            id: true,
                            versionNumber: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.resourceVersionDependency.count({
                where: {
                    dependencyResourceId: resourceId,
                },
            }),
        ]);

        // Group by resource to avoid duplicates
        const resourceMap = new Map<string, any>();
        for (const dep of dependents) {
            const resId = dep.version.resource.id;
            if (!resourceMap.has(resId)) {
                resourceMap.set(resId, {
                    resource: dep.version.resource,
                    versions: [],
                    dependencyType: dep.dependencyType,
                    minVersion: dep.minVersionRef
                        ? { id: dep.minVersionRef.id, versionNumber: dep.minVersionRef.versionNumber }
                        : null,
                });
            }
            resourceMap.get(resId).versions.push({
                id: dep.version.id,
                versionNumber: dep.version.versionNumber,
            });
        }

        return {
            dependents: Array.from(resourceMap.values()),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
