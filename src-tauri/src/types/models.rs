use std::time::{Duration, SystemTime};

use serde::{Deserialize, Serialize};

pub struct WindowSegment {
    pub app_id: String,
    pub window_name: String,
    pub window_exe: String,
    pub focus_start_time: SystemTime,
    pub focus_end_time: Option<SystemTime>,
}

impl WindowSegment {
    pub fn new(app_id:String, window_name: String, window_exe: String, focus_start_time: SystemTime) -> WindowSegment {
        Self {
            app_id,
            window_name,
            window_exe,
            focus_start_time,
            focus_end_time: None
        }
    }

    pub fn finalize(&mut self, focus_end_time: SystemTime) {
        self.focus_end_time = Some(focus_end_time);
    }

    pub fn duration(&self) -> Option<Duration> {
        self.focus_end_time.and_then(|end_time| end_time.duration_since(self.focus_start_time).ok())
    }
}

pub enum ControlMsg {
    Pause,
    Resume,
    Shutdown,
    SetTracked { app_id: String, is_tracked: bool }
}

pub struct AppInfo {
    pub app_id: String,
    pub app_exe_path: String,
    pub app_exe_name: String
}

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub start_on_startup: bool,
    pub close_behavior: CloseBehavior,
    pub idle_duration_ms: i64,
    pub is_onboarded: bool,
}

pub struct TauriRuntimeSettings {
    pub close_behavior: CloseBehavior,
    pub start_on_startup: bool,
    pub is_onboarded: bool
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CloseBehavior {
    Hide,
    Destroy
}

pub struct SchemaMigration {
    pub migration_version: i64,
    pub migration_name: &'static str,
    pub migration_sql: &'static str,
}