use rusqlite::params;

use crate::{sql_client::init::connect_db_file, types::{dtos::AppInfoDTO, models::{CloseBehavior, Settings}}};

//TODO clean up the two below fns
// Used for main.rs settings
pub fn query_untracked_app_ids() -> rusqlite::Result<Vec<String>> {
    let conn = connect_db_file();
    
    let mut stmt = conn.prepare("SELECT
        app_id
    FROM applications
    WHERE is_tracked = 0;")?;

    let apps_iter = stmt.query_map(params![], |row| {
       Ok(row.get(0)?)
    })?;

    let mut apps = Vec::new();
    for app in apps_iter {
        apps.push(app?);
    }

    Ok(apps)
}

// Used for command
pub fn query_untracked_apps() -> rusqlite::Result<Vec<AppInfoDTO>> {
    let conn = connect_db_file();
    
    let mut stmt = conn.prepare("SELECT
        app_id,
        exe_name,
        display_name
    FROM applications
    WHERE is_tracked = 0;")?;

    let apps_iter = stmt.query_map(params![], |row| {
        Ok(AppInfoDTO {
            app_id: row.get(0)?,
            app_exe: row.get(1)?,
            display_name: row.get(2)?
        })
    })?;

    let mut apps = Vec::new();
    for app in apps_iter {
        apps.push(app?);
    }

    Ok(apps)
}


pub fn query_settings() -> rusqlite::Result<Settings> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT 
        start_on_startup,
        close_behavior,
        idle_duration_ms,
        is_onboarded
    FROM settings")?;

    let settings = stmt.query_row(params![], |row| {
        let start_on_startup: i64 = row.get(0)?;
        let close_behavior: String = row.get(1)?;
        let is_onboarded: i64 = row.get(3)?;

        let start_on_startup: bool = start_on_startup != 0;

        let is_onboarded: bool = is_onboarded != 0;

        //TODO error handle incorrect values
        let close_behavior = match close_behavior.as_str() {
            "hide" => CloseBehavior::Hide,
            _ => CloseBehavior::Destroy,
        };

        Ok(Settings {
            start_on_startup,
            close_behavior,
            idle_duration_ms: row.get(2)?,
            is_onboarded
        })
    })?;

   Ok(settings)
}