use crate::{
    sql_client::{
        application::{ApplicationSortValue, SortDirection, query_app_usage}, 
        usage::{
            query_app_avg_time_of_day_usage, 
            query_app_overall_summary, 
            query_app_usage_summary,
            query_heat_map_values, 
            query_usage_fragmentation, 
            query_usage_summary, 
            query_weeks_daily_usage
        }
    }, 
    types::dtos::{
        AppOverallSummaryDTO,
        AppUsageSummaryDTO, 
        AvgTimeOfDayUsage, 
        DailyUsageDTO, 
        DailyUsageHeatmapDTO, 
        TopUsageDTO, 
        UsageFragmentationDTO, 
        UsageSummaryDTO
    }
};

//TODO split into domains
#[tauri::command]
pub fn get_top_usage(start_time: i64, end_time: i64, app_count: usize) -> TopUsageDTO {
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
pub fn get_usage_summary(start_time: i64, end_time: i64) -> UsageSummaryDTO {
    let usage_summary = query_usage_summary(start_time, end_time).expect("Failed to read from DB");

    usage_summary
}

#[tauri::command]
pub fn get_app_usage_summary(start_time: i64, end_time: i64, app_id: String) -> AppUsageSummaryDTO {
    let app_usage_summary = query_app_usage_summary(start_time, end_time, app_id).expect("Failed to read from DB");

    app_usage_summary
}

#[tauri::command]
pub fn get_usage_fragmentation(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<UsageFragmentationDTO> {
    let usage_fragmentation = query_usage_fragmentation(start_time, end_time, app_id).expect("Failed to read from DB");

    usage_fragmentation
}

#[tauri::command]
pub fn get_weeks_daily_usage(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<DailyUsageDTO> {
    let weeks_daily_usage = query_weeks_daily_usage(start_time, end_time, app_id).expect("Failed to read from DB");

    weeks_daily_usage
}

#[tauri::command]
pub fn get_usage_heat_map(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<DailyUsageHeatmapDTO> {
    let daily_usage = query_heat_map_values(start_time, end_time, app_id).expect("Failed to read from DB");

    daily_usage
}

#[tauri::command]
pub fn get_app_avg_time_of_day_usage(start_time: i64, end_time: i64, app_id: Option<String>) -> Vec<AvgTimeOfDayUsage> {
    let avg_usage = query_app_avg_time_of_day_usage(start_time, end_time, app_id).expect("Failed to read from DB");

    avg_usage
}

#[tauri::command]
pub fn get_app_overall_summary(app_id: String) -> AppOverallSummaryDTO {
    let summary = query_app_overall_summary(app_id).expect("Failed to read from DB");

    summary
}