use std::fs;
use std::path::{Path, PathBuf};
use zip::ZipArchive;

#[tauri::command]
pub fn import_save(zip_path: String, hytale_path: String) -> Result<String, String> {
    println!("import_save called with zip_path: {} and hytale_path: {}", zip_path, hytale_path);
    
    // Construct the saves directory path from the provided Hytale root
    let saves_dir = PathBuf::from(hytale_path)
        .join("UserData")
        .join("Saves");
    
    println!("Saves directory: {:?}", saves_dir);
    
    // Get save name from ZIP filename (without .zip extension)
    let zip_file_path = Path::new(&zip_path);
    let save_name = zip_file_path
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or("Invalid ZIP filename")?
        .to_string();
    
    println!("Save name from ZIP: {}", save_name);
    
    // Create the target directory for this save
    let target_dir = saves_dir.join(&save_name);
    
    // Check if save already exists
    if target_dir.exists() {
        return Err(format!("Save '{}' already exists", save_name));
    }
    
    fs::create_dir_all(&target_dir)
        .map_err(|e| format!("Failed to create save directory: {}", e))?;
    
    println!("Created target directory: {:?}", target_dir);
    
    // Open the ZIP file
    let file = fs::File::open(&zip_path)
        .map_err(|e| format!("Failed to open ZIP file: {}", e))?;
    
    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read ZIP archive: {}", e))?;
    
    // Extract all files directly into the target directory
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Failed to read file at index {}: {}", i, e))?;
        
        // Get the file path from the ZIP
        let file_path = match file.enclosed_name() {
            Some(path) => path.to_path_buf(),
            None => continue,
        };
        
        // Target path: saves_dir/save_name/file_path
        let outpath = target_dir.join(&file_path);
        
        // Check if it's a directory
        if file.name().ends_with('/') || file.is_dir() {
            println!("Creating directory: {:?}", outpath);
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        } else {
            // It's a file
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)
                        .map_err(|e| format!("Failed to create parent directory: {}", e))?;
                }
            }
            
            // Skip if path is a directory
            if outpath.exists() && outpath.is_dir() {
                println!("Skipping directory that looks like a file: {:?}", outpath);
                continue;
            }
            
            println!("Extracting file: {:?}", outpath);
            let mut outfile = fs::File::create(&outpath)
                .map_err(|e| format!("Failed to create file {:?}: {}", outpath, e))?;
            std::io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to extract file: {}", e))?;
        }
    }
    
    println!("Successfully imported save: {}", save_name);
    Ok(save_name)
}
