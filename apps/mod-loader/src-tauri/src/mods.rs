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
pub struct InstalledMod {
    pub jar_name: String,
    pub manifest: ModManifest,
    pub enabled: bool,
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

/// Extract manifest from the downloaded jar and add to config.json from a .jar file
fn extract_manifest_from_jar(jar_path: &Path) -> Result<ModManifest, String> {
    println!("extract_manifest_from_jar: Opening {:?}", jar_path);
    let file = File::open(jar_path)
        .map_err(|e| format!("Failed to open jar file: {}", e))?;
    
    println!("extract_manifest_from_jar: Reading zip archive");
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read jar archive: {}", e))?;
    
    println!("extract_manifest_from_jar: Looking for manifest.json");
    let mut manifest_file = archive
        .by_name("manifest.json")
        .map_err(|e| format!("manifest.json not found in jar: {}", e))?;
    
    let mut contents = String::new();
    manifest_file
        .read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read manifest.json: {}", e))?;
    
    println!("extract_manifest_from_jar: Parsing manifest");
    serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse manifest.json: {}", e))
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
    
    serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse config.json: {}", e))
}

/// Write config.json to save directory
fn write_mod_config(save_path: &Path, config: &ModConfig) -> Result<(), String> {
    let config_path = save_path.join("config.json");
    
    let contents = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(&config_path, contents)
        .map_err(|e| format!("Failed to write config.json: {}", e))
}

#[tauri::command]
pub fn get_installed_mods(save_path: String) -> Result<Vec<InstalledMod>, String> {
    println!("get_installed_mods called with path: {}", save_path);
    let save_path = Path::new(&save_path);
    let mods_dir = save_path.join("mods");
    println!("Looking for mods in: {:?}", mods_dir);
    
    if !mods_dir.exists() {
        println!("Mods directory does not exist: {:?}", mods_dir);
        return Ok(Vec::new());
    }
    
    // Read config to get enabled/disabled state
    let config = read_mod_config(save_path)?;
    
    let mut installed_mods = Vec::new();
    
    // Read all .jar files in mods directory
    let entries = fs::read_dir(&mods_dir)
        .map_err(|e| format!("Failed to read mods directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        println!("Checking file: {:?}", path);
        
        // Check if it's a .jar file
        if path.extension().and_then(|s| s.to_str()) == Some("jar") {
            println!("Found jar file, extracting manifest...");
            match extract_manifest_from_jar(&path) {
                Ok(manifest) => {
                    println!("Successfully extracted manifest for {}", manifest.name);
                    let mod_key = format!("{}:{}", manifest.group, manifest.name);
                    let enabled = config
                        .mods
                        .get(&mod_key)
                        .map(|entry| entry.enabled)
                        .unwrap_or(!manifest.disabled_by_default);
                    
                    installed_mods.push(InstalledMod {
                        jar_name: path
                            .file_name()
                            .and_then(|s| s.to_str())
                            .unwrap_or("unknown")
                            .to_string(),
                        manifest,
                        enabled,
                    });
                }
                Err(e) => {
                    eprintln!("Failed to extract manifest from {:?}: {}", path, e);
                    // Continue with other jars
                }
            }
        }
    }
    
    println!("Found {} installed mods", installed_mods.len());
    Ok(installed_mods)
}

#[tauri::command]
pub fn toggle_mod(save_path: String, group: String, name: String, enabled: bool) -> Result<(), String> {
    let save_path = Path::new(&save_path);
    let mut config = read_mod_config(save_path)?;
    
    let mod_key = format!("{}:{}", group, name);
    config.mods.insert(
        mod_key,
        ModConfigEntry { enabled },
    );
    
    write_mod_config(save_path, &config)
}

#[tauri::command]
pub fn add_mod_to_config(save_path: String, group: String, name: String) -> Result<(), String> {
    let save_path = Path::new(&save_path);
    let mut config = read_mod_config(save_path)?;
    
    let mod_key = format!("{}:{}", group, name);
    
    // Only add if not already present
    if !config.mods.contains_key(&mod_key) {
        config.mods.insert(
            mod_key,
            ModConfigEntry { enabled: true },
        );
        
        write_mod_config(save_path, &config)?;
    }
    
    Ok(())
}

#[tauri::command]
pub fn register_jar_in_config(save_path: String, jar_filename: String) -> Result<ModManifest, String> {
    let save_path = Path::new(&save_path);
    let mods_dir = save_path.join("mods");
    let jar_path = mods_dir.join(&jar_filename);
    
    println!("Registering jar: {:?}", jar_path);
    
    if !jar_path.exists() {
        let err = format!("Jar file not found: {:?}", jar_path);
        println!("{}", err);
        return Err(err);
    }
    
    let manifest = match extract_manifest_from_jar(&jar_path) {
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
        config.mods.insert(
            mod_key,
            ModConfigEntry { enabled: true },
        );
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
pub fn delete_mod(save_path: String, group: String, name: String, jar_filename: String) -> Result<(), String> {
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
        fs::remove_file(&jar_path)
            .map_err(|e| format!("Failed to delete mod file: {}", e))?;
    }
    
    Ok(())
}
