use crate::{
    sql_client::reader::{query_usage, query_usage_summary}, 
    tauri_app::dtos::{UsageSummaryDTO, WindowSegmentDTO}
};

#[tauri::command]
pub fn greet() -> String {
    "Hello there!".to_string()
}

#[tauri::command]
pub fn get_usage() -> Vec<WindowSegmentDTO> {
    let window_segments = query_usage().expect("Failed to read from DB");

    window_segments
}

#[tauri::command]
pub fn get_usage_summary(start_time: i64) -> UsageSummaryDTO {
    println!("Received command");
    let usage_summary = query_usage_summary(start_time).expect("Failed to read from DB");

    usage_summary
}