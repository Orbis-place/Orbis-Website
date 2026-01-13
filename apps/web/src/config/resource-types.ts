export const RESOURCE_TYPES = {
    mods: {
        singular: 'mod',
        plural: 'mods',
        label: 'Mods',
        labelSingular: 'Mod',
        description: 'Game modifications',
        count: 245, // Mock count, will be from API later
    },
    plugins: {
        singular: 'plugin',
        plural: 'plugins',
        label: 'Plugins',
        labelSingular: 'Plugin',
        description: 'Server plugins',
        count: 312,
    },
    worlds: {
        singular: 'world',
        plural: 'worlds',
        label: 'Worlds',
        labelSingular: 'World',
        description: 'Custom worlds and maps',
        count: 189,
    },
    prefabs: {
        singular: 'prefab',
        plural: 'prefabs',
        label: 'Prefabs',
        labelSingular: 'Prefab',
        description: 'Pre-built structures',
        count: 156,
    },
    'asset-packs': {
        singular: 'asset-pack',
        plural: 'asset-packs',
        label: 'Asset Packs',
        labelSingular: 'Asset Pack',
        description: 'Resource packs and assets',
        count: 98,
    },
    'data-packs': {
        singular: 'data-pack',
        plural: 'data-packs',
        label: 'Data Packs',
        labelSingular: 'Data Pack',
        description: 'Data and configuration packs',
        count: 67,
    },
    modpacks: {
        singular: 'modpack',
        plural: 'modpacks',
        label: 'Modpacks',
        labelSingular: 'Modpack',
        description: 'Collections of mods',
        count: 43,
    },

} as const;

export type ResourceTypeKey = keyof typeof RESOURCE_TYPES;

export function getResourceType(type: string) {
    return RESOURCE_TYPES[type as ResourceTypeKey];
}

export function getResourceTypeBySingular(singular: string) {
    return Object.entries(RESOURCE_TYPES).find(
        ([_, config]) => config.singular === singular
    )?.[1];
}

export function isValidResourceType(type: string): type is ResourceTypeKey {
    return type in RESOURCE_TYPES;
}

export function isValidSingularType(singular: string): boolean {
    return Object.values(RESOURCE_TYPES).some(config => config.singular === singular);
}
