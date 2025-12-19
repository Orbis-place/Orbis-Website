import "dotenv/config";
import { PrismaClient } from '@repo/db';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedDiscoveryCollections() {
    console.log('🌟 Starting discovery collections seeding...');

    // Resource IDs provided by the user
    const FANCYCORE_ID = 'cmj49s5lm000a01s6az79izy3';
    const CORE_TAG_ID = 'cmj49t3bx000e01s6fw6dozm0';

    // Resources for Hidden Gems
    const hiddenGemsResourceIds = [
        'cmjap1i3j000201s6uoluytih', // ClovesPluralTale
        'cmjbwedcm000a01s6wl0tlotv', // SpellCraft
        'cmj7al6il000a01s6tdejlbqd', // Votale
        'cmj89451b001001s6p9l51m8w', // Val's Resizing Core
        'cmj7qdk35000601s6mtqk12gi', // The Crimson Book
        'cmj7k7iwu000301s6y5lebpwb', // HyDeco
    ];

    try {
        // =============================================
        // 1. SELECTION OF THE WEEK
        // =============================================
        console.log('📌 Creating Selection of the Week collection...');

        let selectionOfWeek = await prisma.discoveryResourceCollection.findUnique({
            where: { type: 'SELECTION_OF_WEEK' }
        });

        if (!selectionOfWeek) {
            selectionOfWeek = await prisma.discoveryResourceCollection.create({
                data: {
                    type: 'SELECTION_OF_WEEK',
                    title: 'Selection of the Week',
                    description: 'Our top pick for this week - a must-have resource for your Hytale server!',
                    isActive: true,
                    metadata: {},
                }
            });
        }

        // Clear existing items and add FancyCore
        await prisma.discoveryResourceCollectionItem.deleteMany({
            where: { collectionId: selectionOfWeek.id }
        });

        await prisma.discoveryResourceCollectionItem.create({
            data: {
                collectionId: selectionOfWeek.id,
                resourceId: FANCYCORE_ID,
                order: 0,
                endDate: null, // Current item
            }
        });

        console.log('✅ Selection of the Week created with FancyCore');

        // =============================================
        // 2. STARTER PACK
        // =============================================
        console.log('📦 Creating Starter Pack collection...');

        let starterPack = await prisma.discoveryResourceCollection.findUnique({
            where: { type: 'STARTER_PACK' }
        });

        if (!starterPack) {
            starterPack = await prisma.discoveryResourceCollection.create({
                data: {
                    type: 'STARTER_PACK',
                    title: 'Starter Pack: Essentials',
                    description: 'Essential resources every Hytale server needs to get started.',
                    isActive: true,
                    metadata: {},
                }
            });
        }

        // Clear existing items and add FancyCore
        await prisma.discoveryResourceCollectionItem.deleteMany({
            where: { collectionId: starterPack.id }
        });

        await prisma.discoveryResourceCollectionItem.create({
            data: {
                collectionId: starterPack.id,
                resourceId: FANCYCORE_ID,
                order: 0,
                endDate: null, // Current item
            }
        });

        console.log('✅ Starter Pack created with FancyCore');

        // =============================================
        // 3. HIDDEN GEMS
        // =============================================
        console.log('💎 Creating Hidden Gems collection...');

        let hiddenGems = await prisma.discoveryResourceCollection.findUnique({
            where: { type: 'HIDDEN_GEMS' }
        });

        if (!hiddenGems) {
            hiddenGems = await prisma.discoveryResourceCollection.create({
                data: {
                    type: 'HIDDEN_GEMS',
                    title: 'Hidden Gems',
                    description: 'Lesser-known quality resources that deserve more attention.',
                    isActive: true,
                    metadata: {},
                }
            });
        }

        // Clear existing items and add selected resources
        await prisma.discoveryResourceCollectionItem.deleteMany({
            where: { collectionId: hiddenGems.id }
        });

        for (let i = 0; i < hiddenGemsResourceIds.length; i++) {
            try {
                await prisma.discoveryResourceCollectionItem.create({
                    data: {
                        collectionId: hiddenGems.id,
                        resourceId: hiddenGemsResourceIds[i],
                        order: i,
                        endDate: null, // Current item
                    }
                });
            } catch (error) {
                console.warn(`⚠️  Could not add resource ${hiddenGemsResourceIds[i]} to Hidden Gems (may not exist)`);
            }
        }

        console.log('✅ Hidden Gems created with selected resources');

        // =============================================
        // 4. THEME OF THE MONTH
        // =============================================
        console.log('🎨 Creating Theme of the Month collection...');

        let themeOfMonth = await prisma.discoveryResourceCollection.findUnique({
            where: { type: 'THEME_OF_MONTH' }
        });

        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!themeOfMonth) {
            themeOfMonth = await prisma.discoveryResourceCollection.create({
                data: {
                    type: 'THEME_OF_MONTH',
                    title: 'Theme of the Month',
                    description: 'Core plugins and essential features for your Hytale server.',
                    isActive: true,
                    metadata: {
                        tagSlug: 'core',
                        themeName: 'Core Essentials',
                        month: currentMonth,
                        limit: 4,
                    },
                }
            });
        } else {
            // Update existing collection metadata
            await prisma.discoveryResourceCollection.update({
                where: { id: themeOfMonth.id },
                data: {
                    description: 'Core plugins and essential features for your Hytale server.',
                    metadata: {
                        tagSlug: 'core',
                        themeName: 'Core Essentials',
                        month: currentMonth,
                        limit: 4,
                    },
                }
            });
        }

        console.log('✅ Theme of the Month configured with "Core" tag (resources fetched dynamically)');

        console.log('\n🎉 Discovery collections seeding completed successfully!');
        console.log('\nSummary:');
        console.log('- Selection of the Week: FancyCore');
        console.log('- Starter Pack: FancyCore');
        console.log('- Hidden Gems: 6 selected resources');
        console.log('- Theme of the Month: Core tag (dynamic)');

    } catch (error) {
        console.error('❌ Error seeding discovery collections:', error);
        throw error;
    }
}

async function main() {
    await seedDiscoveryCollections();
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
