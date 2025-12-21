// Mock Data for Orbis Hytale Server Launcher
// All data is simulated in-memory since we don't have the actual server binary

export interface Player {
    id: string;
    username: string;
    avatar: string;
    joinedAt: Date;
    isOnline: boolean;
}

export interface LogEntry {
    id: number;
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
}

export interface ServerConfig {
    name: string;
    port: number;
    maxPlayers: number;
    motd: string;
    version: string;
    memory: number; // in GB
    autoRestart: boolean;
    whitelistEnabled: boolean;
}

export interface Server {
    id: string;
    name: string;
    port: number;
    maxPlayers: number;
    motd: string;
    version: string;
    status: 'stopped' | 'starting' | 'running' | 'stopping';
    installedMods: string[];
    config: ServerConfig;
    stats: {
        cpu: number;
        ram: number;
        ramMax: number;
        uptime: number;
        tps: number;
    };
    players: Player[];
    consoleLogs: LogEntry[];
    createdAt: Date;
    lastStarted: Date | null;
    totalPlaytime: number; // in seconds
}

export interface Mod {
    id: string;
    name: string;
    slug: string;
    author: string;
    description: string;
    category: string;
    icon: string;
    downloads: number;
    likes: number;
    version: string;
    compatibleVersions: string[];
    dependencies: string[];
    hasUpdate: boolean;
    updatedAt: Date;
    size: string;
}

export interface Backup {
    id: string;
    serverId: string;
    name: string;
    createdAt: Date;
    size: string;
    type: 'full' | 'worlds' | 'config';
}

export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    modifiedAt?: Date;
    children?: FileNode[];
    content?: string;
}

export interface SessionRecord {
    id: string;
    serverId: string;
    startedAt: Date;
    endedAt: Date;
    peakPlayers: number;
    events: { time: Date; type: string; message: string }[];
}

// Available Hytale versions
export const HYTALE_VERSIONS = [
    '1.0.0-beta.5',
    '1.0.0-beta.4',
    '1.0.0-beta.3',
    '1.0.0-beta.2',
    '1.0.0-beta.1',
];

// Mod categories
export const MOD_CATEGORIES = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'gameplay', label: 'Gameplay', icon: 'gamepad' },
    { id: 'performance', label: 'Performance', icon: 'zap' },
    { id: 'admin', label: 'Administration', icon: 'shield' },
    { id: 'building', label: 'Building', icon: 'hammer' },
    { id: 'utility', label: 'Utility', icon: 'wrench' },
    { id: 'social', label: 'Social', icon: 'users' },
    { id: 'economy', label: 'Economy', icon: 'coins' },
];

// Mock servers
export const MOCK_SERVERS: Server[] = [
    {
        id: 'srv-1',
        name: 'Orbis Survival',
        port: 25565,
        maxPlayers: 50,
        motd: '§6Welcome to Orbis Survival! §7- §aEnjoy your stay',
        version: '1.0.0-beta.5',
        status: 'running',
        installedMods: ['mod-1', 'mod-2', 'mod-5'],
        config: {
            name: 'Orbis Survival',
            port: 25565,
            maxPlayers: 50,
            motd: '§6Welcome to Orbis Survival! §7- §aEnjoy your stay',
            version: '1.0.0-beta.5',
            memory: 4,
            autoRestart: true,
            whitelistEnabled: false,
        },
        stats: {
            cpu: 23,
            ram: 2.4,
            ramMax: 4,
            uptime: 86400,
            tps: 19.8,
        },
        players: [
            { id: 'p1', username: 'SkyBuilder', avatar: '', joinedAt: new Date(Date.now() - 3600000), isOnline: true },
            { id: 'p2', username: 'DragonSlayer', avatar: '', joinedAt: new Date(Date.now() - 7200000), isOnline: true },
            { id: 'p3', username: 'CraftMaster', avatar: '', joinedAt: new Date(Date.now() - 1800000), isOnline: true },
        ],
        consoleLogs: [],
        createdAt: new Date(Date.now() - 30 * 24 * 3600000),
        lastStarted: new Date(Date.now() - 86400000),
        totalPlaytime: 432000,
    },
    {
        id: 'srv-2',
        name: 'Creative Build',
        port: 25566,
        maxPlayers: 20,
        motd: '§bCreative Mode §7| §eBuild anything!',
        version: '1.0.0-beta.5',
        status: 'stopped',
        installedMods: ['mod-3', 'mod-4'],
        config: {
            name: 'Creative Build',
            port: 25566,
            maxPlayers: 20,
            motd: '§bCreative Mode §7| §eBuild anything!',
            version: '1.0.0-beta.5',
            memory: 2,
            autoRestart: false,
            whitelistEnabled: true,
        },
        stats: {
            cpu: 0,
            ram: 0,
            ramMax: 2,
            uptime: 0,
            tps: 0,
        },
        players: [],
        consoleLogs: [],
        createdAt: new Date(Date.now() - 14 * 24 * 3600000),
        lastStarted: new Date(Date.now() - 3 * 24 * 3600000),
        totalPlaytime: 72000,
    },
    {
        id: 'srv-3',
        name: 'PvP Arena',
        port: 25567,
        maxPlayers: 100,
        motd: '§c⚔ PvP Arena ⚔ §7| §fFight to the death!',
        version: '1.0.0-beta.4',
        status: 'stopped',
        installedMods: ['mod-1', 'mod-6'],
        config: {
            name: 'PvP Arena',
            port: 25567,
            maxPlayers: 100,
            motd: '§c⚔ PvP Arena ⚔ §7| §fFight to the death!',
            version: '1.0.0-beta.4',
            memory: 6,
            autoRestart: true,
            whitelistEnabled: false,
        },
        stats: {
            cpu: 0,
            ram: 0,
            ramMax: 6,
            uptime: 0,
            tps: 0,
        },
        players: [],
        consoleLogs: [],
        createdAt: new Date(Date.now() - 7 * 24 * 3600000),
        lastStarted: null,
        totalPlaytime: 0,
    },
];

// Mock mods
export const MOCK_MODS: Mod[] = [
    {
        id: 'mod-1',
        name: 'HytalePlus',
        slug: 'hytaleplus',
        author: 'OrbisTeam',
        description: 'Essential server optimization mod. Dramatically improves TPS and reduces lag for a smoother gameplay experience.',
        category: 'performance',
        icon: '',
        downloads: 125000,
        likes: 8500,
        version: '2.1.0',
        compatibleVersions: ['1.0.0-beta.5', '1.0.0-beta.4'],
        dependencies: [],
        hasUpdate: false,
        updatedAt: new Date(Date.now() - 2 * 24 * 3600000),
        size: '2.4 MB',
    },
    {
        id: 'mod-2',
        name: 'EconomyCore',
        slug: 'economycore',
        author: 'TradeGuild',
        description: 'Complete economy system with shops, trading, and currency management. Perfect for survival servers.',
        category: 'economy',
        icon: '',
        downloads: 89000,
        likes: 5200,
        version: '1.5.3',
        compatibleVersions: ['1.0.0-beta.5'],
        dependencies: ['mod-1'],
        hasUpdate: true,
        updatedAt: new Date(Date.now() - 7 * 24 * 3600000),
        size: '1.8 MB',
    },
    {
        id: 'mod-3',
        name: 'WorldEdit Pro',
        slug: 'worldedit-pro',
        author: 'BuildersPro',
        description: 'Advanced world editing tools for builders. Create stunning structures with ease.',
        category: 'building',
        icon: '',
        downloads: 210000,
        likes: 12000,
        version: '3.0.1',
        compatibleVersions: ['1.0.0-beta.5', '1.0.0-beta.4', '1.0.0-beta.3'],
        dependencies: [],
        hasUpdate: false,
        updatedAt: new Date(Date.now() - 14 * 24 * 3600000),
        size: '5.2 MB',
    },
    {
        id: 'mod-4',
        name: 'SchematicLib',
        slug: 'schematiclib',
        author: 'BuildersPro',
        description: 'Load and save schematics. Required by many building mods.',
        category: 'utility',
        icon: '',
        downloads: 156000,
        likes: 4800,
        version: '1.2.0',
        compatibleVersions: ['1.0.0-beta.5', '1.0.0-beta.4'],
        dependencies: [],
        hasUpdate: false,
        updatedAt: new Date(Date.now() - 30 * 24 * 3600000),
        size: '850 KB',
    },
    {
        id: 'mod-5',
        name: 'AdminTools',
        slug: 'admintools',
        author: 'ServerOps',
        description: 'Complete administration toolkit with moderation commands, logging, and player management.',
        category: 'admin',
        icon: '',
        downloads: 178000,
        likes: 9800,
        version: '4.2.1',
        compatibleVersions: ['1.0.0-beta.5'],
        dependencies: [],
        hasUpdate: false,
        updatedAt: new Date(Date.now() - 5 * 24 * 3600000),
        size: '3.1 MB',
    },
    {
        id: 'mod-6',
        name: 'CombatPlus',
        slug: 'combatplus',
        author: 'PvPMasters',
        description: 'Enhanced combat mechanics with combos, special attacks, and balanced PvP.',
        category: 'gameplay',
        icon: '',
        downloads: 67000,
        likes: 4200,
        version: '1.8.0',
        compatibleVersions: ['1.0.0-beta.5', '1.0.0-beta.4'],
        dependencies: ['mod-1'],
        hasUpdate: true,
        updatedAt: new Date(Date.now() - 3 * 24 * 3600000),
        size: '1.5 MB',
    },
    {
        id: 'mod-7',
        name: 'ChatManager',
        slug: 'chatmanager',
        author: 'SocialPlugins',
        description: 'Advanced chat system with channels, formatting, mentions, and emoji support.',
        category: 'social',
        icon: '',
        downloads: 92000,
        likes: 5100,
        version: '2.0.4',
        compatibleVersions: ['1.0.0-beta.5'],
        dependencies: [],
        hasUpdate: false,
        updatedAt: new Date(Date.now() - 10 * 24 * 3600000),
        size: '920 KB',
    },
    {
        id: 'mod-8',
        name: 'QuestEngine',
        slug: 'questengine',
        author: 'RPGCraft',
        description: 'Create custom quests and storylines for your server. Includes GUI editor and rewards system.',
        category: 'gameplay',
        icon: '',
        downloads: 45000,
        likes: 3800,
        version: '1.3.2',
        compatibleVersions: ['1.0.0-beta.5'],
        dependencies: ['mod-5'],
        hasUpdate: false,
        updatedAt: new Date(Date.now() - 21 * 24 * 3600000),
        size: '4.7 MB',
    },
];

// Mock backups
export const MOCK_BACKUPS: Backup[] = [
    {
        id: 'bkp-1',
        serverId: 'srv-1',
        name: 'Full Backup - Dec 20',
        createdAt: new Date(Date.now() - 24 * 3600000),
        size: '1.2 GB',
        type: 'full',
    },
    {
        id: 'bkp-2',
        serverId: 'srv-1',
        name: 'World Backup - Dec 19',
        createdAt: new Date(Date.now() - 2 * 24 * 3600000),
        size: '850 MB',
        type: 'worlds',
    },
    {
        id: 'bkp-3',
        serverId: 'srv-2',
        name: 'Config Backup - Dec 18',
        createdAt: new Date(Date.now() - 3 * 24 * 3600000),
        size: '12 KB',
        type: 'config',
    },
];

// Mock file system
export const MOCK_FILES: Record<string, FileNode> = {
    'srv-1': {
        name: 'Orbis Survival',
        path: '/',
        type: 'directory',
        children: [
            {
                name: 'config',
                path: '/config',
                type: 'directory',
                children: [
                    {
                        name: 'server.yml',
                        path: '/config/server.yml',
                        type: 'file',
                        size: 2048,
                        modifiedAt: new Date(),
                        content: `# Server Configuration
server:
  name: "Orbis Survival"
  port: 25565
  max-players: 50
  motd: "§6Welcome to Orbis Survival!"

performance:
  view-distance: 10
  simulation-distance: 8
  max-tick-time: 60000

security:
  whitelist: false
  online-mode: true
  enforce-secure-profile: true
`,
                    },
                    {
                        name: 'economy.yml',
                        path: '/config/economy.yml',
                        type: 'file',
                        size: 1024,
                        modifiedAt: new Date(),
                        content: `# Economy Configuration
currency:
  name: "Coins"
  symbol: "©"
  starting-balance: 100

shops:
  enabled: true
  tax-rate: 0.05

trading:
  enabled: true
  max-distance: 10
`,
                    },
                ],
            },
            {
                name: 'worlds',
                path: '/worlds',
                type: 'directory',
                children: [
                    { name: 'world', path: '/worlds/world', type: 'directory', children: [] },
                    { name: 'world_nether', path: '/worlds/world_nether', type: 'directory', children: [] },
                ],
            },
            {
                name: 'mods',
                path: '/mods',
                type: 'directory',
                children: [
                    { name: 'HytalePlus-2.1.0.jar', path: '/mods/HytalePlus-2.1.0.jar', type: 'file', size: 2516582 },
                    { name: 'EconomyCore-1.5.3.jar', path: '/mods/EconomyCore-1.5.3.jar', type: 'file', size: 1887436 },
                    { name: 'AdminTools-4.2.1.jar', path: '/mods/AdminTools-4.2.1.jar', type: 'file', size: 3250585 },
                ],
            },
            {
                name: 'logs',
                path: '/logs',
                type: 'directory',
                children: [
                    { name: 'latest.log', path: '/logs/latest.log', type: 'file', size: 524288 },
                    { name: '2024-12-20.log.gz', path: '/logs/2024-12-20.log.gz', type: 'file', size: 102400 },
                ],
            },
        ],
    },
};

// Mock session history
export const MOCK_SESSIONS: SessionRecord[] = [
    {
        id: 'sess-1',
        serverId: 'srv-1',
        startedAt: new Date(Date.now() - 2 * 24 * 3600000),
        endedAt: new Date(Date.now() - 2 * 24 * 3600000 + 8 * 3600000),
        peakPlayers: 12,
        events: [
            { time: new Date(Date.now() - 2 * 24 * 3600000), type: 'start', message: 'Server started' },
            { time: new Date(Date.now() - 2 * 24 * 3600000 + 3600000), type: 'player', message: 'Peak players: 12' },
            { time: new Date(Date.now() - 2 * 24 * 3600000 + 8 * 3600000), type: 'stop', message: 'Server stopped' },
        ],
    },
    {
        id: 'sess-2',
        serverId: 'srv-1',
        startedAt: new Date(Date.now() - 24 * 3600000),
        endedAt: new Date(Date.now()),
        peakPlayers: 8,
        events: [
            { time: new Date(Date.now() - 24 * 3600000), type: 'start', message: 'Server started' },
        ],
    },
];

// Sample console logs for simulation
export const SAMPLE_LOGS = [
    { level: 'info' as const, message: '[Server] Player {player} joined the game' },
    { level: 'info' as const, message: '[Server] Player {player} left the game' },
    { level: 'info' as const, message: '[HytalePlus] TPS: {tps}' },
    { level: 'info' as const, message: '[EconomyCore] Transaction completed: {player} bought {item}' },
    { level: 'warn' as const, message: '[Server] Can\'t keep up! Running {ms}ms behind' },
    { level: 'debug' as const, message: '[Server] Autosaving world...' },
    { level: 'info' as const, message: '[AdminTools] {admin} executed command: {cmd}' },
    { level: 'error' as const, message: '[Server] Exception in tick loop' },
];

export const PLAYER_NAMES = [
    'SkyBuilder', 'DragonSlayer', 'CraftMaster', 'NightWalker',
    'StarGazer', 'MoonRider', 'SunChaser', 'StormBringer',
    'IceQueen', 'FireLord', 'EarthShaker', 'WindRunner',
];
