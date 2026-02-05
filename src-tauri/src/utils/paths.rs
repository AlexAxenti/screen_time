use std::path::{PathBuf};

use directories_next::ProjectDirs;

pub fn local_data_dir() -> PathBuf {
    let proj_dir = ProjectDirs::from("com", "screen_time", "screen_time")
        .expect("Failed to connect to db file");

    let app_data_dir = proj_dir.data_local_dir().to_path_buf();

    app_data_dir
}

pub fn icons_dir() -> PathBuf {
    let local_dir = local_data_dir();

    let icons_dir = local_dir.join("icons");

    icons_dir
}