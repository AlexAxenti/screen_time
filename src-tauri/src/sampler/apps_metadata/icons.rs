
use std::{fs, path::Path};
use windows_icons::get_icon_by_path;

use crate::utils::paths::icon_out_path;

pub fn ensure_icon_png_from_exe(
    icons_dir: &Path,
    app_id: &str,
    exe_path: &str,
) {
    if let Err(e) = fs::create_dir_all(icons_dir) {
        eprintln!("Failed to create icons dir: {e}");
        return;
    }

    let out_path = icon_out_path(icons_dir, app_id);

    if out_path.exists() {
        return;
    }

    let icon = match get_icon_by_path(exe_path) {
        Ok(icon) => icon,
        Err(e) => {
            eprintln!("Failed to get icon for {exe_path}: {e}");
            return;
        }
    };

    if let Err(e) = icon.save(out_path) {
        eprintln!("Failed to save icon for {app_id}: {e}");
    }
}