use crate::{
    sql_client::reader::{
        ApplicationSortValue, SortDirection, query_app_titles, query_app_usage, query_heat_map_values, query_usage_fragmentation, query_usage_summary, query_weeks_daily_usage
    }, 
    types::dtos::{
        AppInfoDTO, AppUsageDTO, DailyUsageDTO, DailyUsageHeatmapDTO, TopUsageDTO, UsageFragmentationDTO, UsageSummaryDTO
    }
};
use tauri::{Runtime, ipc::Invoke};

pub fn handler<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        get_top_usage, 
        get_usage_summary,
        get_usage_fragmentation,
        get_weeks_daily_usage,
        get_applications,
        search_applications,
        get_usage_heat_map
    ]
}

//TODO split into domains
#[tauri::command]
fn get_top_usage(start_time: i64, end_time: i64, app_count: usize) -> TopUsageDTO {
    let sort_value = ApplicationSortValue::Duration;
    let sort_direction = SortDirection::Descending;

    let mut window_segments = query_app_usage(
        start_time, 
        end_time, 
        sort_value, 
        sort_direction,
                None,
        None,
        None,
    ).expect("Failed to read from DB");

    let total_time: i64 = window_segments.iter()
        .map(|segment| segment.duration)
        .sum();

    let max_app_count = app_count.min(window_segments.len());

    let other_window_segments = window_segments.split_off(max_app_count);

    let other_time: i64 = other_window_segments.iter()
        .map(|segment| segment.duration)
        .sum();

    let top_usage = TopUsageDTO {
        window_segments: window_segments,
        total_duration: total_time,
        other_duration: other_time,
    };

    top_usage
}

#[tauri::command]
fn get_usage_summary(start_time: i64, end_time: i64) -> UsageSummaryDTO {
    let usage_summary = query_usage_summary(start_time, end_time).expect("Failed to read from DB");

    usage_summary
}

#[tauri::command]
pub fn get_usage_fragmentation(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<UsageFragmentationDTO> {
    let usage_fragmentation = query_usage_fragmentation(start_time, end_time, app_id).expect("Failed to read from DB");

    usage_fragmentation
}

#[tauri::command]
fn get_weeks_daily_usage(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<DailyUsageDTO> {
    let weeks_daily_usage = query_weeks_daily_usage(start_time, end_time, app_id).expect("Failed to read from DB");

    weeks_daily_usage
}

#[tauri::command]
fn get_applications(
    start_time: i64, 
    end_time: i64, 
    page_count: i64,
    page_size: i64,
    search_value: Option<String>,
    sort_value: Option<String>, 
    sort_direction: Option<String>
) -> Vec<AppUsageDTO> {
    let sort_value = sort_value.unwrap_or("window_exe".to_string());
    let sort_direction = sort_direction.unwrap_or("ASC".to_string());
    
    let sort_value = if sort_value.eq_ignore_ascii_case("window_exe") {
        ApplicationSortValue::Exe
    } else {
        ApplicationSortValue::Duration
    };
    
    let sort_direction = if sort_direction.eq_ignore_ascii_case("ASC") {
        SortDirection::Ascending
    } else {
        SortDirection::Descending
    };
    
    let window_segments = query_app_usage(
        start_time, 
        end_time, 
        sort_value, 
        sort_direction,
        Some(page_count),
        Some(page_size),
        search_value,
    ).expect("Failed to read from DB");
    
    window_segments
}

#[tauri::command]
fn search_applications(query: String) -> Vec<AppInfoDTO> {
    let app_titles = query_app_titles(query).expect("Failed to read from DB");

    app_titles
}

#[tauri::command]
fn get_usage_heat_map(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<DailyUsageHeatmapDTO> {
    let daily_usage = query_heat_map_values(start_time, end_time, app_id).expect("Failed to read from DB");

    daily_usage
}