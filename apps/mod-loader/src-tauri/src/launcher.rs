use std::path::PathBuf;
use std::process::Command;

#[cfg(target_os = "macos")]
const HYTALE_LAUNCHER_PATH: &str =
    "/Applications/Hytale Launcher.app/Contents/MacOS/hytale-launcher";

#[cfg(target_os = "windows")]
const HYTALE_LAUNCHER_PATH: &str =
    "C:\\Program Files\\Hypixel Studios\\Hytale Launcher\\hytale-launcher.exe";

#[cfg(target_os = "linux")]
const HYTALE_LAUNCHER_RELATIVE_PATH: &str =
    ".var/app/com.hypixel.HytaleLauncher/data/Hytale/hytale-launcher";

/// Get the Hytale launcher path, expanding ~ for Linux
fn get_launcher_path() -> Result<PathBuf, String> {
    #[cfg(target_os = "linux")]
    {
        let home =
            dirs::home_dir().ok_or_else(|| "Could not determine home directory".to_string())?;
        Ok(home.join(HYTALE_LAUNCHER_RELATIVE_PATH))
    }

    #[cfg(not(target_os = "linux"))]
    {
        Ok(PathBuf::from(HYTALE_LAUNCHER_PATH))
    }
}

#[tauri::command]
pub fn launch_hytale() -> Result<(), String> {
    let launcher_path = get_launcher_path()?;

    if !launcher_path.exists() {
        return Err(format!(
            "Hytale launcher not found at: {}",
            launcher_path.display()
        ));
    }

    Command::new(&launcher_path)
        .spawn()
        .map_err(|e| format!("Failed to launch Hytale: {}", e))?;

    Ok(())
}
