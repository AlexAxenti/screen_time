use rusqlite::{params};
use crate::{
    sql_client::init::connect_db_file, 
    tauri_app::dtos::{UsageFragmentationDTO, UsageSummaryDTO, WindowSegmentDTO}
};

pub fn query_usage_summary(start_time: i64) -> rusqlite::Result<UsageSummaryDTO> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT 
            COALESCE(SUM(duration_ms), 0) AS total_duration,
            COUNT(*) AS segments_count, 
            COUNT(DISTINCT window_exe) AS exe_count
        FROM window_segments 
        WHERE start_time > ?1")?;

    let summary = stmt.query_row(params![start_time], |row| {
        Ok(UsageSummaryDTO {
            total_duration: row.get(0)?,
            segments_count: row.get(1)?,
            exe_count: row.get(2)?,
        })
    });

    summary
}

pub fn query_top_usage(start_time: i64) -> rusqlite::Result<Vec<WindowSegmentDTO>> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT 
        window_exe, 
        SUM(duration_ms) AS duration
    FROM window_segments
    WHERE start_time > ?1
    GROUP BY window_exe
    ORDER BY duration DESC;")?;

    let segment_iter = stmt.query_map(params![start_time], |row| {
        Ok(WindowSegmentDTO {
            window_exe: row.get(0)?,
            duration: row.get(1)?
        })
    })?;

    let mut segments = Vec::new();
    for segment in segment_iter {
        segments.push(segment?);
    }

    Ok(segments)
}

pub fn query_usage_fragmentation(start_time: i64) -> rusqlite::Result<Vec<UsageFragmentationDTO>> {
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
    WHERE start_time > ?1
    GROUP BY duration_bucket, bucket_order
    ORDER BY bucket_order;")?;

    let fragmentation_iter = stmt.query_map(params![start_time], |row| {
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

