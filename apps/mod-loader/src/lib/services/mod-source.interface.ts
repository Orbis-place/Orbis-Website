import type { Mod, ModDetails, ModFilters, ModVersion } from '../types/mod';

/**
 * Interface that all mod sources must implement
 * This allows easy extension to support multiple mod repositories
 */
export interface IModSource {
    /** Unique identifier for this mod source */
    readonly name: string;

    /** Display name for UI */
    readonly displayName: string;

    /** Whether this source is currently available */
    isAvailable(): Promise<boolean>;

    /**
     * Search for mods with optional filters
     * @param filters - Search and filter criteria
     * @returns Array of mods matching the criteria
     */
    searchMods(filters?: ModFilters): Promise<Mod[]>;

    /**
     * Get detailed information about a specific mod
     * @param modId - Unique identifier of the mod
     * @returns Detailed mod information including versions
     */
    getModDetails(modId: string): Promise<ModDetails>;

    /**
     * Get all available versions for a mod
     * @param modId - Unique identifier of the mod
     * @returns Array of available versions
     */
    getModVersions(modId: string): Promise<ModVersion[]>;

    /**
     * Download a specific version of a mod
     * @param modId - Unique identifier of the mod
     * @param version - Version to download
     * @param destination - Local path where the mod should be saved
     * @returns Promise that resolves when download is complete
     */
    downloadMod(
        modId: string,
        version: string,
        destination: string
    ): Promise<void>;
}
