import { writable } from 'svelte/store';
import type { HytaleSave } from '$lib/types/mod';
import { readDir, exists } from '@tauri-apps/plugin-fs';
import { homeDir, join } from '@tauri-apps/api/path';

function createSavesStore() {
    const { subscribe, set, update } = writable<HytaleSave[]>([]);

    return {
        subscribe,
        load: async () => {
            try {
                const home = await homeDir();
                console.log('Home dir:', home);

                // TODO: Handle Windows path
                const saveRoot = await join(home, 'Library', 'Application Support', 'Hytale', 'UserData', 'Saves');
                console.log('Scanning saves at:', saveRoot);

                const existsResult = await exists(saveRoot);
                console.log('Save root exists:', existsResult);

                if (!existsResult) {
                    console.warn('Saves directory not found:', saveRoot);
                    return;
                }

                const entries = await readDir(saveRoot);
                console.log(`Found ${entries.length} entries in saves dir`);

                const saves: HytaleSave[] = [];

                for (const entry of entries) {
                    console.log(`Entry: ${entry.name}, isDirectory: ${entry.isDirectory}`);
                    if (entry.isDirectory) {
                        const fullPath = await join(saveRoot, entry.name);
                        // Basic info for now
                        saves.push({
                            name: entry.name,
                            path: fullPath,
                            installedModsCount: 0, // TODO: Scan mods folder
                            lastPlayed: new Date().toISOString() // Placeholder
                        });
                    }
                }
                console.log('Saves loaded:', saves);
                set(saves);
            } catch (e) {
                console.error('Failed to load saves:', e);
            }
        },
        add: (save: HytaleSave) => update(saves => [...saves, save]),
        remove: (path: string) => update(saves => saves.filter(s => s.path !== path)),
        updateSave: (path: string, data: Partial<HytaleSave>) =>
            update(saves => saves.map(s => s.path === path ? { ...s, ...data } : s)),
        set
    };
}

export const saves = createSavesStore();
export const selectedSave = writable<HytaleSave | null>(null);

// Initialize saves on load
setTimeout(() => {
    saves.load();
}, 100);

export function selectSave(save: HytaleSave) {
    selectedSave.set(save);
}
