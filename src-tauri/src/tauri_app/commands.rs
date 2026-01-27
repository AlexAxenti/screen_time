use crate::{
    sql_client::reader::{query_top_usage, query_usage_fragmentation, query_usage_summary, query_weeks_daily_usage}, 
    tauri_app::dtos::{DailyUsageDTO, TopUsageDTO, UsageFragmentationDTO, UsageSummaryDTO}
};

//TODO move logic to seperate file
#[tauri::command]
pub fn get_top_usage(start_time: i64, end_time: i64, app_count: usize) -> TopUsageDTO {
    let mut window_segments = query_top_usage(start_time, end_time).expect("Failed to read from DB");

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
pub fn get_usage_summary(start_time: i64, end_time: i64) -> UsageSummaryDTO {
    let usage_summary = query_usage_summary(start_time, end_time).expect("Failed to read from DB");

    usage_summary
}

#[tauri::command]
pub fn get_usage_fragmentation(start_time: i64, end_time: i64) -> Vec<UsageFragmentationDTO> {
    let usage_fragmentation = query_usage_fragmentation(start_time, end_time).expect("Failed to read from DB");

    usage_fragmentation
}

#[tauri::command]
pub fn get_weeks_daily_usage(start_time: i64, end_time: i64) -> Vec<DailyUsageDTO> {
    let weeks_daily_usage = query_weeks_daily_usage(start_time, end_time).expect("Failed to read from DB");

    weeks_daily_usage
}