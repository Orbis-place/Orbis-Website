// TypeScript types matching the Rust structures

export interface ModAuthor {
    Name: string;
}

export interface ModManifest {
    Group: string;
    Name: string;
    Version: string;
    Description: string;
    Authors: ModAuthor[];
    Website?: string;
    ServerVersion: string;
    Dependencies: Record<string, string>;
    OptionalDependencies: Record<string, string>;
    DisabledByDefault: boolean;
    Main: string;
    IncludesAssetPack: boolean;
}

export interface InstalledMod {
    jar_name: string;
    manifest: ModManifest;
    enabled: boolean;
    orbis_metadata?: {
        id: string;
        slug?: string;
        name: string;
        author: string;
        iconUrl?: string;
        version: string;
        installedAt: string;
    };
}

export interface ModConfigEntry {
    Enabled: boolean;
}

export interface ModConfig {
    Mods: Record<string, ModConfigEntry>;
}
