use serde::Serialize;

#[derive(Serialize)]
pub struct WindowSegmentDTO {
    pub window_exe: String,
    pub duration: i64,
}

#[derive(Serialize)]
pub struct UsageSummaryDTO {
    pub total_duration: i64,
    pub segments_count: i64,
    pub exe_count: i64,
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