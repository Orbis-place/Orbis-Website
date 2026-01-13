import type { IModSource } from './mod-source.interface';
import type { Mod, ModDetails, ModFilters } from '../types/mod';
import type { InstalledMod } from '../types/installed-mod';
import { OrbisModSource } from './sources/orbis-source';

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
        savePath: string
    ): Promise<void> {
        const source = this.sources.get(sourceName);
        if (!source) {
            throw new Error(`Mod source '${sourceName}' not found`);
        }

        // Import necessary Tauri functions
        const { join } = await import('@tauri-apps/api/path');
        const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
        const { invoke } = await import('@tauri-apps/api/core');

        const modsPath = await join(savePath, 'mods');

        if (!await exists(modsPath)) {
            await mkdir(modsPath, { recursive: true });
        }

        // Get the real filename by checking the headers
        let fileName = `${modId}-${version}.jar`; // Fallback
        try {
            // We need to find the download URL first
            const versions = await source.getModVersions(modId);
            const targetVersion = versions.find(v => v.version === version);

            if (targetVersion) {
                const { fetch } = await import('@tauri-apps/plugin-http');
                console.log(`[ModManager] Checking headers for ${targetVersion.downloadUrl}`);

                const response = await fetch(targetVersion.downloadUrl, { method: 'HEAD' });

                // Try to get from Content-Disposition
                const disposition = response.headers.get('content-disposition');
                if (disposition) {
                    const match = disposition.match(/filename="?([^"]+)"?/);
                    if (match && match[1]) {
                        fileName = match[1];
                        console.log(`[ModManager] Resolved filename from headers: ${fileName}`);
                    }
                } else if (response.url) {
                    // Try to get from final URL (handling redirects)
                    const urlParts = response.url.split('/');
                    const lastPart = urlParts[urlParts.length - 1];
                    if (lastPart && lastPart.endsWith('.jar')) {
                        fileName = decodeURIComponent(lastPart);
                        console.log(`[ModManager] Resolved filename from URL: ${fileName}`);
                    }
                }
            }
        } catch (error) {
            console.warn('[ModManager] Failed to resolve real filename, using fallback:', error);
        }

        const destination = await join(modsPath, fileName);

        await source.downloadMod(modId, version, destination);

        // Also copy to global mods folder (UserData/Mods)
        console.log('[ModManager] === Starting global mods folder copy ===');
        try {
            const { copyFile } = await import('@tauri-apps/plugin-fs');
            const { get } = await import('svelte/store');

            console.log('[ModManager] Imported fs and store utilities');

            // Dynamic import of settings to avoid initialization issues
            const { settings } = await import('../stores/settings');
            console.log('[ModManager] Imported settings store');

            // Ensure settings loaded
            let hytaleRoot = get(settings).hytaleRoot;
            console.log(`[ModManager] Initial hytaleRoot: "${hytaleRoot}"`);

            if (!hytaleRoot) {
                console.log('[ModManager] hytaleRoot is empty, loading settings...');
                await settings.load();
                hytaleRoot = get(settings).hytaleRoot;
                console.log(`[ModManager] After loading, hytaleRoot: "${hytaleRoot}"`);
            }

            if (!hytaleRoot) {
                throw new Error('hytaleRoot is still empty after loading settings');
            }

            const userDataDir = await join(hytaleRoot, 'UserData');
            console.log(`[ModManager] UserData directory: "${userDataDir}"`);

            const globalModsDir = await join(userDataDir, 'Mods');
            console.log(`[ModManager] Global Mods directory: "${globalModsDir}"`);

            const globalModsDirExists = await exists(globalModsDir);
            console.log(`[ModManager] Global Mods directory exists: ${globalModsDirExists}`);

            if (!globalModsDirExists) {
                console.log('[ModManager] Creating global Mods directory...');
                await mkdir(globalModsDir, { recursive: true });
                console.log('[ModManager] Global Mods directory created successfully');
            }

            const globalDestination = await join(globalModsDir, fileName);
            console.log(`[ModManager] Source: "${destination}"`);
            console.log(`[ModManager] Destination: "${globalDestination}"`);
            console.log('[ModManager] Starting file copy...');

            await copyFile(destination, globalDestination);
            console.log('[ModManager] ✅ File copied successfully to global Mods folder!');
        } catch (error) {
            console.error('[ModManager] ❌ Failed to copy mod to global Mods folder:', error);
            console.error('[ModManager] Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            // Don't fail the whole installation, just log
        }
        console.log('[ModManager] === End global mods folder copy ===');

        // Extract manifest from the downloaded jar and add to config.json
        try {
            console.log(`[ModManager] Registering installed jar: ${fileName}`);
            await invoke('register_jar_in_config', {
                savePath,
                jarFilename: fileName
            });
            console.log(`[ModManager] Successfully registered ${fileName} in config.json`);
        } catch (error) {
            console.error('[ModManager] Failed to register mod in config.json:', error);
            // Don't fail the installation, just log the error
        }

        console.log(`Installed ${modId} version ${version} to ${destination}`);
    }

    /**
     * Remove a mod from a save
     */
    async removeMod(modId: string, savePath: string): Promise<void> {
        // TODO: Implement mod removal via Tauri backend
        console.log(`Removing mod ${modId} from save ${savePath}`);
    }

    /**
     * Get installed mods for a specific save
     */
    async getInstalledMods(savePath: string): Promise<InstalledMod[]> {
        const { invoke } = await import('@tauri-apps/api/core');

        try {
            const mods = await invoke<InstalledMod[]>('get_installed_mods', { savePath });
            return mods;
        } catch (error) {
            console.error('[ModManager] Failed to get installed mods:', error);
            return [];
        }
    }
}

// Export singleton instance
export const modManager = new ModManager();
