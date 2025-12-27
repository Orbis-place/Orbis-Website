import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { prisma, ShowcaseMediaType } from '@repo/db';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ShowcaseMediaService {
    constructor(private readonly storage: StorageService) { }

    /**
     * Upload media to a showcase post
     */
    async uploadMedia(
        postId: string,
        userId: string,
        file: Express.Multer.File,
        type: ShowcaseMediaType = ShowcaseMediaType.IMAGE,
        caption?: string,
    ) {
        // Verify post ownership
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        if (post.authorId !== userId) {
            throw new BadRequestException('You can only add media to your own posts');
        }

        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4', 'video/webm'];
        const allowedTypes = type === ShowcaseMediaType.VIDEO
            ? [...allowedImageTypes, ...allowedVideoTypes]
            : allowedImageTypes;

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
        }

        // Get current max order
        const maxOrder = await prisma.showcasePostMedia.aggregate({
            where: { postId },
            _max: { order: true },
        });
        const nextOrder = (maxOrder._max.order ?? -1) + 1;

        // Upload to storage
        const folder = `showcase/${postId}`;
        const url = await this.storage.uploadFile(file, folder);

        // Create media record
        const media = await prisma.showcasePostMedia.create({
            data: {
                postId,
                url,
                storageKey: url, // Using URL as storage key since uploadFile returns the full URL
                type,
                order: nextOrder,
                caption,
                size: file.size,
            },
        });

        // Set as thumbnail if first image
        if (nextOrder === 0 && type === ShowcaseMediaType.IMAGE) {
            await prisma.showcasePost.update({
                where: { id: postId },
                data: { thumbnailUrl: url },
            });
        }

        return media;
    }

    /**
     * Delete media from a showcase post
     */
    async deleteMedia(mediaId: string, userId: string) {
        const media = await prisma.showcasePostMedia.findUnique({
            where: { id: mediaId },
            include: { post: true },
        });

        if (!media) {
            throw new NotFoundException('Media not found');
        }

        if (media.post.authorId !== userId) {
            throw new BadRequestException('You can only delete media from your own posts');
        }

        // Delete from storage
        await this.storage.deleteFile(media.storageKey);

        // Delete record
        await prisma.showcasePostMedia.delete({
            where: { id: mediaId },
        });

        // If this was the thumbnail, set a new one
        if (media.post.thumbnailUrl === media.url) {
            const nextMedia = await prisma.showcasePostMedia.findFirst({
                where: { postId: media.postId, type: ShowcaseMediaType.IMAGE },
                orderBy: { order: 'asc' },
            });

            await prisma.showcasePost.update({
                where: { id: media.postId },
                data: { thumbnailUrl: nextMedia?.url || null },
            });
        }

        return { message: 'Media deleted successfully' };
    }

    /**
     * Reorder media
     */
    async reorderMedia(postId: string, userId: string, mediaIds: string[]) {
        const post = await prisma.showcasePost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Showcase post not found');
        }

        if (post.authorId !== userId) {
            throw new BadRequestException('You can only reorder media on your own posts');
        }

        // Update order for each media
        await prisma.$transaction(
            mediaIds.map((id, index) =>
                prisma.showcasePostMedia.update({
                    where: { id },
                    data: { order: index },
                }),
            ),
        );

        // Update thumbnail to first image
        const firstImage = await prisma.showcasePostMedia.findFirst({
            where: { postId, type: ShowcaseMediaType.IMAGE },
            orderBy: { order: 'asc' },
        });

        if (firstImage) {
            await prisma.showcasePost.update({
                where: { id: postId },
                data: { thumbnailUrl: firstImage.url },
            });
        }

        return { message: 'Media reordered successfully' };
    }

    /**
     * Get all media for a post
     */
    async getMedia(postId: string) {
        const media = await prisma.showcasePostMedia.findMany({
            where: { postId },
            orderBy: { order: 'asc' },
        });

        return media;
    }
}
