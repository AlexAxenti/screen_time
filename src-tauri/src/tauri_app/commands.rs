use crate::{
    sql_client::reader::{
        ApplicationSortValue, 
        SortDirection, 
        query_app_titles, 
        query_app_usage, 
        query_usage_fragmentation, 
        query_usage_summary, 
        query_weeks_daily_usage
    }, 
    tauri_app::dtos::{
        AppTitlesDTO, 
        AppUsageDTO, 
        DailyUsageDTO, 
        TopUsageDTO, 
        UsageFragmentationDTO, 
        UsageSummaryDTO
    }
};

//TODO move logic to seperate file?
#[tauri::command]
pub fn get_top_usage(start_time: i64, end_time: i64, app_count: usize) -> TopUsageDTO {
    
    let sort_value = ApplicationSortValue::Duration;
    let sort_direction = SortDirection::Descending;

    let mut window_segments = query_app_usage(start_time, end_time, sort_value, sort_direction).expect("Failed to read from DB");

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
pub fn get_applications(
    start_time: i64, 
    end_time: i64, 
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
    
    let window_segments = query_app_usage(start_time, end_time, sort_value, sort_direction).expect("Failed to read from DB");
    
    window_segments
}

#[tauri::command]
pub fn get_usage_summary(start_time: i64, end_time: i64) -> UsageSummaryDTO {
    let usage_summary = query_usage_summary(start_time, end_time).expect("Failed to read from DB");

    usage_summary
}

#[tauri::command]
pub fn search_applications(query: String) -> Vec<AppTitlesDTO> {
    let app_titles = query_app_titles(query).expect("Failed to read from DB");

    app_titles
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