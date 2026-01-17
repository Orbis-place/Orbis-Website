mod launcher;
mod mods;
mod saves;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            mods::get_installed_mods,
            mods::add_mod_to_config,
            mods::register_jar_in_config,
            mods::delete_mod,
            mods::get_global_mods,
            mods::delete_global_mod,
            mods::install_modpack,
            saves::import_save,
            launcher::launch_hytale
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
