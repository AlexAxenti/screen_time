export interface ApplicationInfo {
	app_id: string;
	app_exe: string;
	display_name: string;
}

export interface ApplicationMetadata {
	app_info: ApplicationInfo;
	is_tracked: boolean;
}

export type CloseBehavior = "hide" | "destroy";

export interface Settings {
	start_on_startup: boolean;
	close_behavior: CloseBehavior;
	idle_duration_ms: number;
}

export interface ApplicationUsage {
	app_info: ApplicationInfo;
	duration: number;
	segment_count: number;
}

export interface PagedAppSearch {
	apps_usage: ApplicationUsage[];
	total: number;
}

export interface TopUsage {
	window_segments: ApplicationUsage[];
	total_duration: number;
	other_duration: number;
}

export interface UsageSummary {
	total_duration: number;
	segments_count: number;
	exe_count: number;
}

export interface AppUsageSummary {
	total_duration: number;
	segments_count: number;
	avg_segment_duration: number;
}

export interface UsageFragmentation {
	duration_bucket: string;
	count: number;
}

export interface WeeksDailyUsage {
	day_start_ms: number;
	total_duration_ms: number;
	segment_count: number;
	exe_count: number;
}

export interface AvgTimeOfDayUsage {
	hour: number;
	total_duration_ms: number;
	avg_ms_per_hour_of_day: number;
}