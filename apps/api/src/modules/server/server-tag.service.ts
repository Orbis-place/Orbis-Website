import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ServerTagService {
    constructor() {
    }

    async findAll() {
        return prisma.serverTag.findMany({
            orderBy: { name: 'asc' },
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

    async findPopular(limit: number = 20) {
        const tags = await prisma.$queryRaw<
            Array<{
                id: string;
                name: string;
                slug: string;
                color: string | null;
                server_count: bigint;
            }>
        >`
            SELECT st.id,
                   st.name,
                   st.slug,
                   st.color,
                   COUNT(str."serverId") as server_count
            FROM server_tags st
                     LEFT JOIN server_tag_relations str ON st.id = str."tagId"
                     LEFT JOIN servers s ON str."serverId" = s.id AND s.status = 'APPROVED'
            GROUP BY st.id, st.name, st.slug, st.color
            ORDER BY server_count DESC
                LIMIT ${limit}
        `;

        return tags.map((tag) => ({
            ...tag,
            server_count: Number(tag.server_count),
        }));
    }
}
