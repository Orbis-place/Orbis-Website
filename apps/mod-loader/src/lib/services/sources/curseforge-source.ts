import type { IModSource } from '../mod-source.interface';
import type {
    Mod,
    ModDetails,
    ModFilters,
    ModSource,
    ModVersion,
} from '../../types/mod';

/**
 * CurseForge mod source implementation (placeholder)
 * TODO: Implement CurseForge API integration
 */
export class CurseForgeModSource implements IModSource {
    readonly name = 'curseforge';
    readonly displayName = 'CurseForge';

    private readonly apiBaseUrl = 'https://api.curseforge.com';

    async isAvailable(): Promise<boolean> {
        // TODO: Implement CurseForge API health check
        return false; // Not yet implemented
    }

    async searchMods(filters?: ModFilters): Promise<Mod[]> {
        // TODO: Implement CurseForge API integration
        console.warn('CurseForge mod source not yet implemented');
        return [];
    }

    async getModDetails(modId: string): Promise<ModDetails> {
        // TODO: Implement CurseForge API integration
        throw new Error('CurseForge mod source not yet implemented');
    }

    async getModVersions(modId: string): Promise<ModVersion[]> {
        // TODO: Implement CurseForge API integration
        return [];
    }

    async downloadMod(
        modId: string,
        version: string,
        destination: string
    ): Promise<void> {
        // TODO: Implement CurseForge download logic
        throw new Error('CurseForge mod source not yet implemented');
    }
}
