export interface UsageSummary {
  total_duration: number,
  segments_count: number,
  exe_count: number,
}

export interface WindowSegment {
  window_exe: string,
  duration: number
}