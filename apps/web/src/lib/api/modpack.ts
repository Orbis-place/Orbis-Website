/**
 * API client for modpack management
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// TYPES
// ============================================================================

export enum ModpackBuildStrategy {
    COMPLETE_ZIP = 'COMPLETE_ZIP',
    CONFIGURATOR = 'CONFIGURATOR',
}

export interface ModpackModVersion {
    id: string;
    versionNumber: string;
    resource: {
        id: string;
        name: string;
        slug: string;
        iconUrl?: string;
    };
}

export interface ModpackCustomModFile {
    id: string;
    fileName: string;
    url: string;
    size: number;
}

export interface ModpackModConfig {
    id: string;
    fileName: string;
    url: string;
    size: number;
}

export interface ModpackModEntry {
    id: string;
    modpackId: string;
    modVersionId?: string;
    modVersion?: ModpackModVersion;
    customModName?: string;
    customModVersion?: string;
    customModFile?: ModpackCustomModFile;
    isRequired: boolean;
    notes?: string;
    order: number;
    config?: ModpackModConfig;
}

export interface ModpackForkedFrom {
    id: string;
    resource: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface Modpack {
    id: string;
    resourceId: string;
    forkedFromId?: string;
    forkedFrom?: ModpackForkedFrom;
    forkedAt?: string;
    forkCount: number;
    // modEntries removed from Modpack, now on ResourceVersion
    resource: {
        id: string;
        name: string;
        slug: string;
        status: string;
        ownerUserId?: string;
        ownerTeamId?: string;
        latestVersion?: {
            id: string;
            versionNumber: string;
            buildStrategy?: ModpackBuildStrategy;
        };
        versions?: Array<{
            id: string;
            versionNumber: string;
            status: string;
            buildStrategy?: ModpackBuildStrategy;
        }>;
    };
    _count: {
        forks: number;
    };
}

// ============================================================================
// MODPACK QUERIES
// ============================================================================

/**
 * Get modpack details by slug
 */
export async function getModpackBySlug(slug: string): Promise<Modpack> {
    const response = await fetch(`${API_URL}/modpacks/${slug}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch modpack',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get modpack details by resource ID
 */
export async function getModpackByResourceId(resourceId: string): Promise<Modpack> {
    // First get the resource to get slug, then use slug endpoint
    const resourceRes = await fetch(`${API_URL}/resources/${resourceId}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!resourceRes.ok) {
        throw new Error('Failed to fetch resource');
    }

    const { resource } = await resourceRes.json();
    return getModpackBySlug(resource.slug);
}

/**
 * Get mod entries for a modpack version
 */
export async function getModpackEntries(
    resourceId: string,
    versionId: string
): Promise<ModpackModEntry[]> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/entries`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch mod entries',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ============================================================================
// MOD ENTRY MANAGEMENT
// ============================================================================

export interface AddPlatformModParams {
    modVersionId: string;
    notes?: string;
    order?: number;
}

/**
 * Add a platform mod to the modpack
 */
export async function addPlatformMod(
    resourceId: string,
    versionId: string,
    params: AddPlatformModParams
): Promise<ModpackModEntry> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/platform`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to add mod',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export interface AddCustomModParams {
    customModName: string;
    customModVersion: string;
    notes?: string;
    order?: number;
}

/**
 * Add a custom mod (JAR upload) to the modpack
 */
export async function addCustomMod(
    resourceId: string,
    versionId: string,
    file: File,
    params: AddCustomModParams
): Promise<ModpackModEntry> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customModName', params.customModName);
    formData.append('customModVersion', params.customModVersion);
    if (params.notes) {
        formData.append('notes', params.notes);
    }
    if (params.order !== undefined) {
        formData.append('order', String(params.order));
    }

    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/custom`,
        {
            method: 'POST',
            credentials: 'include',
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to add custom mod',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export interface UpdateModEntryParams {
    modVersionId?: string;
    customModVersion?: string;
    notes?: string;
    order?: number;
}

/**
 * Update a mod entry
 */
export async function updateModEntry(
    resourceId: string,
    versionId: string,
    entryId: string,
    params: UpdateModEntryParams
): Promise<ModpackModEntry> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/${entryId}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to update mod entry',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Remove a mod entry from the modpack
 */
export async function removeModEntry(
    resourceId: string,
    versionId: string,
    entryId: string
): Promise<{ message: string }> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/${entryId}`,
        {
            method: 'DELETE',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to remove mod',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Reorder mod entries
 */
export async function reorderModEntries(
    resourceId: string,
    versionId: string,
    modEntryIds: string[]
): Promise<{ message: string }> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/reorder`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ modEntryIds }),
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to reorder mods',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ============================================================================
// CONFIG MANAGEMENT
// ============================================================================

/**
 * Upload config for a mod entry
 */
export async function uploadModConfig(
    resourceId: string,
    versionId: string,
    entryId: string,
    file: File
): Promise<ModpackModConfig> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/${entryId}/config`,
        {
            method: 'POST',
            credentials: 'include',
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to upload config',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Delete config for a mod entry
 */
export async function deleteModConfig(
    resourceId: string,
    versionId: string,
    entryId: string
): Promise<{ message: string }> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/modpack/mods/${entryId}/config`,
        {
            method: 'DELETE',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to delete config',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ============================================================================
// FORK
// ============================================================================

export interface ForkModpackParams {
    name: string;
    slug: string;
    tagline?: string;
    teamId?: string;
}

/**
 * Fork a modpack
 */
export async function forkModpack(
    resourceId: string,
    params: ForkModpackParams
): Promise<{ resource: any; modpack: any }> {
    const response = await fetch(`${API_URL}/resources/${resourceId}/modpack/fork`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fork modpack',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Get forks of a modpack
 */
export async function getModpackForks(resourceId: string): Promise<Modpack[]> {
    // Get the slug first
    const resourceRes = await fetch(`${API_URL}/resources/${resourceId}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!resourceRes.ok) {
        throw new Error('Failed to fetch resource');
    }

    const { resource } = await resourceRes.json();

    const response = await fetch(`${API_URL}/modpacks/${resource.slug}/forks`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to fetch forks',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// ============================================================================
// BUILD STRATEGY MANAGEMENT
// ============================================================================

/**
 * Update build strategy for a modpack version
 */
export async function updateVersionBuildStrategy(
    resourceId: string,
    versionId: string,
    strategy: ModpackBuildStrategy
): Promise<void> {
    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/build-strategy`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ buildStrategy: strategy }),
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to update build strategy',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }
}

/**
 * Upload complete zip for a modpack version (when using COMPLETE_ZIP strategy)
 */
export async function uploadCompleteZip(
    resourceId: string,
    versionId: string,
    file: File
): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
        `${API_URL}/resources/${resourceId}/versions/${versionId}/complete-zip`,
        {
            method: 'POST',
            credentials: 'include',
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to upload complete zip',
        }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

