use crate::{
    ControlMsg, 
    sql_client::{
        reader::{
            query_settings, query_untracked_apps
        }, 
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
    let apps = query_untracked_apps().expect("Failed to read from DB");

    apps
}


#[tauri::command]
pub fn set_app_tracked(state: State<AppState>, app_id: String, is_tracked: bool) -> bool {
    update_application_tracked(&app_id, is_tracked);

    state.tx_control
        .send(ControlMsg::SetTracked { app_id, is_tracked })
        .expect("Failed to send toggle app msg");

    true
}


#[tauri::command]
pub fn get_application_settings() -> Settings {
    let settings = query_settings().expect("Failed to read from DB");

    settings
}

#[tauri::command]
pub fn update_settings(state: State<AppState>, settings: Settings) -> bool {
    update_settings_db(&settings);

    let mut runtime_settings = state.runtime_settings.lock().expect("Failed to edit runtim settings");

    runtime_settings.close_behavior = settings.close_behavior;

    if runtime_settings.start_on_startup != settings.start_on_startup {
        configure_start_on_startup(settings.start_on_startup).expect("Failed to set run on startup");

        runtime_settings.start_on_startup = settings.start_on_startup;
    }

    true
}