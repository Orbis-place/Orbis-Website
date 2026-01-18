export enum ModSource {
    ORBIS = 'orbis',
}

export interface Mod {
    id: string;
    name: string;
    description: string;
    author: string;
    version: string;
    slug?: string;
    icon?: string;
    downloads: number;
    categories: string[];
    source: ModSource;
    createdAt?: string;
    updatedAt?: string;
}

export interface ModVersion {
    id?: string;
    version: string;
    downloadUrl: string;
    changelog?: string;
    dependencies?: ModDependency[];
    fileSize?: number;
    releaseDate?: string;
}

export interface ModDependency {
    modId: string;
    modName: string;
    required: boolean;
    version?: string;
}

export interface ModDetails extends Mod {
    longDescription?: string;
    screenshots?: string[];
    versions: ModVersion[];
    tags?: string[];
    license?: string;
    sourceUrl?: string;
    issuesUrl?: string;
}

export interface ModFilters {
    query?: string;
    categories?: string[];
    sortBy?: 'downloads' | 'updated' | 'created' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    offset?: number;
    type?: 'MOD' | 'WORLD' | 'PLUGIN' | 'MODPACK';
}

export interface HytaleSave {
    name: string;
    path: string;
    previewImage?: string;
    lastPlayed?: string;
    installedModsCount: number;
}

export interface OrbisModMetadata {
    id: string;
    slug?: string;
    name: string;
    author: string;
    iconUrl?: string;
    version: string;
    installedAt: string;
}

export type OrbisMetadataFile = Record<string, OrbisModMetadata>;

// Comments
export interface ResourceComment {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: {
        username: string;
        displayName?: string;
        image?: string;
    };
    replies?: ResourceComment[];
    version?: {
        versionNumber: string;
    };
}

// Modpack
export interface ModpackModEntry {
    id: string;
    modpackId: string;
    modVersionId?: string;
    modVersion?: {
        id: string;
        versionNumber: string;
        resource: {
            id: string;
            name: string;
            slug: string;
            iconUrl?: string;
        };
    };
    customModName?: string;
    customModVersion?: string;
    customModFile?: {
        id: string;
        fileName: string;
        size: number;
    };
    isRequired: boolean;
    notes?: string;
    order: number;
    config?: {
        id: string;
        fileName: string;
        size: number;
    };
}

export interface Modpack {
    id: string;
    resource: {
        id: string;
        slug: string;
        latestVersion?: {
            id: string;
            versionNumber: string;
        };
    };
}

