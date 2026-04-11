mod display_name;
mod icons;

use std::sync::mpsc::Receiver;
use crate::{
    AppInfo, 
    sampler::apps_metadata::{display_name::get_exe_display_name_from_version_info, icons::ensure_icon_png_from_exe}, 
    sql_client::{application::check_for_application, writer::save_application_to_db}, 
    utils::paths::icons_dir
};

pub fn start(rx_apps: Receiver<AppInfo>) {
    while let Ok(app) = rx_apps.recv() {
        ensure_app_exists(app);    
    }
}

fn ensure_app_exists(app: AppInfo) {
    let app_id = &app.app_id;
    let app_exe_path = &app.app_exe_path;
    let app_exe_name = &app.app_exe_name;

    let app_exists = match check_for_application(app_id) {
        Ok(exists) => exists,
        Err(e) => {
            eprintln!("Failed to check if app exists ({}): {e}", app_id);
            return;
        }
    };

    // If not exists, write to db
    if !app_exists {
        let display_name = match get_exe_display_name_from_version_info(app_exe_path) {
            Ok(Some(name)) => name,
            Ok(None) => app.app_exe_name.clone(),
            Err(e) => {
                eprintln!("Failed to get exe display name for {}: {e}", app_exe_path);
                app.app_exe_name.clone()
            }
        };

        let icons_dir = icons_dir();

        ensure_icon_png_from_exe(
            &icons_dir, 
            app_id, 
            app_exe_path, 
        );

        println!("App display name found: {}", display_name);

        if let Err(e) = save_application_to_db(app_id, app_exe_path, app_exe_name, &display_name) {
            eprintln!("Failed to save application to DB ({}): {e}", app_id);
        }
    }
}

