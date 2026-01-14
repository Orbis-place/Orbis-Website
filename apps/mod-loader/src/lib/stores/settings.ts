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
            // Try to load from localStorage first
            const stored = localStorage.getItem('hytale_settings');
            if (stored) {
                try {
                    set(JSON.parse(stored));
                    return;
                } catch (e) {
                    console.error('Failed to parse settings', e);
                }
            }

            const home = await homeDir();
            console.log('[Settings] Home dir:', home);

            // Dynamically import os plugin to avoid issues during build if not needed immediately
            const { type } = await import('@tauri-apps/plugin-os');
            const platform = type();
            console.log('[Settings] Platform:', platform);

            let defaultHytaleRoot = '';

            if (platform === 'windows') {
                defaultHytaleRoot = await join(home, 'AppData', 'Roaming', 'Hytale');
            } else if (platform === 'linux') {
                // Flatpak specific path
                defaultHytaleRoot = await join(home, '.var', 'app', 'com.hypixel.HytaleLauncher', 'data', 'Hytale');
            } else {
                // macOS (darwin)
                defaultHytaleRoot = await join(home, 'Library', 'Application Support', 'Hytale');
            }

            console.log('[Settings] Computed defaultHytaleRoot:', defaultHytaleRoot);

            const settings = {
                hytaleRoot: defaultHytaleRoot
            };

            set(settings);
            console.log('[Settings] Settings set:', settings);
            localStorage.setItem('hytale_settings', JSON.stringify(settings));
        },
        updateHytaleRoot: (path: string) => {
            update(s => {
                const newSettings = { ...s, hytaleRoot: path };
                localStorage.setItem('hytale_settings', JSON.stringify(newSettings));
                return newSettings;
            });
        },
        get: () => get({ subscribe })
    };
}

export const settings = createSettingsStore();
