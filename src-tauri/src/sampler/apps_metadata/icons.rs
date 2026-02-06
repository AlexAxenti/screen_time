
use std::{fs, path::Path};
use windows_icons::get_icon_by_path;

use crate::utils::paths::icon_out_path;

pub fn ensure_icon_png_from_exe(
    icons_dir: &Path,
    app_id: &str,
    exe_path: &str,
) {
    fs::create_dir_all(icons_dir).expect("Failed to create icons dir");

    let out_path = icon_out_path(icons_dir, app_id);

    if out_path.exists() {
        return;
    }

    let icon = get_icon_by_path(exe_path).expect("Failed to get icon");

    icon.save(out_path).expect("Failed to save icon");
}