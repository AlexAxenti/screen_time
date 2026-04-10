use serde::Serialize;

//TODO instead of derive default, properly handle errors across IPC
#[derive(Serialize, Default)]
pub struct AppInfoDTO {
    pub app_id: String,
    pub app_exe: String,
    pub display_name: String
}

#[derive(Serialize, Default)]
pub struct AppMetadataDTO {
    pub app_info: AppInfoDTO,
    pub is_tracked: bool
}

#[derive(Serialize, Default)]
pub struct AppUsageDTO {
    pub app_info: AppInfoDTO,
    pub duration: i64,
    pub segment_count: i64,
}

#[derive(Serialize, Default)]
pub struct PagedAppSearchDTO {
    pub apps_usage: Vec<AppUsageDTO>,
    pub total: i64
}

#[derive(Serialize, Default)]
pub struct TopUsageDTO {
    pub window_segments: Vec<AppUsageDTO>,
    pub other_duration: i64,
    pub total_duration: i64
}

#[derive(Serialize, Default)]
pub struct UsageSummaryDTO {
    pub total_duration: i64,
    pub segments_count: i64,
    pub exe_count: i64,
}

#[derive(Serialize, Default)]
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

#[derive(Serialize)]
pub struct AvgTimeOfDayUsage {
    pub hour: i64,
    pub total_duration_ms: i64,
    pub avg_ms_per_hour_of_day: i64
}

#[derive(Serialize, Default)]
pub struct AppOverallSummaryDTO {
    pub total_duration_ms: i64,
    pub first_used_ms: Option<i64>,
    pub last_used_ms: Option<i64>,
}