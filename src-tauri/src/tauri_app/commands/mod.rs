mod settings;
mod applications;
mod usage;

use tauri::{Runtime, ipc::Invoke};

use super::AppState;

pub fn handler<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        settings::get_untracked_apps,
        settings::set_app_tracked,
        settings::get_application_settings,
        settings::update_settings,

        applications::get_application_metadata,
        applications::get_applications_list,
        applications::search_application_titles,

        usage::get_top_usage,
        usage::get_usage_summary,
        usage::get_app_usage_summary,
        usage::get_usage_fragmentation,
        usage::get_weeks_daily_usage,
        usage::get_usage_heat_map,
        usage::get_app_avg_time_of_day_usage
    ]
}
