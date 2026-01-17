use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use zip::ZipArchive;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModManifest {
    #[serde(rename = "Group")]
    pub group: String,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Version")]
    pub version: String,
    #[serde(rename = "Description")]
    #[serde(default)]
    pub description: String,
    #[serde(rename = "Authors")]
    #[serde(default)]
    pub authors: Vec<ModAuthor>,
    #[serde(rename = "Website")]
    pub website: Option<String>,
    #[serde(rename = "ServerVersion")]
    #[serde(default)]
    pub server_version: String,
    #[serde(rename = "Dependencies")]
    #[serde(default)]
    pub dependencies: HashMap<String, String>,
    #[serde(rename = "OptionalDependencies")]
    #[serde(default)]
    pub optional_dependencies: HashMap<String, String>,
    #[serde(rename = "DisabledByDefault")]
    #[serde(default)]
    pub disabled_by_default: bool,
    #[serde(rename = "Main")]
    #[serde(default)]
    pub main: String,
    #[serde(rename = "IncludesAssetPack")]
    #[serde(default)]
    pub includes_asset_pack: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModAuthor {
    #[serde(rename = "Name")]
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OrbisMetadataEntry {
    pub id: String,
    pub slug: Option<String>,
    pub name: String,
    pub author: String,
    #[serde(rename = "iconUrl")]
    pub icon_url: Option<String>,
    pub version: String,
    #[serde(rename = "installedAt")]
    pub installed_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstalledMod {
    pub jar_name: String, // Keep for backward compatibility (can be .jar or .zip)
    pub manifest: ModManifest,
    pub orbis_metadata: Option<OrbisMetadataEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModConfig {
    #[serde(rename = "Mods")]
    pub mods: HashMap<String, ModConfigEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModConfigEntry {
    #[serde(rename = "Enabled")]
    pub enabled: bool,
}

/// Read orbis-metadata.json from mods directory
fn read_orbis_metadata(mods_dir: &Path) -> HashMap<String, OrbisMetadataEntry> {
    let metadata_path = mods_dir.join("orbis-metadata.json");

    if !metadata_path.exists() {
        return HashMap::new();
    }

    match fs::read_to_string(&metadata_path) {
        Ok(contents) => match serde_json::from_str(&contents) {
            Ok(metadata) => metadata,
            Err(e) => {
                eprintln!("Failed to parse orbis-metadata.json: {}", e);
                HashMap::new()
            }
        },
        Err(e) => {
            eprintln!("Failed to read orbis-metadata.json: {}", e);
            HashMap::new()
        }
    }
}

/// Extract manifest from a mod archive (.jar or .zip file)
fn extract_manifest_from_archive(archive_path: &Path) -> Result<ModManifest, String> {
    println!("extract_manifest_from_archive: Opening {:?}", archive_path);
    let file = File::open(archive_path).map_err(|e| format!("Failed to open archive file: {}", e))?;

    println!("extract_manifest_from_archive: Reading zip archive");
    let mut archive =
        ZipArchive::new(file).map_err(|e| format!("Failed to read archive: {}", e))?;

    println!("extract_manifest_from_archive: Looking for manifest.json");
    let mut manifest_file = archive
        .by_name("manifest.json")
        .map_err(|e| format!("manifest.json not found in archive: {}", e))?;

    let mut contents = String::new();
    manifest_file
        .read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read manifest.json: {}", e))?;

    println!("extract_manifest_from_archive: Parsing manifest");
    serde_json::from_str(&contents).map_err(|e| format!("Failed to parse manifest.json: {}", e))
}

/// Read config.json from save directory
fn read_mod_config(save_path: &Path) -> Result<ModConfig, String> {
    let config_path = save_path.join("config.json");

    if !config_path.exists() {
        // Return empty config if file doesn't exist
        return Ok(ModConfig {
            mods: HashMap::new(),
        });
    }

    let contents = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config.json: {}", e))?;

    serde_json::from_str(&contents).map_err(|e| format!("Failed to parse config.json: {}", e))
}

/// Write config.json to save directory
fn write_mod_config(save_path: &Path, config: &ModConfig) -> Result<(), String> {
    let config_path = save_path.join("config.json");

    let contents = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&config_path, contents).map_err(|e| format!("Failed to write config.json: {}", e))
}

/// Helper to check if a file is a mod archive (.jar or .zip)
fn is_mod_archive(path: &Path) -> bool {
    match path.extension().and_then(|s| s.to_str()) {
        Some(ext) => {
            let ext = ext.to_lowercase();
            ext == "jar" || ext == "zip"
        }
        None => false,
    }
}

/// Build a map of "Group:Name" -> (file_path, manifest) from global mods directory
fn build_global_mods_index(global_mods_dir: &Path) -> HashMap<String, (PathBuf, ModManifest)> {
    let mut index = HashMap::new();

    if !global_mods_dir.exists() {
        return index;
    }

    let entries = match fs::read_dir(global_mods_dir) {
        Ok(e) => e,
        Err(_) => return index,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if is_mod_archive(&path) {
            if let Ok(manifest) = extract_manifest_from_archive(&path) {
                let mod_key = format!("{}:{}", manifest.group, manifest.name);
                index.insert(mod_key, (path, manifest));
            }
        }
    }

    index
}

#[tauri::command]
pub fn get_installed_mods(save_path: String, hytale_root: String) -> Result<Vec<InstalledMod>, String> {
    println!("get_installed_mods called with save_path: {}, hytale_root: {}", save_path, hytale_root);
    let save_path = Path::new(&save_path);
    let hytale_path = Path::new(&hytale_root);
    let global_mods_dir = hytale_path.join("UserData").join("Mods");

    println!("Looking for mods in global dir: {:?}", global_mods_dir);

    // Read config to get the list of installed mods for this save
    let config = read_mod_config(save_path)?;
    println!("Config contains {} mod entries", config.mods.len());

    if config.mods.is_empty() {
        println!("No mods configured for this save");
        return Ok(Vec::new());
    }

    // Read orbis metadata from global mods directory
    let orbis_metadata = read_orbis_metadata(&global_mods_dir);

    // Build index of all available mods in global directory
    let global_mods_index = build_global_mods_index(&global_mods_dir);
    println!("Found {} mods in global directory", global_mods_index.len());

    let mut installed_mods = Vec::new();

    // For each mod in config.json that is ENABLED, find its corresponding archive in global mods
    // (Hytale now adds all mods from UserData/Mods to config.json, so we only consider enabled ones as "installed")
    for (mod_key, config_entry) in &config.mods {
        // Only consider mods that are enabled as "installed" for this save
        if !config_entry.enabled {
            println!("Skipping disabled mod: {}", mod_key);
            continue;
        }

        println!("Looking for enabled mod: {}", mod_key);

        if let Some((path, manifest)) = global_mods_index.get(mod_key) {
            let file_name = path
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();

            // Get orbis metadata if available
            let orbis_meta = orbis_metadata.get(&file_name).cloned();

            installed_mods.push(InstalledMod {
                jar_name: file_name,
                manifest: manifest.clone(),
                orbis_metadata: orbis_meta,
            });
            println!("Found mod {} -> {}", mod_key, path.display());
        } else {
            println!("Warning: Mod {} not found in global mods directory", mod_key);
        }
    }

    println!("Found {} installed mods for this save", installed_mods.len());
    Ok(installed_mods)
}

#[tauri::command]
pub fn add_mod_to_config(save_path: String, group: String, name: String) -> Result<(), String> {
    let save_path = Path::new(&save_path);
    let mut config = read_mod_config(save_path)?;

    let mod_key = format!("{}:{}", group, name);

    // Only add if not already present
    if !config.mods.contains_key(&mod_key) {
        config
            .mods
            .insert(mod_key, ModConfigEntry { enabled: true });

        write_mod_config(save_path, &config)?;
    }

    Ok(())
}

#[tauri::command]
pub fn register_jar_in_config(
    save_path: String,
    jar_filename: String,
    hytale_root: String,
) -> Result<ModManifest, String> {
    let save_path = Path::new(&save_path);
    let mods_dir = save_path.join("mods");
    let local_jar_path = mods_dir.join(&jar_filename);

    let hytale_path = Path::new(&hytale_root);
    let global_mods_dir = hytale_path.join("UserData").join("Mods");
    let global_jar_path = global_mods_dir.join(&jar_filename);

    let jar_path = if local_jar_path.exists() {
        println!("Found archive in local mods: {:?}", local_jar_path);
        local_jar_path
    } else if global_jar_path.exists() {
        println!("Found archive in global mods: {:?}", global_jar_path);
        global_jar_path
    } else {
        let err = format!(
            "Archive file not found in local {:?} or global {:?}",
            local_jar_path, global_jar_path
        );
        println!("{}", err);
        return Err(err);
    };

    println!("Registering archive: {:?}", jar_path);

    let manifest = match extract_manifest_from_archive(&jar_path) {
        Ok(m) => m,
        Err(e) => {
            let err = format!("Failed to extract manifest from {:?}: {}", jar_path, e);
            println!("{}", err);
            return Err(err);
        }
    };

    let mut config = read_mod_config(save_path)?;
    let mod_key = format!("{}:{}", manifest.group, manifest.name);

    if !config.mods.contains_key(&mod_key) {
        println!("Adding {} to config", mod_key);
        config
            .mods
            .insert(mod_key, ModConfigEntry { enabled: true });
        
        // Ensure save mods dir exists for config.json if it doesn't
        if !mods_dir.exists() {
            fs::create_dir_all(&mods_dir).map_err(|e| format!("Failed to create mods dir: {}", e))?;
        }

        if let Err(e) = write_mod_config(save_path, &config) {
            let err = format!("Failed to write config: {}", e);
            println!("{}", err);
            return Err(err);
        }
    } else {
        println!("{} already in config", mod_key);
    }

    Ok(manifest)
}

#[tauri::command]
pub fn delete_mod(
    save_path: String,
    group: String,
    name: String,
    jar_filename: String,
) -> Result<(), String> {
    let save_path = Path::new(&save_path);

    // 1. Remove from config
    let mut config = read_mod_config(save_path)?;
    let mod_key = format!("{}:{}", group, name);

    if config.mods.remove(&mod_key).is_some() {
        write_mod_config(save_path, &config)?;
    }

    // 2. Delete jar file
    let mods_dir = save_path.join("mods");
    let jar_path = mods_dir.join(&jar_filename);

    if jar_path.exists() {
        fs::remove_file(&jar_path).map_err(|e| format!("Failed to delete mod file: {}", e))?;
    }

    Ok(())
}

/// Represents a global mod (no config.json, so no enabled state)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalMod {
    pub jar_name: String,
    pub manifest: ModManifest,
    pub orbis_metadata: Option<OrbisMetadataEntry>,
}

#[tauri::command]
pub fn get_global_mods(hytale_root: String) -> Result<Vec<GlobalMod>, String> {
    let hytale_path = Path::new(&hytale_root);
    let global_mods_dir = hytale_path.join("UserData").join("Mods");

    println!("get_global_mods: Scanning {:?}", global_mods_dir);

    if !global_mods_dir.exists() {
        println!(
            "Global mods directory does not exist: {:?}",
            global_mods_dir
        );
        return Ok(Vec::new());
    }

    // Read orbis metadata
    let orbis_metadata = read_orbis_metadata(&global_mods_dir);

    let mut global_mods = Vec::new();

    let entries = fs::read_dir(&global_mods_dir)
        .map_err(|e| format!("Failed to read global mods directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if is_mod_archive(&path) {
            match extract_manifest_from_archive(&path) {
                Ok(manifest) => {
                    println!("Found global mod: {}", manifest.name);
                    let file_name = path
                        .file_name()
                        .and_then(|s| s.to_str())
                        .unwrap_or("unknown")
                        .to_string();

                    let orbis_meta = orbis_metadata.get(&file_name).cloned();

                    global_mods.push(GlobalMod {
                        jar_name: file_name, // Keep field name for backward compatibility
                        manifest,
                        orbis_metadata: orbis_meta,
                    });
                }
                Err(e) => {
                    eprintln!("Failed to extract manifest from {:?}: {}", path, e);
                }
            }
        }
    }

    println!("Found {} global mods", global_mods.len());
    Ok(global_mods)
}

#[tauri::command]
pub fn delete_global_mod(hytale_root: String, jar_filename: String) -> Result<(), String> {
    let hytale_path = Path::new(&hytale_root);
    let global_mods_dir = hytale_path.join("UserData").join("Mods");
    let jar_path = global_mods_dir.join(&jar_filename);

    if jar_path.exists() {
        fs::remove_file(&jar_path)
            .map_err(|e| format!("Failed to delete global mod file: {}", e))?;
    }

    Ok(())
}

/// Install a modpack from a downloaded zip file
/// - Extracts Mods/ contents to UserData/Mods
/// - Extracts and unpacks Configs/*.zip to save_path/mods
/// - Updates config.json to enable installed mods
#[tauri::command]
pub fn install_modpack(
    modpack_zip_path: String,
    save_path: String,
    hytale_root: String,
) -> Result<(), String> {
    use std::io::copy;

    let modpack_path = Path::new(&modpack_zip_path);
    let save_path = Path::new(&save_path);
    let hytale_path = Path::new(&hytale_root);

    let global_mods_dir = hytale_path.join("UserData").join("Mods");
    let save_mods_dir = save_path.join("mods");

    // Ensure directories exist
    if !global_mods_dir.exists() {
        fs::create_dir_all(&global_mods_dir)
            .map_err(|e| format!("Failed to create global mods directory: {}", e))?;
    }
    if !save_mods_dir.exists() {
        fs::create_dir_all(&save_mods_dir)
            .map_err(|e| format!("Failed to create save mods directory: {}", e))?;
    }

    // Open the modpack zip
    let file = File::open(modpack_path)
        .map_err(|e| format!("Failed to open modpack zip: {}", e))?;
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read modpack zip: {}", e))?;

    println!("Installing modpack from {:?}", modpack_path);

    let mut installed_manifests: Vec<ModManifest> = Vec::new();

    // Process each file in the archive
    for i in 0..archive.len() {
        let mut zip_file = archive.by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {}", e))?;

        let name = zip_file.name().to_string();

        // Skip directories
        if name.ends_with('/') {
            continue;
        }

        // Handle Mods/ directory - copy to global mods
        if name.starts_with("Mods/") {
            let file_name = name.strip_prefix("Mods/").unwrap_or(&name);
            if file_name.is_empty() {
                continue;
            }

            let dest_path = global_mods_dir.join(file_name);
            println!("Extracting mod: {} -> {:?}", file_name, dest_path);

            // Create parent directories if needed
            if let Some(parent) = dest_path.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create directory: {}", e))?;
            }

            let mut outfile = File::create(&dest_path)
                .map_err(|e| format!("Failed to create file {:?}: {}", dest_path, e))?;
            copy(&mut zip_file, &mut outfile)
                .map_err(|e| format!("Failed to write file {:?}: {}", dest_path, e))?;

            // Try to extract manifest from the installed mod
            println!("Checking if extracted file is a mod archive: {:?}", dest_path);
            if is_mod_archive(&dest_path) {
                 println!("Attempting to extract manifest from: {:?}", dest_path);
                 match extract_manifest_from_archive(&dest_path) {
                    Ok(manifest) => {
                        println!("Found manifest for mod: {}", manifest.name);
                        installed_manifests.push(manifest);
                    }
                    Err(e) => {
                        println!("Warning: Failed to extract manifest from extracted mod {:?}: {}", dest_path, e);
                    }
                }
            } else {
                println!("File is not considered a mod archive (extension check failed)");
            }
        }
        // Handle Configs/ directory - extract zip files to save mods dir
        else if name.starts_with("Configs/") && name.ends_with(".zip") {
            let file_name = name.strip_prefix("Configs/").unwrap_or(&name);
            if file_name.is_empty() {
                continue;
            }

            println!("Processing config zip: {}", file_name);

            // Read the config zip into memory
            let mut config_data = Vec::new();
            std::io::Read::read_to_end(&mut zip_file, &mut config_data)
                .map_err(|e| format!("Failed to read config zip {}: {}", file_name, e))?;

            // Open the nested config zip
            let cursor = std::io::Cursor::new(config_data);
            let mut config_archive = ZipArchive::new(cursor)
                .map_err(|e| format!("Failed to read config archive {}: {}", file_name, e))?;

            // Extract all files from config zip to save mods dir
            for j in 0..config_archive.len() {
                let mut config_file = config_archive.by_index(j)
                    .map_err(|e| format!("Failed to read config entry: {}", e))?;

                let config_name = config_file.name().to_string();
                if config_name.ends_with('/') {
                    continue;
                }

                let dest_path = save_mods_dir.join(&config_name);
                println!("Extracting config: {} -> {:?}", config_name, dest_path);

                // Create parent directories if needed
                if let Some(parent) = dest_path.parent() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create directory: {}", e))?;
                }

                let mut outfile = File::create(&dest_path)
                    .map_err(|e| format!("Failed to create file {:?}: {}", dest_path, e))?;
                copy(&mut config_file, &mut outfile)
                    .map_err(|e| format!("Failed to write file {:?}: {}", dest_path, e))?;
            }
        }
    }

    // Update config.json with installed mods
    if !installed_manifests.is_empty() {
        println!("Updating config.json with {} installed mods", installed_manifests.len());
        let mut config = read_mod_config(save_path)?;
        
        for manifest in installed_manifests {
            let mod_key = format!("{}:{}", manifest.group, manifest.name);
            println!("Enabling mod in config: {}", mod_key);
            config.mods.insert(mod_key, ModConfigEntry { enabled: true });
        }

        write_mod_config(save_path, &config)?;
        println!("Successfully updated config.json");
    } else {
        println!("No manifests found, skipping config.json update");
    }

    // Clean up the downloaded modpack zip
    if let Err(e) = fs::remove_file(modpack_path) {
        eprintln!("Warning: Failed to clean up modpack zip: {}", e);
    }

    println!("Modpack installation complete");
    Ok(())
}
