import "dotenv/config";
import { PrismaClient, ResourceType } from '@repo/db';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  // Seed Server Categories
  console.log('Seeding server categories...');

  const categories = [
    {
      name: 'Survival',
      slug: 'survival',
      description: 'Classic survival gameplay with resource gathering and building',
      icon: 'mdi:hammer',
      color: '#69a024',
      order: 1,
    },
    {
      name: 'Creative',
      slug: 'creative',
      description: 'Unlimited resources for building and creativity',
      icon: 'mdi:palette',
      color: '#FF6B6B',
      order: 2,
    },
    {
      name: 'Adventure',
      slug: 'adventure',
      description: 'Custom maps and adventure gameplay',
      icon: 'mdi:map',
      color: '#4ECDC4',
      order: 3,
    },
    {
      name: 'Minigames',
      slug: 'minigames',
      description: 'Various mini-games and competitive gameplay',
      icon: 'mdi:gamepad-variant',
      color: '#FFE66D',
      order: 4,
    },
    {
      name: 'PvP',
      slug: 'pvp',
      description: 'Player versus player combat focused servers',
      icon: 'mdi:sword-cross',
      color: '#FF4757',
      order: 5,
    },
    {
      name: 'Roleplay',
      slug: 'roleplay',
      description: 'Immersive roleplay experiences',
      icon: 'mdi:drama-masks',
      color: '#A29BFE',
      order: 6,
    },
    {
      name: 'Hardcore',
      slug: 'hardcore',
      description: 'Challenging gameplay with permanent death',
      icon: 'mdi:skull',
      color: '#2D3436',
      order: 7,
    },
    {
      name: 'Faction',
      slug: 'faction',
      description: 'Team-based gameplay with faction warfare',
      icon: 'mdi:shield',
      color: '#FD79A8',
      order: 8,
    },
    {
      name: 'Skyblock',
      slug: 'skyblock',
      description: 'Start on a floating island and expand',
      icon: 'mdi:cloud',
      color: '#74B9FF',
      order: 9,
    },
    {
      name: 'Prison',
      slug: 'prison',
      description: 'Mine and rank up through prison tiers',
      icon: 'mdi:gate',
      color: '#636E72',
      order: 10,
    },
    {
      name: 'Economy',
      slug: 'economy',
      description: 'Player-driven economy and trading',
      icon: 'mdi:cash',
      color: '#55EFC4',
      order: 11,
    },
    {
      name: 'Modded',
      slug: 'modded',
      description: 'Servers with custom mods and plugins',
      icon: 'mdi:puzzle',
      color: '#00B894',
      order: 12,
    },
  ];

  for (const category of categories) {
    await prisma.serverCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`✓ Seeded ${categories.length} server categories`);

  // Seed Server Tags
  console.log('Seeding server tags...');

  const tags = [
    // Gameplay Style Tags
    {
      name: 'Casual',
      slug: 'casual',
      description: 'Relaxed gameplay for all skill levels',
      icon: 'mdi:emoticon-happy',
      color: '#74B9FF',
    },
    {
      name: 'Competitive',
      slug: 'competitive',
      description: 'Competitive gameplay with rankings',
      icon: 'mdi:trophy',
      color: '#FFD700',
    },
    {
      name: 'Hardcore',
      slug: 'hardcore-tag',
      description: 'Challenging gameplay mechanics',
      icon: 'mdi:fire',
      color: '#FF4757',
    },

    // Community Tags
    {
      name: 'Family Friendly',
      slug: 'family-friendly',
      description: 'Safe environment for all ages',
      icon: 'mdi:shield-check',
      color: '#55EFC4',
    },
    {
      name: 'LGBTQ+ Friendly',
      slug: 'lgbtq-friendly',
      description: 'Inclusive and welcoming community',
      icon: 'mdi:flag',
      color: '#A29BFE',
    },
    {
      name: 'Active Community',
      slug: 'active-community',
      description: 'Very active player base',
      icon: 'mdi:account-group',
      color: '#69a024',
    },
    {
      name: 'Newcomer Friendly',
      slug: 'newcomer-friendly',
      description: 'Great for new players',
      icon: 'mdi:hand-wave',
      color: '#4ECDC4',
    },

    // Technical Tags
    {
      name: 'Custom Plugins',
      slug: 'custom-plugins',
      description: 'Unique custom plugins and features',
      icon: 'mdi:puzzle',
      color: '#FF6B6B',
    },
    {
      name: 'Custom Content',
      slug: 'custom-content',
      description: 'Original custom content',
      icon: 'mdi:star',
      color: '#FFE66D',
    },
    {
      name: 'Custom World',
      slug: 'custom-world',
      description: 'Custom generated or built world',
      icon: 'mdi:earth',
      color: '#00B894',
    },
    {
      name: 'Custom Mobs',
      slug: 'custom-mobs',
      description: 'Unique custom creatures',
      icon: 'mdi:alien',
      color: '#A29BFE',
    },

    // Size & Performance Tags
    {
      name: 'Small Server',
      slug: 'small-server',
      description: 'Intimate community (1-50 players)',
      icon: 'mdi:account',
      color: '#74B9FF',
    },
    {
      name: 'Medium Server',
      slug: 'medium-server',
      description: 'Mid-sized community (50-200 players)',
      icon: 'mdi:account-multiple',
      color: '#55EFC4',
    },
    {
      name: 'Large Server',
      slug: 'large-server',
      description: 'Large community (200+ players)',
      icon: 'mdi:account-multiple-plus',
      color: '#FFD700',
    },
    {
      name: 'High Performance',
      slug: 'high-performance',
      description: 'Optimized for smooth gameplay',
      icon: 'mdi:speedometer',
      color: '#69a024',
    },

    // Features Tags
    {
      name: 'Events',
      slug: 'events',
      description: 'Regular community events',
      icon: 'mdi:calendar-star',
      color: '#FF6B6B',
    },
    {
      name: 'Quests',
      slug: 'quests',
      description: 'Quest system and missions',
      icon: 'mdi:book-open-page-variant',
      color: '#4ECDC4',
    },
    {
      name: 'Ranks',
      slug: 'ranks',
      description: 'Progression system with ranks',
      icon: 'mdi:chevron-triple-up',
      color: '#FFE66D',
    },
    {
      name: 'Land Claiming',
      slug: 'land-claiming',
      description: 'Protect your builds with claims',
      icon: 'mdi:map-marker',
      color: '#FF4757',
    },
    {
      name: 'Player Shops',
      slug: 'player-shops',
      description: 'Player-owned shop system',
      icon: 'mdi:store',
      color: '#55EFC4',
    },
    {
      name: 'Auction House',
      slug: 'auction-house',
      description: 'Server-wide auction system',
      icon: 'mdi:gavel',
      color: '#00B894',
    },
    {
      name: 'Custom Items',
      slug: 'custom-items',
      description: 'Unique custom items',
      icon: 'mdi:sword',
      color: '#636E72',
    },
    {
      name: 'Custom Enchantments',
      slug: 'custom-enchantments',
      description: 'Unique enchantment system',
      icon: 'mdi:shimmer',
      color: '#A29BFE',
    },
    {
      name: 'Skills System',
      slug: 'skills-system',
      description: 'RPG-style skill progression',
      icon: 'mdi:chart-line',
      color: '#FD79A8',
    },
    {
      name: 'Classes',
      slug: 'classes',
      description: 'Character class system',
      icon: 'mdi:account-multiple-outline',
      color: '#74B9FF',
    },
    {
      name: 'Pets',
      slug: 'pets',
      description: 'Companion pet system',
      icon: 'mdi:dog',
      color: '#FF6B6B',
    },
    {
      name: 'Vehicles',
      slug: 'vehicles',
      description: 'Custom vehicles and mounts',
      icon: 'mdi:car',
      color: '#4ECDC4',
    },

    // Game Mode Tags
    {
      name: 'Towny',
      slug: 'towny',
      description: 'Town and nation building',
      icon: 'mdi:city',
      color: '#69a024',
    },
    {
      name: 'McMMO',
      slug: 'mcmmo',
      description: 'RPG skill system',
      icon: 'mdi:arm-flex',
      color: '#FFE66D',
    },
    {
      name: 'Parkour',
      slug: 'parkour',
      description: 'Parkour challenges',
      icon: 'mdi:run',
      color: '#FF4757',
    },
    {
      name: 'Build Battle',
      slug: 'build-battle',
      description: 'Building competitions',
      icon: 'mdi:hammer',
      color: '#FF6B6B',
    },
    {
      name: 'Bedwars',
      slug: 'bedwars',
      description: 'Bed protection PvP game',
      icon: 'mdi:bed',
      color: '#74B9FF',
    },
    {
      name: 'Skywars',
      slug: 'skywars',
      description: 'Sky island PvP battles',
      icon: 'mdi:cloud',
      color: '#4ECDC4',
    },
    {
      name: 'Hunger Games',
      slug: 'hunger-games',
      description: 'Battle royale survival',
      icon: 'mdi:run-fast',
      color: '#FF4757',
    },

    // Support & Quality Tags
    {
      name: 'Active Staff',
      slug: 'active-staff',
      description: 'Responsive and helpful staff team',
      icon: 'mdi:account-supervisor',
      color: '#00B894',
    },
    {
      name: 'Regular Updates',
      slug: 'regular-updates',
      description: 'Frequently updated content',
      icon: 'mdi:update',
      color: '#69a024',
    },
    {
      name: 'No Pay to Win',
      slug: 'no-pay-to-win',
      description: 'Fair gameplay without paid advantages',
      icon: 'mdi:cash-remove',
      color: '#55EFC4',
    },
    {
      name: 'Discord Integration',
      slug: 'discord-integration',
      description: 'Connected Discord community',
      icon: 'mdi:discord',
      color: '#5865F2',
    },
    {
      name: 'Website',
      slug: 'website',
      description: 'Dedicated server website',
      icon: 'mdi:web',
      color: '#636E72',
    },

    // Region Tags
    {
      name: 'North America',
      slug: 'north-america',
      description: 'Hosted in North America',
      icon: 'mdi:earth',
      color: '#74B9FF',
    },
    {
      name: 'Europe',
      slug: 'europe',
      description: 'Hosted in Europe',
      icon: 'mdi:earth',
      color: '#55EFC4',
    },
    {
      name: 'Asia',
      slug: 'asia',
      description: 'Hosted in Asia',
      icon: 'mdi:earth',
      color: '#FFE66D',
    },
    {
      name: 'Oceania',
      slug: 'oceania',
      description: 'Hosted in Oceania',
      icon: 'mdi:earth',
      color: '#4ECDC4',
    },
    {
      name: 'South America',
      slug: 'south-america',
      description: 'Hosted in South America',
      icon: 'mdi:earth',
      color: '#FF6B6B',
    },
  ];

  for (const tag of tags) {
    await prisma.serverTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }

  console.log(`✓ Seeded ${tags.length} server tags`);

  // Seed Resource Categories
  console.log('Seeding resource categories...');

  const resourceCategories = [
    // Plugin Categories
    {
      name: 'Gameplay',
      slug: 'gameplay',
      description: 'Plugins that enhance or modify core gameplay mechanics',
      icon: 'mdi:gamepad-variant',
      color: '#69a024',
      order: 1,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD],
    },
    {
      name: 'Administration',
      slug: 'administration',
      description: 'Server management and administrative tools',
      icon: 'mdi:cog',
      color: '#FF6B6B',
      order: 2,
      resourceTypes: [ResourceType.PLUGIN],
    },
    {
      name: 'Chat & Communication',
      slug: 'chat-communication',
      description: 'Chat formatting, moderation, and communication tools',
      icon: 'mdi:chat',
      color: '#4ECDC4',
      order: 3,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD],
    },
    {
      name: 'Economy',
      slug: 'economy',
      description: 'Economy systems, shops, and currency management',
      icon: 'mdi:cash-multiple',
      color: '#55EFC4',
      order: 4,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD],
    },
    {
      name: 'Fun & Entertainment',
      slug: 'fun-entertainment',
      description: 'Mini-games, cosmetics, and entertainment features',
      icon: 'mdi:party-popper',
      color: '#FFE66D',
      order: 5,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD, ResourceType.WORLD],
    },
    {
      name: 'World Management',
      slug: 'world-management',
      description: 'World editing, generation, and protection tools',
      icon: 'mdi:earth',
      color: '#00B894',
      order: 6,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD],
    },
    {
      name: 'Developer Tools',
      slug: 'developer-tools',
      description: 'APIs, libraries, and development utilities',
      icon: 'mdi:tools',
      color: '#636E72',
      order: 7,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD],
    },
    {
      name: 'Combat & PvP',
      slug: 'combat-pvp',
      description: 'Combat mechanics and PvP-related features',
      icon: 'mdi:sword-cross',
      color: '#FF4757',
      order: 8,
      resourceTypes: [ResourceType.PLUGIN, ResourceType.MOD],
    },

    // Mod-specific Categories
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Tech mods with machinery, automation, and power systems',
      icon: 'mdi:wrench',
      color: '#74B9FF',
      order: 9,
      resourceTypes: [ResourceType.MOD, ResourceType.MODPACK],
    },
    {
      name: 'Magic & Sorcery',
      slug: 'magic-sorcery',
      description: 'Magical abilities, spells, and mystical content',
      icon: 'mdi:auto-fix',
      color: '#A29BFE',
      order: 10,
      resourceTypes: [ResourceType.MOD, ResourceType.MODPACK],
    },
    {
      name: 'Exploration & Adventure',
      slug: 'exploration-adventure',
      description: 'New dimensions, biomes, and exploration content',
      icon: 'mdi:compass',
      color: '#FD79A8',
      order: 11,
      resourceTypes: [ResourceType.MOD, ResourceType.MODPACK, ResourceType.WORLD],
    },
    {
      name: 'Farming & Food',
      slug: 'farming-food',
      description: 'Agriculture, cooking, and food-related content',
      icon: 'mdi:barley',
      color: '#55EFC4',
      order: 12,
      resourceTypes: [ResourceType.MOD, ResourceType.MODPACK],
    },

    // World Categories
    {
      name: 'Adventure Maps',
      slug: 'adventure-maps',
      description: 'Story-driven adventure maps with quests',
      icon: 'mdi:map-legend',
      color: '#4ECDC4',
      order: 13,
      resourceTypes: [ResourceType.WORLD],
    },
    {
      name: 'Parkour',
      slug: 'parkour-world',
      description: 'Parkour and jumping challenges',
      icon: 'mdi:run-fast',
      color: '#FF4757',
      order: 14,
      resourceTypes: [ResourceType.WORLD],
    },
    {
      name: 'PvP Maps',
      slug: 'pvp-maps',
      description: 'Battle arenas and PvP-focused maps',
      icon: 'mdi:sword',
      color: '#FF6B6B',
      order: 15,
      resourceTypes: [ResourceType.WORLD],
    },
    {
      name: 'Survival Spawns',
      slug: 'survival-spawns',
      description: 'Spawn areas and hubs for survival servers',
      icon: 'mdi:castle',
      color: '#69a024',
      order: 16,
      resourceTypes: [ResourceType.WORLD, ResourceType.PREFAB],
    },
    {
      name: 'Creative Showcases',
      slug: 'creative-showcases',
      description: 'Impressive builds and creative showcases',
      icon: 'mdi:palette',
      color: '#A29BFE',
      order: 17,
      resourceTypes: [ResourceType.WORLD, ResourceType.PREFAB],
    },

    // Asset Pack Categories
    {
      name: 'Textures',
      slug: 'textures',
      description: 'Texture packs and resource packs',
      icon: 'mdi:texture-box',
      color: '#FFE66D',
      order: 18,
      resourceTypes: [ResourceType.ASSET_PACK],
    },
    {
      name: 'Sounds & Music',
      slug: 'sounds-music',
      description: 'Sound effects and music packs',
      icon: 'mdi:music',
      color: '#74B9FF',
      order: 19,
      resourceTypes: [ResourceType.ASSET_PACK],
    },
    {
      name: 'Models',
      slug: 'models',
      description: '3D models and custom entity models',
      icon: 'mdi:cube-outline',
      color: '#FD79A8',
      order: 20,
      resourceTypes: [ResourceType.ASSET_PACK, ResourceType.PREFAB],
    },

    // Prefab Categories
    {
      name: 'Buildings',
      slug: 'buildings',
      description: 'Pre-built structures and buildings',
      icon: 'mdi:office-building',
      color: '#636E72',
      order: 21,
      resourceTypes: [ResourceType.PREFAB],
    },
    {
      name: 'Decorations',
      slug: 'decorations',
      description: 'Decorative elements and details',
      icon: 'mdi:flower',
      color: '#FF6B6B',
      order: 22,
      resourceTypes: [ResourceType.PREFAB],
    },

    // Data Pack Categories
    {
      name: 'Recipes & Crafting',
      slug: 'recipes-crafting',
      description: 'Custom recipes and crafting systems',
      icon: 'mdi:script-text',
      color: '#00B894',
      order: 23,
      resourceTypes: [ResourceType.DATA_PACK],
    },
    {
      name: 'Loot Tables',
      slug: 'loot-tables',
      description: 'Custom loot and drop tables',
      icon: 'mdi:treasure-chest',
      color: '#55EFC4',
      order: 24,
      resourceTypes: [ResourceType.DATA_PACK],
    },

    // Modpack Categories
    {
      name: 'Kitchen Sink',
      slug: 'kitchen-sink',
      description: 'Large modpacks with diverse content',
      icon: 'mdi:bookshelf',
      color: '#69a024',
      order: 25,
      resourceTypes: [ResourceType.MODPACK],
    },
    {
      name: 'Quest-Based',
      slug: 'quest-based',
      description: 'Progression-focused modpacks with quests',
      icon: 'mdi:book-open-page-variant',
      color: '#4ECDC4',
      order: 26,
      resourceTypes: [ResourceType.MODPACK],
    },
    {
      name: 'Lightweight',
      slug: 'lightweight',
      description: 'Performance-friendly modpacks',
      icon: 'mdi:lightning-bolt',
      color: '#FFE66D',
      order: 27,
      resourceTypes: [ResourceType.MODPACK],
    },

    // Tools & Scripts Categories
    {
      name: 'Development Tools',
      slug: 'development-tools',
      description: 'IDEs, editors, debuggers, and development utilities',
      icon: 'mdi:code-braces',
      color: '#636E72',
      order: 28,
      resourceTypes: [ResourceType.TOOLS_SCRIPTS],
    },
    {
      name: 'Build & Deployment',
      slug: 'build-deployment',
      description: 'Compilers, bundlers, build tools, and deployment utilities',
      icon: 'mdi:package-variant-closed',
      color: '#00B894',
      order: 29,
      resourceTypes: [ResourceType.TOOLS_SCRIPTS],
    },
    {
      name: 'Testing & Quality',
      slug: 'testing-quality',
      description: 'Unit testing, integration testing, and code quality tools',
      icon: 'mdi:test-tube',
      color: '#74B9FF',
      order: 30,
      resourceTypes: [ResourceType.TOOLS_SCRIPTS],
    },
    {
      name: 'Automation & Scripts',
      slug: 'automation-scripts',
      description: 'CI/CD, task automation, and workflow scripts',
      icon: 'mdi:robot',
      color: '#A29BFE',
      order: 31,
      resourceTypes: [ResourceType.TOOLS_SCRIPTS],
    },
    {
      name: 'Utilities & Converters',
      slug: 'utilities-converters',
      description: 'File management, conversion tools, and general utilities',
      icon: 'mdi:toolbox',
      color: '#FD79A8',
      order: 32,
      resourceTypes: [ResourceType.TOOLS_SCRIPTS],
    }
  ];

  for (const category of resourceCategories) {
    await prisma.resourceCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`✓ Seeded ${resourceCategories.length} resource categories`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });