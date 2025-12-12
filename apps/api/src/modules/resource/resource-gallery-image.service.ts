import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

import { CreateGalleryImageDto, UpdateGalleryImageDto, ReorderGalleryImagesDto } from './dtos/gallery-image.dto';
import { prisma } from '@repo/db';
import { StorageService } from '../storage/storage.service';
@Injectable()
export class ResourceGalleryImageService {
    constructor(private readonly storage: StorageService) { }

    /**
     * Create a new gallery image from uploaded file
     */
    async createFromFile(
        resourceId: string,
        userId: string,
        file: Express.Multer.File,
        metadata?: CreateGalleryImageDto
    ) {
        // Validate file
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
            );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 10MB');
        }

        // Verify resource exists and user has permission
        await this.verifyResourceOwnership(resourceId, userId);

        // Upload file to storage
        const url = await this.storage.uploadFile(
            file,
            `resources/${resourceId}/gallery`,
        );

        // Create gallery image
        const galleryImage = await prisma.resourceGalleryImage.create({
            data: {
                resourceId,
                url,
                storageKey: url, // Use URL as storage key for now
                size: file.size,
                caption: metadata?.caption,
                title: metadata?.title,
                description: metadata?.description,
                order: metadata?.order ?? 0,
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

        // Delete file from storage
        if (existingImage.storageKey) {
            await this.storage.deleteFile(existingImage.storageKey).catch(() => { });
        }

        return {
            message: 'Gallery image deleted successfully',
        };
    }

    /**
     * Replace the image file of an existing gallery image
     */
    async replaceImage(
        resourceId: string,
        imageId: string,
        userId: string,
        file: Express.Multer.File
    ) {
        // Validate file
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
            );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size is 10MB');
        }

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

        // Upload new file
        const url = await this.storage.uploadFile(
            file,
            `resources/${resourceId}/gallery`,
        );

        // Update gallery image
        const galleryImage = await prisma.resourceGalleryImage.update({
            where: { id: imageId },
            data: {
                url,
                storageKey: url,
                size: file.size,
            },
        });

        // Delete old image from storage
        if (existingImage.storageKey) {
            await this.storage.deleteFile(existingImage.storageKey).catch(() => { });
        }

        return {
            message: 'Gallery image replaced successfully',
            galleryImage,
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
