import { writable, get } from 'svelte/store';
import type { HytaleSave } from '$lib/types/mod';
import { readDir, exists, readTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { settings } from './settings';

function createSavesStore() {
    const { subscribe, set, update } = writable<HytaleSave[]>([]);

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    return {
        subscribe,
        load: async () => {
            try {
                // Ensure settings are loaded
                let hytaleRoot = get(settings).hytaleRoot;
                if (!hytaleRoot) {
                    await settings.load();
                    hytaleRoot = get(settings).hytaleRoot;
                }

                // Construct UserData/Saves path from root
                const userDataDir = await join(hytaleRoot, 'UserData');
                const saveRoot = await join(userDataDir, 'Saves');

                // console.log('Scanning saves at:', saveRoot);

                const existsResult = await exists(saveRoot);
                // console.log('Save root exists:', existsResult);

                if (!existsResult) {
                    console.warn('Saves directory not found:', saveRoot);
                    return;
                }

                const entries = await readDir(saveRoot);
                // console.log(`Found ${entries.length} entries in saves dir`);

                const saves: HytaleSave[] = [];

                for (const entry of entries) {
                    // console.log(`Entry: ${entry.name}, isDirectory: ${entry.isDirectory}`);
                    if (entry.isDirectory) {
                        const fullPath = await join(saveRoot, entry.name);

                        // Count mods in the mods folder
                        // Count enabled mods from config.json
                        let modCount = 0;
                        try {
                            const configPath = await join(fullPath, 'config.json');
                            if (await exists(configPath)) {
                                const content = await readTextFile(configPath);
                                const config = JSON.parse(content);
                                if (config && config.Mods) {
                                    modCount = Object.values(config.Mods).filter((m: any) => m.Enabled).length;
                                }
                            }
                        } catch (e) {
                            console.warn('Failed to read mod count from config:', e);
                        }

                        saves.push({
                            name: entry.name,
                            path: fullPath,
                            installedModsCount: modCount,
                            lastPlayed: new Date().toISOString() // Placeholder
                        });
                    }
                }
                // console.log('Saves loaded:', saves);
                set(saves);
            } catch (e) {
                console.error('Failed to load saves:', e);
            }
        },
        startPolling: function () {
            if (pollInterval) return;
            this.load();
            pollInterval = setInterval(() => this.load(), 10000);
        },
        stopPolling: function () {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
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
    // Initialize saves on load and start polling
    setTimeout(() => {
        saves.startPolling();
    }, 100);
}, 100);

export function selectSave(save: HytaleSave) {
    selectedSave.set(save);
}
