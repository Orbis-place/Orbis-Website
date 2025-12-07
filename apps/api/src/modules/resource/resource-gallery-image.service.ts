import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

import { CreateGalleryImageDto, UpdateGalleryImageDto, ReorderGalleryImagesDto } from './dtos/gallery-image.dto';
import { prisma } from '@repo/db';
@Injectable()
export class ResourceGalleryImageService {
    constructor() { }

    /**
     * Create a new gallery image for a resource
     */
    async create(resourceId: string, userId: string, createDto: CreateGalleryImageDto) {
        // Verify resource exists and user has permission
        const resource = await this.verifyResourceOwnership(resourceId, userId);

        // Create gallery image
        const galleryImage = await prisma.resourceGalleryImage.create({
            data: {
                resourceId,
                url: createDto.url,
                storageKey: createDto.storageKey,
                caption: createDto.caption,
                title: createDto.title,
                description: createDto.description,
                order: createDto.order,
                size: createDto.size,
            },
        });

        return {
            message: 'Gallery image created successfully',
            galleryImage,
        };
    }

    /**
     * Get all gallery images for a resource
     */
    async findAll(resourceId: string) {
        // Verify resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        const galleryImages = await prisma.resourceGalleryImage.findMany({
            where: { resourceId },
            orderBy: { order: 'asc' },
        });

        return {
            galleryImages,
            total: galleryImages.length,
        };
    }

    /**
     * Get a single gallery image by ID
     */
    async findOne(resourceId: string, imageId: string) {
        const galleryImage = await prisma.resourceGalleryImage.findFirst({
            where: {
                id: imageId,
                resourceId,
            },
        });

        if (!galleryImage) {
            throw new NotFoundException('Gallery image not found');
        }

        return {
            galleryImage,
        };
    }

    /**
     * Update a gallery image
     */
    async update(resourceId: string, imageId: string, userId: string, updateDto: UpdateGalleryImageDto) {
        // Verify resource exists and user has permission
        await this.verifyResourceOwnership(resourceId, userId);

        // Verify gallery image exists and belongs to the resource
        const existingImage = await prisma.resourceGalleryImage.findFirst({
            where: {
                id: imageId,
                resourceId,
            },
        });

        if (!existingImage) {
            throw new NotFoundException('Gallery image not found');
        }

        // Update gallery image
        const galleryImage = await prisma.resourceGalleryImage.update({
            where: { id: imageId },
            data: {
                caption: updateDto.caption,
                title: updateDto.title,
                description: updateDto.description,
                order: updateDto.order,
            },
        });

        return {
            message: 'Gallery image updated successfully',
            galleryImage,
        };
    }

    /**
     * Delete a gallery image
     */
    async remove(resourceId: string, imageId: string, userId: string) {
        // Verify resource exists and user has permission
        await this.verifyResourceOwnership(resourceId, userId);

        // Verify gallery image exists and belongs to the resource
        const existingImage = await prisma.resourceGalleryImage.findFirst({
            where: {
                id: imageId,
                resourceId,
            },
        });

        if (!existingImage) {
            throw new NotFoundException('Gallery image not found');
        }

        // Delete gallery image
        await prisma.resourceGalleryImage.delete({
            where: { id: imageId },
        });

        return {
            message: 'Gallery image deleted successfully',
        };
    }

    /**
     * Reorder gallery images
     */
    async reorder(resourceId: string, userId: string, reorderDto: ReorderGalleryImagesDto) {
        // Verify resource exists and user has permission
        await this.verifyResourceOwnership(resourceId, userId);

        // Verify all image IDs belong to this resource
        const images = await prisma.resourceGalleryImage.findMany({
            where: {
                id: { in: reorderDto.imageIds },
                resourceId,
            },
        });

        if (images.length !== reorderDto.imageIds.length) {
            throw new BadRequestException('One or more image IDs are invalid');
        }

        // Update order for each image
        await prisma.$transaction(
            reorderDto.imageIds.map((imageId, index) =>
                prisma.resourceGalleryImage.update({
                    where: { id: imageId },
                    data: { order: index },
                })
            )
        );

        const updatedImages = await prisma.resourceGalleryImage.findMany({
            where: { resourceId },
            orderBy: { order: 'asc' },
        });

        return {
            message: 'Gallery images reordered successfully',
            galleryImages: updatedImages,
        };
    }

    /**
     * Verify resource exists and user has ownership
     */
    private async verifyResourceOwnership(resourceId: string, userId: string) {
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        if (resource.ownerId !== userId) {
            throw new ForbiddenException('You can only manage gallery images for your own resources');
        }

        return resource;
    }
}
