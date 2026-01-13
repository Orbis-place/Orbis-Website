export enum ModSource {
    ORBIS = 'orbis',
    CURSEFORGE = 'curseforge',
}

export interface Mod {
    id: string;
    name: string;
    description: string;
    author: string;
    version: string;
    icon?: string;
    downloads: number;
    categories: string[];
    source: ModSource;
    createdAt?: string;
    updatedAt?: string;
}

export interface ModVersion {
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
}

export interface InstalledMod {
    mod: Mod;
    version: string;
    installedAt: string;
    saveName: string;
}

export interface HytaleSave {
    name: string;
    path: string;
    previewImage?: string;
    lastPlayed?: string;
    installedModsCount: number;
}
