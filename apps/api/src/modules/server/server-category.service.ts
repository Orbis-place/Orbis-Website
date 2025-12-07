import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ServerCategoryService {
    constructor() {
    }

    async findAll() {
        return prisma.serverCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: {
                        servers: true,
                    },
                },
            },
        });
    }

    async findBySlug(slug: string) {
        return prisma.serverCategory.findUnique({
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
}