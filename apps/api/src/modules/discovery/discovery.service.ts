import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, DiscoveryResourceCollectionType, ResourceStatus } from '@repo/db';

@Injectable()
export class DiscoveryService {
    // ============================================
    // RESOURCE COLLECTIONS
    // ============================================

    async getResourceCollection(type: DiscoveryResourceCollectionType) {
        if (type === 'THEME_OF_MONTH') {
            return this.getThemeOfMonth();
        }

        const collection = await prisma.discoveryResourceCollection.findUnique({
            where: {
                type,
                isActive: true,
            },
            include: {
                items: {
                    where: {
                        endDate: null,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                    include: {
                        resource: {
                            include: {
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
                                        slug: true,
                                        logo: true,
                                    },
                                },
                                latestVersion: {
                                    select: {
                                        id: true,
                                        versionNumber: true,
                                        name: true,
                                        channel: true,
                                        createdAt: true,
                                        publishedAt: true,
                                    },
                                },
                                tags: {
                                    include: {
                                        tag: true,
                                    },
                                },
                                categories: {
                                    include: {
                                        category: true,
                                    },
                                },
                                _count: {
                                    select: {
                                        versions: true,
                                        downloads: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!collection) {
            throw new NotFoundException(`Collection ${type} not found or inactive`);
        }

        // Format response
        return {
            collection: {
                id: collection.id,
                type: collection.type,
                title: collection.title,
                description: collection.description,
                metadata: collection.metadata,
            },
            resources: collection.items.map((item) => item.resource),
        };
    }

    async getThemeOfMonth(): Promise<any> {
        const themeCollection = await prisma.discoveryResourceCollection.findUnique({
            where: {
                type: 'THEME_OF_MONTH',
                isActive: true,
            },
        });

        if (!themeCollection) {
            throw new NotFoundException('Theme of the Month collection not found');
        }

        const tagSlug = themeCollection.metadata?.['tagSlug'] as string;
        const limit = (themeCollection.metadata?.['limit'] as number) || 4;

        if (!tagSlug) {
            throw new NotFoundException('Theme tag not configured in metadata');
        }

        const resources = await prisma.resource.findMany({
            where: {
                status: ResourceStatus.APPROVED,
                tags: {
                    some: {
                        tag: {
                            slug: tagSlug,
                        },
                    },
                },
            },
            orderBy: [
                { likeCount: 'desc' },
                { downloadCount: 'desc' },
            ],
            take: limit,
            include: {
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
                        slug: true,
                        logo: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        createdAt: true,
                        publishedAt: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                categories: {
                    include: {
                        category: true,
                    },
                },
                _count: {
                    select: {
                        versions: true,
                        downloads: true,
                    },
                },
            },
        });

        return {
            collection: {
                id: themeCollection.id,
                type: themeCollection.type,
                title: themeCollection.title,
                description: themeCollection.description,
                metadata: themeCollection.metadata,
            },
            resources,
        };
    }

    async getMostDownloadedResources(limit = 10) {
        const resources = await prisma.resource.findMany({
            where: {
                status: ResourceStatus.APPROVED,
            },
            orderBy: {
                downloadCount: 'desc',
            },
            take: limit,
            include: {
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
                        slug: true,
                        logo: true,
                    },
                },
                latestVersion: {
                    select: {
                        id: true,
                        versionNumber: true,
                        name: true,
                        channel: true,
                        createdAt: true,
                        publishedAt: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                categories: {
                    include: {
                        category: true,
                    },
                },
                _count: {
                    select: {
                        versions: true,
                        downloads: true,
                    },
                },
            },
        });

        return { resources };
    }
}
