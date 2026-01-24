export interface UsageSummary {
  total_duration: number,
  segments_count: number,
  exe_count: number,
}

export interface WindowSegment {
  window_exe: string,
  duration: number
}

export interface UsageFragmentation {
  duration_bucket: string,
  count: number
}

export interface WeeksDailyUsage {
  day_start_ms: number,
  total_duration_ms: number,
  segment_count: number,
  exe_count: number,
}