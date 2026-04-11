use std::path::{Path, PathBuf};

use directories_next::ProjectDirs;

pub fn local_data_dir() -> PathBuf {
    let proj_dir = match ProjectDirs::from("com", "screen_time", "screen_time") {
        Some(dir) => dir,
        None => {
            //TODO this should probably panic
            eprintln!("Failed to resolve local data directory");
            panic!("Failed to resolve local data directory");
        }
    };

    let app_data_dir = proj_dir.data_local_dir().to_path_buf();

    app_data_dir
}

pub fn icons_dir() -> PathBuf {
    let local_dir = local_data_dir();

    let icons_dir = local_dir.join("icons");

    icons_dir
}

pub fn icon_out_path(icons_dir: &Path, app_id: &str) -> PathBuf {
    icons_dir.join(format!("{app_id}.png"))
}
