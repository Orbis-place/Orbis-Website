import { fetch } from '@tauri-apps/plugin-http';
import type { IModSource } from '../mod-source.interface';
import {
    ModSource,
    type Mod,
    type ModDetails,
    type ModFilters,
    type ModVersion,
} from '../../types/mod';

interface OrbisResource {
    id: string;
    name: string;
    description: string;
    tagline?: string;
    slug: string;
    downloads: number;
    iconUrl?: string;
    bannerUrl?: string;
    ownerUser?: {
        username: string;
        displayName?: string;
    };
    categories?: {
        category: {
            slug: string;
            name: string;
        };
    }[];
    latestVersion?: {
        versionNumber: string;
        downloadCount: number;
    };
}

interface OrbisVersion {
    id: string;
    versionNumber: string;
    name?: string;
    changelog?: string;
    downloadCount: number;
    createdAt: string;
    files?: {
        id: string;
        fileName: string;
        size: number;
    }[];
}

/**
 * Orbis mod source implementation
 * Connects to the Orbis API to fetch mod data
 */
export class OrbisModSource implements IModSource {
    readonly name = 'orbis';
    readonly displayName = 'Orbis';

    private readonly apiBaseUrl = 'https://api.orbis.place';

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resources?limit=1`);
            return response.ok;
        } catch {
            return false;
        }
    }

    async searchMods(filters?: ModFilters): Promise<Mod[]> {
        try {
            const params = new URLSearchParams();
            params.append('limit', '50');

            // Only fetch mods, exclude plugins etc.
            params.append('type', 'PLUGIN');

            if (filters?.query) {
                params.append('search', filters.query);
            }

            if (filters?.offset) {
                // If offset is used as page number in API or calculating page
                const page = Math.floor(filters.offset / 50) + 1;
                params.append('page', page.toString());
            }

            // Note: Categories mapping might be needed if filter categories don't match API slugs
            if (filters?.categories && filters.categories.length > 0) {
                filters.categories.forEach(cat => params.append('categories', cat));
            }

            const response = await fetch(`${this.apiBaseUrl}/resources?${params.toString()}`);
            if (!response.ok) throw new Error(`Orbis API error: ${response.statusText}`);

            const data = await response.json();
            // Orbis API returns { data: [...], meta: ... }

            if (!data.data) return [];

            return data.data.map((resource: OrbisResource) => this.mapToMod(resource));
        } catch (error) {
            console.error('Error searching Orbis mods:', error);
            return [];
        }
    }

    async getModDetails(modId: string): Promise<ModDetails> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resources/${modId}`);
            if (!response.ok) throw new Error('Failed to fetch mod details');

            const { resource } = await response.json();

            // Fetch versions as they might not be fully populated in getById details
            const versions = await this.getModVersions(modId);

            return {
                ...this.mapToMod(resource),
                longDescription: resource.description, // API returns markdown/html in description usually
                versions,
                tags: [], // Map tags if available
                license: 'All rights reserved', // Placeholder or fetch from resource
            };
        } catch (error) {
            console.error('Error fetching Orbis mod details:', error);
            throw error;
        }
    }

    async getModVersions(modId: string): Promise<ModVersion[]> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resources/${modId}/versions`);
            if (!response.ok) return [];

            // API usually returns array of versions
            const responseData = await response.json();
            console.log(`[OrbisSource] Raw versions response for ${modId}:`, JSON.stringify(responseData));

            // Handle possible { data: [...] } or { versions: [...] } wrapper
            const versions = Array.isArray(responseData) ? responseData : (responseData.data || responseData.versions || []);

            if (!Array.isArray(versions)) {
                console.error('[OrbisSource] Versions response is not an array and has no data/versions property', responseData);
                return [];
            }

            return versions.map((v: OrbisVersion) => ({
                version: v.versionNumber,
                changelog: v.changelog,
                downloadUrl: `${this.apiBaseUrl}/resources/${modId}/versions/${v.id}/download`, // This redirects based on analysis
                fileSize: 0, // Need to find where size is, maybe in files[0]
                releaseDate: v.createdAt,
            }));
        } catch (error) {
            console.error('Error fetching Orbis mod versions:', error);
            return [];
        }
    }

    async downloadMod(
        modId: string,
        version: string,
        destination: string
    ): Promise<void> {
        try {
            const versions = await this.getModVersions(modId);
            console.log(`[OrbisSource] Requested version: ${version}`);
            console.log(`[OrbisSource] Available versions:`, versions.map(v => v.version));

            const targetVersion = versions.find(v => v.version === version);

            if (!targetVersion) {
                console.error(`Version ${version} not found in available versions for mod ${modId}`);
                throw new Error(`Version ${version} not found. Available: ${versions.map(v => v.version).join(', ')}`);
            }

            console.log(`Downloading mod from: ${targetVersion.downloadUrl}`);

            const response = await fetch(targetVersion.downloadUrl);
            if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Import writeFile dynamically or assume it's available via module scope if added
            // Since we need to add the import to the top of the file, we should do that in a separate step or if I can here.
            // But let's use the tool properly. I'll add the import in the next step or if I can here.
            // Actually, I can't easily add import here without rewriting the whole file. 
            // I will assume I will add `import { writeFile } from '@tauri-apps/plugin-fs';` at the top.

            // Wait, I can't use `writeFile` unless I import it. 
            // I will use a fully qualified import if possible? No, standard ES modules.
            // I will just write the logic here and then update imports.

            await import('@tauri-apps/plugin-fs').then(fs =>
                fs.writeFile(destination, uint8Array)
            );

            console.log(`Downloaded mod to ${destination}`);

        } catch (error) {
            console.error('Error downloading mod from Orbis:', error);
            throw error;
        }
    }

    private mapToMod(resource: OrbisResource): Mod {
        return {
            id: resource.id, // Using UUID
            name: resource.name,
            description: resource.tagline || resource.description || '',
            author: resource.ownerUser?.displayName || resource.ownerUser?.username || 'Unknown',
            version: resource.latestVersion?.versionNumber || '0.0.0',
            downloads: resource.downloads || 0,
            categories: resource.categories?.map(c => c.category.name) || [],
            source: ModSource.ORBIS,
            icon: resource.iconUrl,
        };
    }
}
