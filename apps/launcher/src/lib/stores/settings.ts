// Settings Store - Application preferences
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface AppSettings {
    theme: 'dark' | 'light' | 'system';
    language: string;
    serversPath: string;
    javaPath: string;
    defaultMemory: number;
    defaultMaxPlayers: number;
    defaultVersion: string;
    autoStart: boolean;
    autoUpdateMods: boolean;
    startMinimized: boolean;
    minimizeToTray: boolean;
    notifications: boolean;
}

const defaultSettings: AppSettings = {
    theme: 'dark',
    language: 'en',
    serversPath: '~/Library/Application Support/Orbis/servers',
    javaPath: 'auto',
    defaultMemory: 4,
    defaultMaxPlayers: 20,
    defaultVersion: '1.0.0-beta.5',
    autoStart: false,
    autoUpdateMods: true,
    startMinimized: false,
    minimizeToTray: true,
    notifications: true,
};

function createSettingsStore() {
    // Load from localStorage if available
    let initial = defaultSettings;
    if (browser) {
        const saved = localStorage.getItem('orbis-settings');
        if (saved) {
            try {
                initial = { ...defaultSettings, ...JSON.parse(saved) };
            } catch { }
        }
    }

    const { subscribe, set, update } = writable<AppSettings>(initial);

    // Save to localStorage on changes
    if (browser) {
        subscribe(value => {
            localStorage.setItem('orbis-settings', JSON.stringify(value));
        });
    }

    return {
        subscribe,

        update: (partial: Partial<AppSettings>) => {
            update(settings => ({ ...settings, ...partial }));
        },

        reset: () => set(defaultSettings),

        get: () => get({ subscribe }),
    };
}

export const settings = createSettingsStore();
