use crate::{
    sql_client::reader::{
        ApplicationSortValue, SortDirection, query_app_metadata, query_app_titles, query_app_usage, query_app_usage_total
    }, 
    types::dtos::{AppInfoDTO, AppMetadataDTO, PagedAppSearchDTO}};

#[tauri::command]
pub fn get_application_metadata(app_id: String) -> AppMetadataDTO {
    let app_metadata = query_app_metadata(&app_id).expect("Failed to read from DB");

    app_metadata
}

//TODO naming abiguous
#[tauri::command]
pub fn get_applications_list(
    start_time: i64, 
    end_time: i64, 
    page_count: i64,
    page_size: i64,
    search_value: Option<String>,
    sort_value: Option<String>, 
    sort_direction: Option<String>
) -> PagedAppSearchDTO {
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
        search_value.clone(),
    ).expect("Failed to read from DB");

    let total_count = query_app_usage_total(start_time, end_time, search_value).expect("Failed to read from DB");
    
    PagedAppSearchDTO { apps_usage: window_segments, total: total_count }
}

// todo naming ambiguous
#[tauri::command]
pub fn search_application_titles(query: String, tracked: Option<bool>) -> Vec<AppInfoDTO> {
    let app_titles = query_app_titles(query, tracked).expect("Failed to read from DB");

    app_titles
}