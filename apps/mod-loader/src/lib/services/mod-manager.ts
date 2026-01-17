import type { IModSource } from './mod-source.interface';
import type { Mod, ModDetails, ModFilters, OrbisMetadataFile, OrbisModMetadata } from '../types/mod';
import type { InstalledMod } from '../types/installed-mod';
import { OrbisModSource } from './sources/orbis-source';

/**
 * Save Orbis metadata for an installed mod
 */
async function saveOrbisMetadata(
    modsPath: string,
    fileName: string,
    mod: Mod,
    version: string
): Promise<void> {
    const { join } = await import('@tauri-apps/api/path');
    const { exists, readTextFile, writeTextFile } = await import('@tauri-apps/plugin-fs');

    const metadataPath = await join(modsPath, 'orbis-metadata.json');

    let metadata: OrbisMetadataFile = {};

    // Read existing metadata if exists
    if (await exists(metadataPath)) {
        try {
            const content = await readTextFile(metadataPath);
            metadata = JSON.parse(content);
        } catch (error) {
            console.warn('[ModManager] Failed to read existing orbis-metadata.json:', error);
        }
    }

    // Add/update entry for this mod
    const entry: OrbisModMetadata = {
        id: mod.id,
        name: mod.name,
        author: mod.author,
        iconUrl: mod.icon,
        version: version,
        installedAt: new Date().toISOString(),
    };

    console.log(`[ModManager] Saving metadata for ${fileName}:`, {
        id: mod.id,
        name: mod.name,
        author: mod.author,
        icon: mod.icon,
        version: version
    });

    metadata[fileName] = entry;

    // Write back
    await writeTextFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`[ModManager] ✅ Saved Orbis metadata to: ${metadataPath}`);
}

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
        mod: Mod,
        savePath: string
    ): Promise<void> {
        const source = this.sources.get(mod.source);
        if (!source) {
            throw new Error(`Mod source '${mod.source}' not found`);
        }

        // Import necessary Tauri functions
        const { join } = await import('@tauri-apps/api/path');
        const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
        const { invoke } = await import('@tauri-apps/api/core');
        const { get } = await import('svelte/store');
        const { settings } = await import('../stores/settings');

        // Dynamic import of settings to avoid initialization issues
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
        const globalModsDir = await join(userDataDir, 'Mods');

        if (!await exists(globalModsDir)) {
            await mkdir(globalModsDir, { recursive: true });
        }

        // Get the real filename by checking the headers
        let fileName = `${mod.id}-${mod.version}.jar`; // Fallback
        try {
            // We need to find the download URL first
            const versions = await source.getModVersions(mod.id);
            const targetVersion = versions.find(v => v.version === mod.version);

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

        const globalDestination = await join(globalModsDir, fileName);

        // Download to GLOBAL mods folder
        await source.downloadMod(mod.id, mod.version, globalDestination);

        // Save Orbis metadata to global mods folder as well
        if (mod.source === 'orbis') {
            try {
                await saveOrbisMetadata(globalModsDir, fileName, mod, mod.version);
                console.log('[ModManager] ✅ Saved Orbis metadata to global Mods folder');
            } catch (metaError) {
                console.warn('[ModManager] Failed to save global Orbis metadata:', metaError);
            }
        }

        // Register in config.json using the global JAR
        try {
            console.log(`[ModManager] Registering installed global jar: ${fileName}`);
            await invoke('register_jar_in_config', {
                savePath,
                jarFilename: fileName,
                hytaleRoot // Pass hytaleRoot so backend can find it in global mods
            });
            console.log(`[ModManager] Successfully registered ${fileName} in config.json`);
        } catch (error) {
            console.error('[ModManager] Failed to register mod in config.json:', error);
            // Don't fail the installation, just log the error
        }

        console.log(`Installed ${mod.id} version ${mod.version} to ${globalDestination} and linked to save.`);
    }

    /**
     * Install a mod to global mods folder only (not to a specific save)
     */
    async installModGlobal(mod: Mod): Promise<void> {
        const source = this.sources.get(mod.source);
        if (!source) {
            throw new Error(`Mod source '${mod.source}' not found`);
        }

        const { join } = await import('@tauri-apps/api/path');
        const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
        const { get } = await import('svelte/store');
        const { settings } = await import('../stores/settings');

        // Get hytale root
        let hytaleRoot = get(settings).hytaleRoot;
        if (!hytaleRoot) {
            await settings.load();
            hytaleRoot = get(settings).hytaleRoot;
        }
        if (!hytaleRoot) {
            throw new Error('Hytale root not configured');
        }

        const globalModsDir = await join(hytaleRoot, 'UserData', 'Mods');

        if (!await exists(globalModsDir)) {
            await mkdir(globalModsDir, { recursive: true });
        }

        // Get the real filename by checking the headers
        let fileName = `${mod.id}-${mod.version}.jar`;
        try {
            const versions = await source.getModVersions(mod.id);
            const targetVersion = versions.find(v => v.version === mod.version);

            if (targetVersion) {
                const { fetch } = await import('@tauri-apps/plugin-http');
                const response = await fetch(targetVersion.downloadUrl, { method: 'HEAD' });

                const disposition = response.headers.get('content-disposition');
                if (disposition) {
                    const match = disposition.match(/filename="?([^"]+)"?/);
                    if (match && match[1]) {
                        fileName = match[1];
                    }
                } else if (response.url) {
                    const urlParts = response.url.split('/');
                    const lastPart = urlParts[urlParts.length - 1];
                    if (lastPart && lastPart.endsWith('.jar')) {
                        fileName = decodeURIComponent(lastPart);
                    }
                }
            }
        } catch (error) {
            console.warn('[ModManager] Failed to resolve real filename, using fallback:', error);
        }

        const destination = await join(globalModsDir, fileName);

        await source.downloadMod(mod.id, mod.version, destination);

        // Save Orbis metadata
        if (mod.source === 'orbis') {
            try {
                await saveOrbisMetadata(globalModsDir, fileName, mod, mod.version);
                console.log('[ModManager] ✅ Saved Orbis metadata to global Mods folder');
            } catch (error) {
                console.warn('[ModManager] Failed to save Orbis metadata:', error);
            }
        }

        console.log(`Installed ${mod.id} version ${mod.version} to global mods: ${destination}`);
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
        const { get } = await import('svelte/store');
        const { settings } = await import('../stores/settings');

        try {
            // Get hytale root
            let hytaleRoot = get(settings).hytaleRoot;
            if (!hytaleRoot) {
                await settings.load();
                hytaleRoot = get(settings).hytaleRoot;
            }
            if (!hytaleRoot) {
                console.error('[ModManager] Hytale root not configured');
                return [];
            }

            const mods = await invoke<InstalledMod[]>('get_installed_mods', { savePath, hytaleRoot });
            return mods;
        } catch (error) {
            console.error('[ModManager] Failed to get installed mods:', error);
            return [];
        }
    }

    /**
     * Install a modpack to a specific save
     * Downloads the modpack zip, then extracts:
     * - Mods/ contents to UserData/Mods
     * - Configs/*.zip contents to save_path/mods
     */
    async installModpack(mod: Mod, savePath: string): Promise<void> {
        const source = this.sources.get(mod.source);
        if (!source) {
            throw new Error(`Mod source '${mod.source}' not found`);
        }

        const { join } = await import('@tauri-apps/api/path');
        const { tempDir } = await import('@tauri-apps/api/path');
        const { invoke } = await import('@tauri-apps/api/core');
        const { get } = await import('svelte/store');
        const { settings } = await import('../stores/settings');

        // Get hytale root
        let hytaleRoot = get(settings).hytaleRoot;
        if (!hytaleRoot) {
            await settings.load();
            hytaleRoot = get(settings).hytaleRoot;
        }
        if (!hytaleRoot) {
            throw new Error('Hytale root not configured');
        }

        // Get the download URL and filename
        const versions = await source.getModVersions(mod.id);
        const targetVersion = versions.find(v => v.version === mod.version);
        if (!targetVersion) {
            throw new Error(`Version ${mod.version} not found for modpack ${mod.name}`);
        }

        // Generate temp file path for the modpack
        const tempDirectory = await tempDir();
        const fileName = `${mod.id}-${mod.version}.zip`;
        const tempFilePath = await join(tempDirectory, fileName);

        console.log(`[ModManager] Downloading modpack to ${tempFilePath}`);

        // Download the modpack zip to temp
        await source.downloadMod(mod.id, mod.version, tempFilePath);

        console.log(`[ModManager] Installing modpack from ${tempFilePath}`);

        // Call Rust backend to extract and install the modpack
        await invoke('install_modpack', {
            modpackZipPath: tempFilePath,
            savePath,
            hytaleRoot,
        });

        console.log(`[ModManager] Modpack ${mod.name} installed successfully`);
    }
}

// Export singleton instance
export const modManager = new ModManager();
