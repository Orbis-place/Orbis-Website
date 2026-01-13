import { writable, type Writable } from 'svelte/store';
import type { HytaleSave } from '$lib/types/mod';

// Mock initial data - this would normally come from the backend/load
const initialSaves: HytaleSave[] = [
    {
        name: 'My Survival World',
        path: '/Users/.../Hytale/UserData/Saves/aze',
        lastPlayed: '2026-01-13',
        installedModsCount: 12,
    },
    {
        name: 'Creative Test',
        path: '/Users/.../Hytale/UserData/Saves/dssdf',
        lastPlayed: '2026-01-10',
        installedModsCount: 5,
    },
];

function createSavesStore() {
    const { subscribe, set, update } = writable<HytaleSave[]>(initialSaves);

    return {
        subscribe,
        add: (save: HytaleSave) => update(saves => [...saves, save]),
        remove: (path: string) => update(saves => saves.filter(s => s.path !== path)),
        updateSave: (path: string, data: Partial<HytaleSave>) =>
            update(saves => saves.map(s => s.path === path ? { ...s, ...data } : s)),
        set
    };
}

export const saves = createSavesStore();
export const selectedSave = writable<HytaleSave | null>(initialSaves[0] || null);

// Helper to select a save by id (using path as id for now or we could add an id field)
export function selectSave(save: HytaleSave) {
    selectedSave.set(save);
}
