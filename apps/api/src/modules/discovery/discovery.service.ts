import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, DiscoveryResourceCollectionType, ResourceStatus, AccountStatus } from '@repo/db';

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

    // ============================================
    // CREATOR DISCOVERY
    // ============================================

    /**
     * Get weekly leaderboard - top creators ranked by total downloads
     * Note: Uses total downloads as weekly tracking is not implemented yet
     */
    async getWeeklyLeaderboard(limit = 10) {
        // Get users with approved resources, aggregate their download counts
        const creators = await prisma.user.findMany({
            where: {
                status: AccountStatus.ACTIVE,
                ownedResources: {
                    some: {
                        status: ResourceStatus.APPROVED,
                    },
                },
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                image: true,
                bio: true,
                _count: {
                    select: {
                        followers: true,
                        ownedResources: {
                            where: {
                                status: ResourceStatus.APPROVED,
                            },
                        },
                    },
                },
                ownedResources: {
                    where: {
                        status: ResourceStatus.APPROVED,
                    },
                    select: {
                        downloadCount: true,
                        type: true,
                    },
                },
            },
        });

        // Calculate total downloads and format response
        const creatorsWithStats = creators.map((creator) => {
            const totalDownloads = creator.ownedResources.reduce(
                (sum, resource) => sum + resource.downloadCount,
                0
            );
            const specialties = [...new Set(creator.ownedResources.map((r) => r.type))];

            return {
                id: creator.id,
                username: creator.username,
                displayName: creator.displayName,
                image: creator.image,
                bio: creator.bio,
                stats: {
                    resources: creator._count.ownedResources,
                    downloads: totalDownloads,
                    followers: creator._count.followers,
                },
                specialties,
            };
        });

        // Sort by downloads and take top N
        const leaderboard = creatorsWithStats
            .sort((a, b) => b.stats.downloads - a.stats.downloads)
            .slice(0, limit)
            .map((creator, index) => ({
                rank: index + 1,
                previousRank: index + 1, // No historical data yet
                creator,
                weeklyDownloads: creator.stats.downloads, // Using total as we don't track weekly
                weeklyChange: 0,
            }));

        return { leaderboard };
    }

    /**
     * Get top creator for each resource type/category
     */
    async getTopCreatorsByCategory() {
        const resourceTypes = [
            'PLUGIN',
            'ASSET_PACK',
            'MOD',
            'MODPACK',
            'PREMADE_SERVER',
            'WORLD',
            'PREFAB',
            'DATA_PACK',
            'TOOLS_SCRIPTS',
        ];

        const result: Record<string, any> = {};

        for (const type of resourceTypes) {
            // Use raw SQL to get top creator by total downloads in this category
            const topCreators = await prisma.$queryRaw<any[]>`
                SELECT 
                    u.id,
                    u.username,
                    u."displayName",
                    u.image,
                    COUNT(r.id)::int as resource_count,
                    SUM(r."downloadCount")::int as total_downloads,
                    COUNT(DISTINCT f."followerId")::int as follower_count
                FROM "user" u
                INNER JOIN resources r ON r."ownerUserId" = u.id
                LEFT JOIN follows f ON f."followingId" = u.id
                WHERE u.status = 'ACTIVE'
                  AND r.status IN ('APPROVED', 'PENDING', 'DRAFT')
                  AND r.type = ${type}::"ResourceType"
                GROUP BY u.id, u.username, u."displayName", u.image
                ORDER BY total_downloads DESC
                LIMIT 1
            `;

            if (topCreators.length > 0) {
                const top = topCreators[0];
                const key = type.toLowerCase().replace(/_/g, '-');

                result[key] = {
                    id: top.id,
                    username: top.username,
                    displayName: top.displayName,
                    image: top.image,
                    stats: {
                        resources: top.resource_count,
                        downloads: top.total_downloads || 0,
                        followers: top.follower_count,
                    },
                };

                console.log(`✓ Top creator for ${type}: @${top.username} with ${top.total_downloads} downloads`);
            } else {
                console.log(`✗ No creators found for ${type}`);
            }
        }

        console.log('Final result keys:', Object.keys(result));
        return { topByCategory: result };
    }

    /**
     * Get random creators for shuffle/discovery feature
     */
    async getRandomCreators(limit = 6) {
        // Get all active creators with at least one approved resource
        const creators = await prisma.user.findMany({
            where: {
                status: AccountStatus.ACTIVE,
                ownedResources: {
                    some: {
                        status: ResourceStatus.APPROVED,
                    },
                },
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                image: true,
                bio: true,
                _count: {
                    select: {
                        followers: true,
                        ownedResources: {
                            where: {
                                status: ResourceStatus.APPROVED,
                            },
                        },
                    },
                },
                ownedResources: {
                    where: {
                        status: ResourceStatus.APPROVED,
                    },
                    select: {
                        downloadCount: true,
                        type: true,
                    },
                },
            },
        });

        // Shuffle and take random N
        const shuffled = creators.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, limit);

        const result = selected.map((creator) => {
            const totalDownloads = creator.ownedResources.reduce(
                (sum, r) => sum + r.downloadCount,
                0
            );
            const specialties = [...new Set(creator.ownedResources.map((r) => r.type))];

            return {
                id: creator.id,
                username: creator.username,
                displayName: creator.displayName,
                image: creator.image,
                bio: creator.bio,
                stats: {
                    resources: creator._count.ownedResources,
                    downloads: totalDownloads,
                    followers: creator._count.followers,
                },
                specialties,
            };
        });

        return { creators: result };
    }
}

