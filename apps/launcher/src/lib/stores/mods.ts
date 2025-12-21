// Mods Store - Manages the mod registry and installations
import { writable, derived, get } from 'svelte/store';
import { type Mod, MOCK_MODS, MOD_CATEGORIES } from './mockData';
import { servers } from './servers';

function createModsStore() {
    const { subscribe, set, update } = writable<Mod[]>(MOCK_MODS);

    return {
        subscribe,

        // Get all mods
        getAll: () => get({ subscribe }),

        // Get a single mod by ID
        getById: (id: string): Mod | undefined => {
            return get({ subscribe }).find(m => m.id === id);
        },

        // Get mods by category
        getByCategory: (category: string): Mod[] => {
            const mods = get({ subscribe });
            if (category === 'all') return mods;
            return mods.filter(m => m.category === category);
        },

        // Search mods
        search: (query: string, filters?: {
            category?: string;
            version?: string;
            sortBy?: 'downloads' | 'updated' | 'name';
        }): Mod[] => {
            let mods = get({ subscribe });

            // Filter by search query
            if (query) {
                const q = query.toLowerCase();
                mods = mods.filter(m =>
                    m.name.toLowerCase().includes(q) ||
                    m.author.toLowerCase().includes(q) ||
                    m.description.toLowerCase().includes(q)
                );
            }

            // Filter by category
            if (filters?.category && filters.category !== 'all') {
                mods = mods.filter(m => m.category === filters.category);
            }

            // Filter by version compatibility
            if (filters?.version) {
                mods = mods.filter(m => m.compatibleVersions.includes(filters.version));
            }

            // Sort
            if (filters?.sortBy) {
                switch (filters.sortBy) {
                    case 'downloads':
                        mods.sort((a, b) => b.downloads - a.downloads);
                        break;
                    case 'updated':
                        mods.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
                        break;
                    case 'name':
                        mods.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                }
            }

            return mods;
        },

        // Get mods with available updates
        getWithUpdates: (): Mod[] => {
            return get({ subscribe }).filter(m => m.hasUpdate);
        },

        // Get dependencies for a mod (including transitive)
        getDependencies: (modId: string): Mod[] => {
            const mods = get({ subscribe });
            const mod = mods.find(m => m.id === modId);
            if (!mod) return [];

            const deps: Mod[] = [];
            const visited = new Set<string>();

            function collectDeps(id: string) {
                if (visited.has(id)) return;
                visited.add(id);

                const m = mods.find(mod => mod.id === id);
                if (!m) return;

                for (const depId of m.dependencies) {
                    collectDeps(depId);
                    const dep = mods.find(mod => mod.id === depId);
                    if (dep && !deps.includes(dep)) {
                        deps.push(dep);
                    }
                }
            }

            collectDeps(modId);
            return deps;
        },

        // Install mod on a server (with dependencies)
        installOnServer: (modId: string, serverId: string) => {
            const mods = get({ subscribe });
            const mod = mods.find(m => m.id === modId);
            if (!mod) return;

            // Get dependencies
            const deps: Mod[] = [];
            const visited = new Set<string>();

            function collectDeps(id: string) {
                if (visited.has(id)) return;
                visited.add(id);

                const m = mods.find(mod => mod.id === id);
                if (!m) return;

                for (const depId of m.dependencies) {
                    collectDeps(depId);
                    const dep = mods.find(mod => mod.id === depId);
                    if (dep) deps.push(dep);
                }
            }

            collectDeps(modId);

            // Install dependencies first, then the mod
            for (const dep of deps) {
                servers.installMod(serverId, dep.id);
            }
            servers.installMod(serverId, modId);
        },

        // Update mod (simulate)
        updateMod: (modId: string) => {
            update(mods => mods.map(m => {
                if (m.id !== modId) return m;
                return {
                    ...m,
                    hasUpdate: false,
                    version: incrementVersion(m.version),
                    updatedAt: new Date(),
                };
            }));
        },

        // Get mods installed on a specific server
        getInstalledOnServer: (serverId: string): Mod[] => {
            const allServers = get(servers);
            const server = allServers.find(s => s.id === serverId);
            if (!server) return [];

            const mods = get({ subscribe });
            return mods.filter(m => server.installedMods.includes(m.id));
        },

        // Check if mod is compatible with server version
        isCompatible: (modId: string, serverVersion: string): boolean => {
            const mod = get({ subscribe }).find(m => m.id === modId);
            if (!mod) return false;
            return mod.compatibleVersions.includes(serverVersion);
        },

        // Reset to default mods
        reset: () => set(MOCK_MODS),
    };
}

// Helper to increment version string
function incrementVersion(version: string): string {
    const parts = version.split('.');
    const last = parseInt(parts[parts.length - 1]) + 1;
    parts[parts.length - 1] = String(last);
    return parts.join('.');
}

export const mods = createModsStore();

// Export categories for UI
export const categories = MOD_CATEGORIES;

// Derived store for mods with updates count
export const modsWithUpdatesCount = derived(mods, $mods =>
    $mods.filter(m => m.hasUpdate).length
);
