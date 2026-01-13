import type { IModSource } from './mod-source.interface';
import type { Mod, ModDetails, ModFilters, InstalledMod } from '../types/mod';
import { OrbisModSource } from './sources/orbis-source';
import { CurseForgeModSource } from './sources/curseforge-source';

/**
 * Central mod manager service
 * Handles multiple mod sources and provides unified interface
 */
export class ModManager {
    private sources: Map<string, IModSource> = new Map();
    private activeSources: Set<string> = new Set();

    constructor() {
        // Register available mod sources
        this.registerSource(new OrbisModSource());
        this.registerSource(new CurseForgeModSource());

        // Enable Orbis by default
        this.activeSources.add('orbis');
    }

    /**
     * Register a new mod source
     */
    registerSource(source: IModSource): void {
        this.sources.set(source.name, source);
    }

    /**
     * Get all registered sources
     */
    getSources(): IModSource[] {
        return Array.from(this.sources.values());
    }

    /**
     * Get active sources
     */
    getActiveSources(): IModSource[] {
        return Array.from(this.activeSources)
            .map((name) => this.sources.get(name))
            .filter((source): source is IModSource => source !== undefined);
    }

    /**
     * Enable a mod source
     */
    enableSource(sourceName: string): void {
        if (this.sources.has(sourceName)) {
            this.activeSources.add(sourceName);
        }
    }

    /**
     * Disable a mod source
     */
    disableSource(sourceName: string): void {
        this.activeSources.delete(sourceName);
    }

    /**
     * Toggle a mod source
     */
    toggleSource(sourceName: string): void {
        if (this.activeSources.has(sourceName)) {
            this.disableSource(sourceName);
        } else {
            this.enableSource(sourceName);
        }
    }

    /**
     * Search mods across all active sources
     */
    async searchMods(filters?: ModFilters): Promise<Mod[]> {
        const activeSources = this.getActiveSources();

        // Search all active sources in parallel
        const results = await Promise.all(
            activeSources.map((source) => source.searchMods(filters))
        );

        // Flatten and combine results
        const allMods = results.flat();

        // Apply sorting if specified
        if (filters?.sortBy) {
            allMods.sort((a, b) => {
                const order = filters.sortOrder === 'desc' ? -1 : 1;

                switch (filters.sortBy) {
                    case 'downloads':
                        return (a.downloads - b.downloads) * order;
                    case 'name':
                        return a.name.localeCompare(b.name) * order;
                    case 'updated':
                        return (
                            (new Date(a.updatedAt || 0).getTime() -
                                new Date(b.updatedAt || 0).getTime()) *
                            order
                        );
                    case 'created':
                        return (
                            (new Date(a.createdAt || 0).getTime() -
                                new Date(b.createdAt || 0).getTime()) *
                            order
                        );
                    default:
                        return 0;
                }
            });
        }

        return allMods;
    }

    /**
     * Get mod details from specific source
     */
    async getModDetails(modId: string, sourceName: string): Promise<ModDetails> {
        const source = this.sources.get(sourceName);
        if (!source) {
            throw new Error(`Mod source '${sourceName}' not found`);
        }

        return source.getModDetails(modId);
    }

    /**
     * Download and install a mod to a specific save
     */
    async installMod(
        modId: string,
        sourceName: string,
        version: string,
        saveName: string
    ): Promise<void> {
        const source = this.sources.get(sourceName);
        if (!source) {
            throw new Error(`Mod source '${sourceName}' not found`);
        }

        // Import necessary Tauri functions
        const { join } = await import('@tauri-apps/api/path');
        const { exists, mkdir } = await import('@tauri-apps/plugin-fs');

        const modsPath = await join(saveName, 'mods'); // saveName here is actually the full path based on my saves.ts change

        if (!await exists(modsPath)) {
            await mkdir(modsPath, { recursive: true });
        }

        // TODO: Get actual filename from content-disposition if possible, or use modId-version.jar
        const fileName = `${modId}-${version}.jar`;
        const destination = await join(modsPath, fileName);

        await source.downloadMod(modId, version, destination);

        console.log(`Installed ${modId} version ${version} to ${destination}`);
        // TODO: Update installed mods metadata in save config

    }

    /**
     * Remove a mod from a save
     */
    async removeMod(modId: string, saveName: string): Promise<void> {
        // TODO: Implement mod removal via Tauri backend
        console.log(`Removing mod ${modId} from save ${saveName}`);
    }

    /**
     * Get installed mods for a specific save
     */
    async getInstalledMods(saveName: string): Promise<InstalledMod[]> {
        // TODO: Implement via Tauri backend
        return [];
    }
}

// Export singleton instance
export const modManager = new ModManager();
