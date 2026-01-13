import { writable, get } from 'svelte/store';
import { homeDir, join } from '@tauri-apps/api/path';

export interface Settings {
    hytaleRoot: string;
}

function createSettingsStore() {
    const { subscribe, set, update } = writable<Settings>({
        hytaleRoot: ''
    });

    return {
        subscribe,
        load: async () => {
            const home = await homeDir();
            // Default Hytale path
            const defaultHytaleRoot = await join(home, 'Library', 'Application Support', 'Hytale');

            // TODO: Load from persisted storage if available

            set({
                hytaleRoot: defaultHytaleRoot
            });
        },
        updateHytaleRoot: (path: string) => update(s => ({ ...s, hytaleRoot: path })),
        get: () => get({ subscribe })
    };
}

export const settings = createSettingsStore();
