import { prisma } from '../src/client.js'
import type { ResourceType } from '../generated/prisma/client/index.js'


interface UsageStats {
    tags: {
        total: number
        updated: number
        created: number
    }
    categories: {
        total: number
        updated: number
        created: number
    }
}

async function resyncTagUsageCounts(): Promise<UsageStats['tags']> {
    console.log('🏷️  Resyncing tag usage counts...\n')

    const stats = {
        total: 0,
        updated: 0,
        created: 0,
    }

    // Get all tags
    const tags = await prisma.resourceTag.findMany()
    stats.total = tags.length

    for (const tag of tags) {
        // Count total usage across all resources
        const totalUsage = await prisma.resourceToTag.count({
            where: { tagId: tag.id },
        })

        // Update global usage count
        await prisma.resourceTag.update({
            where: { id: tag.id },
            data: { usageCount: totalUsage },
        })

        // Get usage count per resource type
        const usageByType = await prisma.$queryRaw<
            Array<{ type: ResourceType; count: bigint }>
        >`
      SELECT r.type, COUNT(*)::int as count
      FROM resource_to_tags rtt
      INNER JOIN resources r ON rtt."resourceId" = r.id
      WHERE rtt."tagId" = ${tag.id}
      GROUP BY r.type
    `

        console.log(`  Tag "${tag.name}":`)
        console.log(`    Global usage: ${totalUsage}`)

        // Update or create usage by type entries
        for (const { type, count } of usageByType) {
            const usageCount = Number(count)
            console.log(`    - ${type}: ${usageCount}`)

            const existing = await prisma.resourceTagUsageByType.findUnique({
                where: {
                    tagId_resourceType: {
                        tagId: tag.id,
                        resourceType: type,
                    },
                },
            })

            if (existing) {
                await prisma.resourceTagUsageByType.update({
                    where: {
                        tagId_resourceType: {
                            tagId: tag.id,
                            resourceType: type,
                        },
                    },
                    data: { usageCount },
                })
                stats.updated++
            } else {
                await prisma.resourceTagUsageByType.create({
                    data: {
                        tagId: tag.id,
                        resourceType: type,
                        usageCount,
                    },
                })
                stats.created++
            }
        }

        // Remove entries with 0 usage
        await prisma.resourceTagUsageByType.deleteMany({
            where: {
                tagId: tag.id,
                resourceType: {
                    notIn: usageByType.map((u: { type: ResourceType }) => u.type),
                },
            },
        })

        console.log()
    }

    return stats
}

async function resyncCategoryUsageCounts(): Promise<UsageStats['categories']> {
    console.log('📁 Resyncing category usage counts...\n')

    const stats = {
        total: 0,
        updated: 0,
        created: 0,
    }

    // Get all categories
    const categories = await prisma.resourceCategory.findMany()
    stats.total = categories.length

    for (const category of categories) {
        // Count total usage across all resources
        const totalUsage = await prisma.resourceToCategory.count({
            where: { categoryId: category.id },
        })

        // Update global usage count
        await prisma.resourceCategory.update({
            where: { id: category.id },
            data: { usageCount: totalUsage },
        })

        // Get usage count per resource type
        const usageByType = await prisma.$queryRaw<
            Array<{ type: ResourceType; count: bigint }>
        >`
      SELECT r.type, COUNT(*)::int as count
      FROM resource_to_categories rtc
      INNER JOIN resources r ON rtc."resourceId" = r.id
      WHERE rtc."categoryId" = ${category.id}
      GROUP BY r.type
    `

        console.log(`  Category "${category.name}":`)
        console.log(`    Global usage: ${totalUsage}`)

        // Update or create usage by type entries
        for (const { type, count } of usageByType) {
            const usageCount = Number(count)
            console.log(`    - ${type}: ${usageCount}`)

            const existing = await prisma.resourceCategoryUsageByType.findUnique({
                where: {
                    categoryId_resourceType: {
                        categoryId: category.id,
                        resourceType: type,
                    },
                },
            })

            if (existing) {
                await prisma.resourceCategoryUsageByType.update({
                    where: {
                        categoryId_resourceType: {
                            categoryId: category.id,
                            resourceType: type,
                        },
                    },
                    data: { usageCount },
                })
                stats.updated++
            } else {
                await prisma.resourceCategoryUsageByType.create({
                    data: {
                        categoryId: category.id,
                        resourceType: type,
                        usageCount,
                    },
                })
                stats.created++
            }
        }

        // Remove entries with 0 usage
        await prisma.resourceCategoryUsageByType.deleteMany({
            where: {
                categoryId: category.id,
                resourceType: {
                    notIn: usageByType.map((u: { type: ResourceType }) => u.type),
                },
            },
        })

        console.log()
    }

    return stats
}

async function main() {
    console.log('🔄 Starting usage count resynchronization...\n')
    console.log('='.repeat(50))
    console.log()

    try {
        const tagStats = await resyncTagUsageCounts()
        const categoryStats = await resyncCategoryUsageCounts()

        console.log('='.repeat(50))
        console.log('\n✅ Resynchronization complete!\n')
        console.log('📊 Summary:')
        console.log('  Tags:')
        console.log(`    - Total tags processed: ${tagStats.total}`)
        console.log(`    - Usage by type entries updated: ${tagStats.updated}`)
        console.log(`    - Usage by type entries created: ${tagStats.created}`)
        console.log('  Categories:')
        console.log(`    - Total categories processed: ${categoryStats.total}`)
        console.log(
            `    - Usage by type entries updated: ${categoryStats.updated}`,
        )
        console.log(
            `    - Usage by type entries created: ${categoryStats.created}`,
        )
        console.log()
    } catch (error) {
        console.error('❌ Error during resynchronization:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
