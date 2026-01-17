import { Injectable, BadRequestException } from '@nestjs/common';

import { StorageService } from '../storage/storage.service';
import * as crypto from 'crypto';
import { prisma } from '@repo/db';

const MAX_TEMPORARY_IMAGES = 20;
const TEMPORARY_IMAGE_EXPIRATION_HOURS = 24;

@Injectable()
export class ServerDescriptionImageService {
    constructor(
        private readonly storageService: StorageService,
    ) { }

    /**
     * Upload a description image (temporary by default)
     * Detects duplicates by file hash to avoid re-uploading the same image
     * Uploads directly to the server-specific folder
     */
    async uploadImage(userId: string, serverId: string, file: Express.Multer.File) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const MAX_SIZE = user?.isVerifiedCreator ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
            throw new BadRequestException(
                `File size exceeds the limit of ${MAX_SIZE / 1024 / 1024}MB.`,
            );
        }

        // Check temporary image limit for this user and server
        const temporaryCount = await prisma.serverDescriptionImage.count({
            where: {
                uploadedBy: userId,
                serverId,
                status: 'TEMPORARY',
            },
        });

        if (temporaryCount >= MAX_TEMPORARY_IMAGES) {
            throw new BadRequestException(
                `You have reached the maximum of ${MAX_TEMPORARY_IMAGES} temporary images for this server. Please validate or delete unused images.`,
            );
        }

        // Calculate file hash to detect duplicates
        const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Check if this exact image already exists for this user and server (by hash comparison)
        const existingImage = await this.findImageByHash(userId, serverId, fileHash);

        if (existingImage) {
            // Return existing image URL instead of re-uploading
            return {
                message: 'Image already exists',
                image: {
                    id: existingImage.id,
                    url: existingImage.url,
                    storageKey: existingImage.storageKey,
                    status: existingImage.status,
                    uploadedAt: existingImage.uploadedAt,
                    size: existingImage.size,
                },
                duplicate: true,
            };
        }

        // Upload image directly to server-specific folder
        const url = await this.storageService.uploadFile(file, `servers/${serverId}/descriptions`);

        // Extract storage key from URL
        const storageKey = url.split('media.orbis.place/')[1];

        // Create expiration date (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + TEMPORARY_IMAGE_EXPIRATION_HOURS);

        // Save to database with hash and serverId
        const image = await prisma.serverDescriptionImage.create({
            data: {
                url,
                storageKey,
                size: file.size,
                hash: fileHash,
                status: 'TEMPORARY',
                uploadedBy: userId,
                serverId,
                expiresAt,
            },
        });

        return {
            message: 'Image uploaded successfully',
            image: {
                id: image.id,
                url: image.url,
                storageKey: image.storageKey,
                status: image.status,
                uploadedAt: image.uploadedAt,
                size: image.size,
            },
            duplicate: false,
        };
    }

    /**
     * Find an image by comparing file hashes
     * Checks if an image with the same hash already exists for this user and server
     */
    private async findImageByHash(userId: string, serverId: string, fileHash: string): Promise<any> {
        // Find image with matching hash for this user and server (both temporary and permanent)
        const existingImage = await prisma.serverDescriptionImage.findFirst({
            where: {
                uploadedBy: userId,
                serverId,
                hash: fileHash,
                status: { in: ['TEMPORARY', 'PERMANENT'] },
            },
        });

        return existingImage;
    }

    /**
     * Validate images when server description is updated
     * Marks images as PERMANENT if they are used in the description
     */
    async validateImagesInDescription(
        serverId: string,
        userId: string,
        description: string,
    ) {
        if (!description) return;

        // Extract image URLs from description (markdown/html)
        const imageUrls = this.extractImageUrls(description);

        if (imageUrls.length === 0) return;

        // Find images that belong to this user and are in the description
        const images = await prisma.serverDescriptionImage.findMany({
            where: {
                uploadedBy: userId,
                url: { in: imageUrls },
                status: 'TEMPORARY',
            },
        });

        if (images.length === 0) return;

        // Mark images as PERMANENT and link them to the server
        await prisma.$transaction(
            images.map((image) =>
                prisma.serverDescriptionImage.update({
                    where: { id: image.id },
                    data: {
                        status: 'PERMANENT',
                        serverId,
                        movedAt: new Date(),
                        expiresAt: null, // Remove expiration
                    },
                }),
            ),
        );

        return {
            validatedCount: images.length,
            imageIds: images.map((img) => img.id),
        };
    }

    /**
     * Extract image URLs from markdown/html content
     */
    private extractImageUrls(content: string): string[] {
        const urls: string[] = [];

        // Match markdown images: ![alt](url)
        const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = markdownRegex.exec(content)) !== null) {
            urls.push(match[2]);
        }

        // Match HTML img tags: <img src="url" />
        const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
        while ((match = htmlRegex.exec(content)) !== null) {
            urls.push(match[1]);
        }

        // Filter only our domain images
        return urls.filter((url) => url.includes('media.orbis.place'));
    }

    /**
     * Get all temporary images for a specific server
     */
    async getTemporaryImages(userId: string, serverId: string) {
        const images = await prisma.serverDescriptionImage.findMany({
            where: {
                uploadedBy: userId,
                serverId,
                status: 'TEMPORARY',
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        return {
            images: images.map((img) => ({
                id: img.id,
                url: img.url,
                storageKey: img.storageKey,
                status: img.status,
                uploadedAt: img.uploadedAt,
                expiresAt: img.expiresAt,
                size: img.size,
            })),
            total: images.length,
            limit: MAX_TEMPORARY_IMAGES,
        };
    }

    /**
     * Delete a temporary image
     */
    async deleteTemporaryImage(userId: string, serverId: string, imageId: string) {
        const image = await prisma.serverDescriptionImage.findFirst({
            where: {
                id: imageId,
                uploadedBy: userId,
                serverId,
                status: 'TEMPORARY',
            },
        });

        if (!image) {
            throw new BadRequestException('Image not found or cannot be deleted');
        }

        // Delete from storage
        await this.storageService.deleteFile(image.url);

        // Delete from database
        await prisma.serverDescriptionImage.delete({
            where: { id: imageId },
        });

        return {
            message: 'Image deleted successfully',
        };
    }

    /**
     * Cleanup expired temporary images (to be called by a cron job)
     */
    async cleanupExpiredImages() {
        const expiredImages = await prisma.serverDescriptionImage.findMany({
            where: {
                status: 'TEMPORARY',
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        for (const image of expiredImages) {
            try {
                await this.storageService.deleteFile(image.url);
                await prisma.serverDescriptionImage.delete({
                    where: { id: image.id },
                });
            } catch (error) {
                console.error(`Failed to cleanup image ${image.id}:`, error);
            }
        }

        return {
            deletedCount: expiredImages.length,
        };
    }
}
