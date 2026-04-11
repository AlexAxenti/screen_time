use crate::{
    ControlMsg, 
    sql_client::{
        settings::{query_settings, query_untracked_apps}, 
        writer::{
            update_application_tracked, 
            update_settings as update_settings_db
        }
    }, 
    tauri_app::startup::configure_start_on_startup, 
    types::{dtos::AppInfoDTO, models::Settings}
};
use tauri::{State};

use super::AppState;

#[tauri::command]
pub fn get_untracked_apps() -> Vec<AppInfoDTO> {
    match query_untracked_apps() {
        Ok(apps) => apps,
        Err(e) => {
            eprintln!("get_untracked_apps failed: {e}");
            Vec::new()
        }
    }
}


#[tauri::command]
pub fn set_app_tracked(state: State<AppState>, app_id: String, is_tracked: bool) -> bool {
    if let Err(e) = update_application_tracked(&app_id, is_tracked) {
        eprintln!("set_app_tracked DB update failed: {e}");
        return false;
    }

    if let Err(e) = state.tx_control
        .send(ControlMsg::SetTracked { app_id, is_tracked }) {
        eprintln!("Failed to send toggle app msg: {e}");
        return false;
    }

    true
}


#[tauri::command]
pub fn get_application_settings() -> Settings {
    match query_settings() {
        Ok(settings) => settings,
        Err(e) => {
            eprintln!("get_application_settings failed: {e}");
            Settings::default()
        }
    }
}

#[tauri::command]
pub fn update_settings(state: State<AppState>, settings: Settings) -> bool {
    if let Err(e) = update_settings_db(&settings) {
        eprintln!("update_settings DB write failed: {e}");
        return false;
    }

    let mut runtime_settings = match state.runtime_settings.lock() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to lock runtime settings: {e}");
            return false;
        }
    };

    runtime_settings.close_behavior = settings.close_behavior;

    if runtime_settings.start_on_startup != settings.start_on_startup {
        if let Err(e) = configure_start_on_startup(settings.start_on_startup) {
            eprintln!("Failed to set run on startup: {e}");
        }

        runtime_settings.start_on_startup = settings.start_on_startup;
    }

    true
}