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
    pub description: String,
    #[serde(rename = "Authors")]
    pub authors: Vec<ModAuthor>,
    #[serde(rename = "Website")]
    pub website: Option<String>,
    #[serde(rename = "ServerVersion")]
    pub server_version: String,
    #[serde(rename = "Dependencies")]
    pub dependencies: HashMap<String, String>,
    #[serde(rename = "OptionalDependencies")]
    pub optional_dependencies: HashMap<String, String>,
    #[serde(rename = "DisabledByDefault")]
    pub disabled_by_default: bool,
    #[serde(rename = "Main")]
    pub main: String,
    #[serde(rename = "IncludesAssetPack")]
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

/// Extract manifest.json from a .jar file
fn extract_manifest_from_jar(jar_path: &Path) -> Result<ModManifest, String> {
    let file = File::open(jar_path)
        .map_err(|e| format!("Failed to open jar file: {}", e))?;
    
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read jar archive: {}", e))?;
    
    let mut manifest_file = archive
        .by_name("manifest.json")
        .map_err(|e| format!("manifest.json not found in jar: {}", e))?;
    
    let mut contents = String::new();
    manifest_file
        .read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read manifest.json: {}", e))?;
    
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
    let save_path = Path::new(&save_path);
    let mods_dir = save_path.join("mods");
    
    if !mods_dir.exists() {
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
        
        // Check if it's a .jar file
        if path.extension().and_then(|s| s.to_str()) == Some("jar") {
            match extract_manifest_from_jar(&path) {
                Ok(manifest) => {
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
