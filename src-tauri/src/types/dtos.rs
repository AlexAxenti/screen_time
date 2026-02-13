use serde::Serialize;

#[derive(Serialize)]
pub struct AppInfoDTO {
    pub app_id: String,
    pub app_exe: String,
    pub display_name: String
}

#[derive(Serialize)]
pub struct AppUsageDTO {
    pub app_info: AppInfoDTO,
    pub duration: i64,
    pub segment_count: i64,
}

#[derive(Serialize)]
pub struct TopUsageDTO {
    pub window_segments: Vec<AppUsageDTO>,
    pub other_duration: i64,
    pub total_duration: i64
}

#[derive(Serialize)]
pub struct UsageSummaryDTO {
    pub total_duration: i64,
    pub segments_count: i64,
    pub exe_count: i64,
}

#[derive(Serialize)]
pub struct AppUsageSummaryDTO {
    pub total_duration: i64,
    pub segments_count: i64,
    pub avg_segment_duration: i64,
}

#[derive(Serialize)]
pub struct UsageFragmentationDTO {
    pub duration_bucket: String,
    pub count: i64,
}

#[derive(Serialize)]
pub struct DailyUsageDTO {
    pub day_start_ms: i64,
    pub total_duration_ms: i64,
    pub segment_count: i64,
    pub exe_count: i64
}

//TODO combine with above?
#[derive(Serialize)]
pub struct DailyUsageHeatmapDTO {
    pub day_start_ms: i64,
    pub total_duration_ms: i64,
}