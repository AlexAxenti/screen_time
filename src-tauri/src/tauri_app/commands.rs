use crate::{
    sql_client::reader::{query_top_usage, query_usage_fragmentation, query_usage_summary}, 
    tauri_app::dtos::{UsageFragmentationDTO, UsageSummaryDTO, WindowSegmentDTO}
};

#[tauri::command]
pub fn get_top_usage(start_time: i64) -> Vec<WindowSegmentDTO> {
    let window_segments = query_top_usage(start_time).expect("Failed to read from DB");

    window_segments
}

#[tauri::command]
pub fn get_usage_summary(start_time: i64) -> UsageSummaryDTO {
    let usage_summary = query_usage_summary(start_time).expect("Failed to read from DB");

    usage_summary
}

#[tauri::command]
pub fn get_usage_fragmentation(start_time: i64) -> Vec<UsageFragmentationDTO> {
    let usage_fragmentation = query_usage_fragmentation(start_time).expect("Failed to read from DB");

    usage_fragmentation
}