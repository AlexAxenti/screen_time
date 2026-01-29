use rusqlite::{params};
use crate::{
    sql_client::init::connect_db_file, 
    tauri_app::dtos::{AppTitlesDTO, AppUsageDTO, DailyUsageDTO, UsageFragmentationDTO, UsageSummaryDTO}
};

pub fn query_usage_summary(start_time: i64, end_time: i64) -> rusqlite::Result<UsageSummaryDTO> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT 
            COALESCE(SUM(duration_ms), 0) AS total_duration,
            COUNT(*) AS segments_count, 
            COUNT(DISTINCT window_exe) AS exe_count
        FROM window_segments 
        WHERE start_time >= ?1 AND start_time < ?2")?;

    let summary = stmt.query_row(params![start_time, end_time], |row| {
        Ok(UsageSummaryDTO {
            total_duration: row.get(0)?,
            segments_count: row.get(1)?,
            exe_count: row.get(2)?,
        })
    });

    summary
}

pub enum SortDirection {
    Ascending,
    Descending,
}

pub enum ApplicationSortValue {
    Duration,
    Exe,
}

//TODO rename from WindowSegmentDTO
pub fn query_app_usage(
    start_time: i64, 
    end_time: i64, 
    sort_value: ApplicationSortValue, 
    sort_direction: SortDirection
) -> rusqlite::Result<Vec<AppUsageDTO>> {
    let conn = connect_db_file();
    
    let sort_direction = match sort_direction {
        SortDirection::Ascending => "ASC",
        SortDirection::Descending => "DESC"
    };
    
    let order_by_clause = match sort_value {
        ApplicationSortValue::Duration => format!("ORDER BY duration {}, window_exe COLLATE NOCASE {}", sort_direction, sort_direction),
        _ => format!("ORDER BY window_exe COLLATE NOCASE {}, duration {}", sort_direction, sort_direction)
    };
    
    let init_stmt = "SELECT 
        window_exe, 
        SUM(duration_ms) AS duration,
        COUNT(*) AS segment_count
    FROM window_segments
    WHERE start_time >= ?1 AND start_time < ?2
    GROUP BY window_exe";
    
    let stmt_str = format!("{} {}", init_stmt, order_by_clause);
    
    let mut stmt = conn.prepare(&stmt_str)?;

    let segment_iter = stmt.query_map(params![start_time, end_time], |row| {
        Ok(AppUsageDTO {
            window_exe: row.get(0)?,
            duration: row.get(1)?,
            segment_count: row.get(2)?
        })
    })?;

    let mut segments = Vec::new();
    for segment in segment_iter {
        segments.push(segment?);
    }

    Ok(segments)
}

pub fn query_usage_fragmentation(start_time: i64, end_time: i64) -> rusqlite::Result<Vec<UsageFragmentationDTO>> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT
    CASE
        WHEN duration_ms < 60000   THEN 'lt_1m'
        WHEN duration_ms < 120000  THEN '1_2m'
        WHEN duration_ms < 300000  THEN '2_5m'
        WHEN duration_ms < 900000  THEN '5_15m'
        WHEN duration_ms < 3600000 THEN '15_60m'
        ELSE '60m_plus'
    END AS duration_bucket,
    CASE
        WHEN duration_ms < 60000   THEN 1
        WHEN duration_ms < 120000  THEN 2
        WHEN duration_ms < 300000  THEN 3
        WHEN duration_ms < 900000  THEN 4
        WHEN duration_ms < 3600000 THEN 5
        ELSE 6
    END AS bucket_order,
    COUNT(*) AS count
    FROM window_segments
    WHERE start_time >= ?1 AND start_time < ?2
    GROUP BY duration_bucket, bucket_order
    ORDER BY bucket_order;")?;

    let fragmentation_iter = stmt.query_map(params![start_time, end_time], |row| {
        Ok(UsageFragmentationDTO {
            duration_bucket: row.get(0)?,
            count: row.get(2)?
        })
    })?;

    let mut buckets = Vec::new();
    for bucket in fragmentation_iter {
        buckets.push(bucket?);
    }

    Ok(buckets)
}

pub fn query_weeks_daily_usage(start_time: i64, end_time: i64) -> rusqlite::Result<Vec<DailyUsageDTO>> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT
    date(start_time / 1000, 'unixepoch', 'localtime') AS day,
    CAST(strftime('%s', date(start_time / 1000, 'unixepoch', 'localtime')) AS INTEGER) * 1000
        AS day_start_ms,

    SUM(duration_ms) AS total_duration_ms,
    COUNT(*) AS segment_count,
    COUNT(DISTINCT window_exe) AS unique_exes
    FROM window_segments
    WHERE start_time >= ?1
    AND start_time <  ?2
    AND duration_ms IS NOT NULL
    AND duration_ms > 0
    GROUP BY day
    ORDER BY day;")?;

    let usage_iter = stmt.query_map(params![start_time, end_time], |row| {
        Ok(DailyUsageDTO {
            day_start_ms: row.get(1)?,
            total_duration_ms: row.get(2)?,
            segment_count: row.get(3)?,
            exe_count: row.get(4)?
        })
    })?;

    let mut daily_usage = Vec::new();
    for day in usage_iter {
        daily_usage.push(day?);
    }

    Ok(daily_usage)
}

pub fn query_app_titles(
    query: String
) -> rusqlite::Result<Vec<AppTitlesDTO>> {
    let conn = connect_db_file();
    
    let mut stmt = conn.prepare("SELECT 
        DISTINCT window_exe
    FROM window_segments
    WHERE window_exe LIKE '%' || ?1 || '%'
    ORDER BY window_exe COLLATE NOCASE ASC
    LIMIT 6")?;

    let apps_iter = stmt.query_map(params![query], |row| {
        Ok(AppTitlesDTO {
            window_exe: row.get(0)?
        })
    })?;

    let mut apps = Vec::new();
    for app in apps_iter {
        apps.push(app?);
    }

    Ok(apps)
}