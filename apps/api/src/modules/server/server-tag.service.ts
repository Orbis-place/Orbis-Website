import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ServerTagService {
    constructor() {
    }

    /**
     * Get all tags with optional search
     */
    async getAllTags(search?: string, limit = 100) {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        return prisma.serverTag.findMany({
            where,
            take: limit,
            orderBy: [
                { usageCount: 'desc' },
                { name: 'asc' },
            ],
        });
    }

    /**
     * Search tags by name with autocomplete support
     */
    async searchTags(query: string, limit = 10) {
        if (!query || query.trim().length === 0) {
            // Return popular tags if no query
            return prisma.serverTag.findMany({
                take: limit,
                orderBy: [
                    { usageCount: 'desc' },
                    { name: 'asc' },
                ],
            });
        }

        return prisma.serverTag.findMany({
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
     * Get tag by ID
     */
    async getTagById(tagId: string) {
        return prisma.serverTag.findUnique({
            where: { id: tagId },
        });
    }

    /**
     * Get tag by slug
     */
    async getTagBySlug(slug: string) {
        return prisma.serverTag.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        servers: true,
                    },
                },
            },
        });
    }

    /**
     * Get popular tags
     */
    async findPopular(limit: number = 20) {
        return prisma.serverTag.findMany({
            take: limit,
            orderBy: [
                { usageCount: 'desc' },
                { name: 'asc' },
            ],
        });
    }
}
