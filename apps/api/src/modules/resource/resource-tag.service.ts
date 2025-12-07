import { Injectable } from '@nestjs/common';

import { prisma, ResourceType } from '@repo/db';

@Injectable()
export class ResourceTagService {
    constructor() { }

    /**
     * Get all tags with optional search and categorization
     */
    async getAllTags(search?: string, limit = 50) {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        return prisma.resourceTag.findMany({
            where,
            take: limit,
            orderBy: [
                { usageCount: 'desc' },
                { name: 'asc' },
            ],
            include: {
                usageByType: true,
            },
        });
    }

    /**
     * Search tags by name with autocomplete support
     */
    async searchTags(query: string, limit = 10) {
        if (!query || query.trim().length === 0) {
            // Return popular tags if no query
            return prisma.resourceTag.findMany({
                take: limit,
                orderBy: [
                    { usageCount: 'desc' },
                    { name: 'asc' },
                ],
            });
        }

        return prisma.resourceTag.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { slug: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: limit,
            orderBy: [
                { usageCount: 'desc' },
                { name: 'asc' },
            ]
        });
    }

    /**
     * Get popular tags for a specific resource type
     */
    async getPopularTagsForType(resourceType: ResourceType, limit = 20) {
        const tagUsages = await prisma.resourceTagUsageByType.findMany({
            where: { resourceType },
            take: limit,
            orderBy: {
                usageCount: 'desc',
            },
            include: {
                tag: true,
            },
        });

        return tagUsages.map(usage => ({
            ...usage.tag,
            usageCountForType: usage.usageCount,
        }));
    }

    /**
     * Get tag by ID
     */
    async getTagById(tagId: string) {
        return prisma.resourceTag.findUnique({
            where: { id: tagId },
            include: {
                usageByType: true,
            },
        });
    }

    /**
     * Get tag by slug
     */
    async getTagBySlug(slug: string) {
        return prisma.resourceTag.findUnique({
            where: { slug },
            include: {
                usageByType: true,
            },
        });
    }
}
