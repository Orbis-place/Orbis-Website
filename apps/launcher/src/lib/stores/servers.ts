// Server Store - Manages Hytale server instances
import { writable, derived, get } from 'svelte/store';
import {
    type Server,
    type LogEntry,
    type Player,
    MOCK_SERVERS,
    SAMPLE_LOGS,
    PLAYER_NAMES,
    HYTALE_VERSIONS
} from './mockData';

// Create the main servers store
function createServersStore() {
    const { subscribe, set, update } = writable<Server[]>(MOCK_SERVERS);

    let logIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
    let logIdCounter = 0;

    // Generate a random log entry
    function generateLog(): Omit<LogEntry, 'id'> {
        const template = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)];
        let message = template.message
            .replace('{player}', PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)])
            .replace('{tps}', (19 + Math.random()).toFixed(1))
            .replace('{ms}', String(Math.floor(Math.random() * 500 + 100)))
            .replace('{item}', 'Diamond Sword')
            .replace('{admin}', 'Admin')
            .replace('{cmd}', '/give @a diamond 64');

        return {
            timestamp: new Date(),
            level: template.level,
            message,
        };
    }

    // Start log simulation for a server
    function startLogSimulation(serverId: string) {
        if (logIntervals.has(serverId)) return;

        const interval = setInterval(() => {
            update(servers => servers.map(s => {
                if (s.id !== serverId || s.status !== 'running') return s;

                const newLog: LogEntry = {
                    id: logIdCounter++,
                    ...generateLog(),
                };

                // Update stats with slight variations
                const newStats = {
                    ...s.stats,
                    cpu: Math.max(5, Math.min(80, s.stats.cpu + (Math.random() - 0.5) * 10)),
                    ram: Math.max(0.5, Math.min(s.stats.ramMax - 0.2, s.stats.ram + (Math.random() - 0.5) * 0.3)),
                    uptime: s.stats.uptime + 1,
                    tps: Math.max(15, Math.min(20, s.stats.tps + (Math.random() - 0.5) * 0.5)),
                };

                return {
                    ...s,
                    stats: newStats,
                    consoleLogs: [...s.consoleLogs.slice(-500), newLog],
                };
            }));
        }, 2000);

        logIntervals.set(serverId, interval);
    }

    // Stop log simulation
    function stopLogSimulation(serverId: string) {
        const interval = logIntervals.get(serverId);
        if (interval) {
            clearInterval(interval);
            logIntervals.delete(serverId);
        }
    }

    return {
        subscribe,

        // Get a single server
        getById: (id: string): Server | undefined => {
            return get({ subscribe }).find(s => s.id === id);
        },

        // Create a new server
        create: (config: {
            name: string;
            port: number;
            maxPlayers: number;
            motd: string;
            version: string;
            memory: number;
        }) => {
            const newServer: Server = {
                id: `srv-${Date.now()}`,
                name: config.name,
                port: config.port,
                maxPlayers: config.maxPlayers,
                motd: config.motd,
                version: config.version,
                status: 'stopped',
                installedMods: [],
                config: {
                    ...config,
                    autoRestart: false,
                    whitelistEnabled: false,
                },
                stats: {
                    cpu: 0,
                    ram: 0,
                    ramMax: config.memory,
                    uptime: 0,
                    tps: 0,
                },
                players: [],
                consoleLogs: [],
                createdAt: new Date(),
                lastStarted: null,
                totalPlaytime: 0,
            };

            update(servers => [...servers, newServer]);
            return newServer.id;
        },

        // Delete a server
        delete: (id: string) => {
            stopLogSimulation(id);
            update(servers => servers.filter(s => s.id !== id));
        },

        // Duplicate a server (create profile copy)
        duplicate: (id: string) => {
            const servers = get({ subscribe });
            const source = servers.find(s => s.id === id);
            if (!source) return null;

            const newServer: Server = {
                ...structuredClone(source),
                id: `srv-${Date.now()}`,
                name: `${source.name} (Copy)`,
                port: source.port + 1,
                status: 'stopped',
                players: [],
                consoleLogs: [],
                createdAt: new Date(),
                lastStarted: null,
                totalPlaytime: 0,
                stats: {
                    cpu: 0,
                    ram: 0,
                    ramMax: source.config.memory,
                    uptime: 0,
                    tps: 0,
                },
            };

            update(servers => [...servers, newServer]);
            return newServer.id;
        },

        // Update server config
        updateConfig: (id: string, config: Partial<Server['config']>) => {
            update(servers => servers.map(s => {
                if (s.id !== id) return s;
                return {
                    ...s,
                    ...config,
                    config: { ...s.config, ...config },
                };
            }));
        },

        // Start a server
        start: (id: string) => {
            update(servers => servers.map(s => {
                if (s.id !== id || s.status !== 'stopped') return s;
                return {
                    ...s,
                    status: 'starting',
                    consoleLogs: [{
                        id: logIdCounter++,
                        timestamp: new Date(),
                        level: 'info',
                        message: '[Server] Starting server...',
                    }],
                };
            }));

            // Simulate startup delay
            setTimeout(() => {
                update(servers => servers.map(s => {
                    if (s.id !== id || s.status !== 'starting') return s;

                    startLogSimulation(id);

                    return {
                        ...s,
                        status: 'running',
                        lastStarted: new Date(),
                        stats: {
                            ...s.stats,
                            cpu: 15,
                            ram: s.config.memory * 0.3,
                            uptime: 0,
                            tps: 20,
                        },
                        consoleLogs: [
                            ...s.consoleLogs,
                            {
                                id: logIdCounter++,
                                timestamp: new Date(),
                                level: 'info' as const,
                                message: '[Server] Loading world...',
                            },
                            {
                                id: logIdCounter++,
                                timestamp: new Date(),
                                level: 'info' as const,
                                message: '[Server] Done! Server is ready.',
                            },
                        ],
                    };
                }));
            }, 2000);
        },

        // Stop a server
        stop: (id: string) => {
            stopLogSimulation(id);

            update(servers => servers.map(s => {
                if (s.id !== id || s.status !== 'running') return s;
                return {
                    ...s,
                    status: 'stopping',
                    consoleLogs: [
                        ...s.consoleLogs,
                        {
                            id: logIdCounter++,
                            timestamp: new Date(),
                            level: 'info' as const,
                            message: '[Server] Stopping server...',
                        },
                    ],
                };
            }));

            setTimeout(() => {
                update(servers => servers.map(s => {
                    if (s.id !== id || s.status !== 'stopping') return s;
                    return {
                        ...s,
                        status: 'stopped',
                        players: [],
                        stats: {
                            ...s.stats,
                            cpu: 0,
                            ram: 0,
                            uptime: 0,
                            tps: 0,
                        },
                        consoleLogs: [
                            ...s.consoleLogs,
                            {
                                id: logIdCounter++,
                                timestamp: new Date(),
                                level: 'info' as const,
                                message: '[Server] Server stopped.',
                            },
                        ],
                    };
                }));
            }, 1500);
        },

        // Restart a server
        restart: (id: string) => {
            const servers = get({ subscribe });
            const server = servers.find(s => s.id === id);
            if (!server || server.status !== 'running') return;

            // Stop first, then start
            stopLogSimulation(id);

            update(servers => servers.map(s => {
                if (s.id !== id) return s;
                return {
                    ...s,
                    status: 'stopping',
                    consoleLogs: [
                        ...s.consoleLogs,
                        {
                            id: logIdCounter++,
                            timestamp: new Date(),
                            level: 'info' as const,
                            message: '[Server] Restarting server...',
                        },
                    ],
                };
            }));

            setTimeout(() => {
                update(servers => servers.map(s => {
                    if (s.id !== id) return s;
                    startLogSimulation(id);
                    return {
                        ...s,
                        status: 'running',
                        lastStarted: new Date(),
                        stats: {
                            ...s.stats,
                            cpu: 15,
                            ram: s.config.memory * 0.3,
                            uptime: 0,
                            tps: 20,
                        },
                        consoleLogs: [
                            ...s.consoleLogs,
                            {
                                id: logIdCounter++,
                                timestamp: new Date(),
                                level: 'info' as const,
                                message: '[Server] Server restarted successfully.',
                            },
                        ],
                    };
                }));
            }, 2000);
        },

        // Send command to server console
        sendCommand: (id: string, command: string) => {
            update(servers => servers.map(s => {
                if (s.id !== id || s.status !== 'running') return s;
                return {
                    ...s,
                    consoleLogs: [
                        ...s.consoleLogs,
                        {
                            id: logIdCounter++,
                            timestamp: new Date(),
                            level: 'info' as const,
                            message: `> ${command}`,
                        },
                        {
                            id: logIdCounter++,
                            timestamp: new Date(),
                            level: 'info' as const,
                            message: `[Server] Command executed: ${command}`,
                        },
                    ],
                };
            }));
        },

        // Clear console logs
        clearLogs: (id: string) => {
            update(servers => servers.map(s => {
                if (s.id !== id) return s;
                return { ...s, consoleLogs: [] };
            }));
        },

        // Install a mod
        installMod: (serverId: string, modId: string) => {
            update(servers => servers.map(s => {
                if (s.id !== serverId) return s;
                if (s.installedMods.includes(modId)) return s;
                return { ...s, installedMods: [...s.installedMods, modId] };
            }));
        },

        // Uninstall a mod
        uninstallMod: (serverId: string, modId: string) => {
            update(servers => servers.map(s => {
                if (s.id !== serverId) return s;
                return { ...s, installedMods: s.installedMods.filter(m => m !== modId) };
            }));
        },

        // Simulate player join (for demo)
        simulatePlayerJoin: (serverId: string) => {
            update(servers => servers.map(s => {
                if (s.id !== serverId || s.status !== 'running') return s;
                if (s.players.length >= s.maxPlayers) return s;

                const newPlayer: Player = {
                    id: `p-${Date.now()}`,
                    username: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
                    avatar: '',
                    joinedAt: new Date(),
                    isOnline: true,
                };

                return {
                    ...s,
                    players: [...s.players, newPlayer],
                    consoleLogs: [
                        ...s.consoleLogs,
                        {
                            id: logIdCounter++,
                            timestamp: new Date(),
                            level: 'info' as const,
                            message: `[Server] ${newPlayer.username} joined the game`,
                        },
                    ],
                };
            }));
        },

        // Reset all servers
        reset: () => {
            logIntervals.forEach(interval => clearInterval(interval));
            logIntervals.clear();
            set(MOCK_SERVERS);
        },
    };
}

export const servers = createServersStore();

// Derived stores
export const runningServers = derived(servers, $servers =>
    $servers.filter(s => s.status === 'running')
);

export const runningCount = derived(runningServers, $running => $running.length);

export const totalPlayers = derived(servers, $servers =>
    $servers.reduce((sum, s) => sum + s.players.length, 0)
);
