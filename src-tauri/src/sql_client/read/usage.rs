use rusqlite::params;

use crate::{
    sql_client::init::connect_db_file, 
    types::dtos::{
        AppOverallSummaryDTO, 
        AppUsageSummaryDTO, 
        AvgTimeOfDayUsage, 
        DailyUsageDTO, 
        DailyUsageHeatmapDTO, 
        UsageFragmentationDTO, 
        UsageSummaryDTO
    }
};


pub fn query_usage_summary(start_time: i64, end_time: i64) -> rusqlite::Result<UsageSummaryDTO> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT 
            COALESCE(SUM(MIN(end_time, ?2) - MAX(start_time, ?1)), 0) AS total_duration,
            COUNT(*) AS segments_count, 
            COUNT(DISTINCT window_exe) AS exe_count
        FROM window_segments 
        WHERE start_time < ?2 AND end_time > ?1")?;

    let summary = stmt.query_row(params![start_time, end_time], |row| {
        Ok(UsageSummaryDTO {
            total_duration: row.get(0)?,
            segments_count: row.get(1)?,
            exe_count: row.get(2)?,
        })
    });

    summary
}

pub fn query_app_usage_summary(start_time: i64, end_time: i64, app_id: String) -> rusqlite::Result<AppUsageSummaryDTO> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT
        COALESCE(SUM(MIN(ws.end_time, ?2) - MAX(ws.start_time, ?1)), 0) AS total_duration_ms,
        COALESCE(COUNT(*), 0) AS segment_count,
        COALESCE(
            CAST(AVG(MIN(ws.end_time, ?2) - MAX(ws.start_time, ?1)) AS INTEGER),
            0
        ) AS avg_segment_duration_ms
        FROM window_segments ws
        WHERE ws.start_time < ?2
            AND ws.end_time > ?1
            AND ws.duration_ms > 0
            AND (?3 = '' OR ws.app_id = ?3);")?;

    let summary = stmt.query_row(params![start_time, end_time, app_id], |row| {
        Ok(AppUsageSummaryDTO {
            total_duration: row.get(0)?,
            segments_count: row.get(1)?,
            avg_segment_duration: row.get(2)?
        })
    });

    summary
}

pub fn query_usage_fragmentation(start_time: i64, end_time: i64, app_id: Option<String>) -> rusqlite::Result<Vec<UsageFragmentationDTO>> {
    let conn = connect_db_file();

    let app_id = app_id.unwrap_or_default();

    let mut stmt = conn.prepare("WITH clamped AS (
        SELECT
            MIN(end_time, ?2) - MAX(start_time, ?1) AS clamped_duration_ms
        FROM window_segments
        WHERE start_time < ?2
            AND end_time > ?1
            AND (?3 = '' OR app_id = ?3)
    )
    SELECT
    CASE
        WHEN clamped_duration_ms < 60000   THEN 'lt_1m'
        WHEN clamped_duration_ms < 120000  THEN '1_2m'
        WHEN clamped_duration_ms < 300000  THEN '2_5m'
        WHEN clamped_duration_ms < 900000  THEN '5_15m'
        WHEN clamped_duration_ms < 3600000 THEN '15_60m'
        ELSE '60m_plus'
    END AS duration_bucket,
    CASE
        WHEN clamped_duration_ms < 60000   THEN 1
        WHEN clamped_duration_ms < 120000  THEN 2
        WHEN clamped_duration_ms < 300000  THEN 3
        WHEN clamped_duration_ms < 900000  THEN 4
        WHEN clamped_duration_ms < 3600000 THEN 5
        ELSE 6
    END AS bucket_order,
    COUNT(*) AS count
    FROM clamped
    GROUP BY duration_bucket, bucket_order
    ORDER BY bucket_order;")?;

    let fragmentation_iter = stmt.query_map(params![start_time, end_time, app_id], |row| {
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

pub fn query_weeks_daily_usage(start_time: i64, end_time: i64, app_id: Option<String>) -> rusqlite::Result<Vec<DailyUsageDTO>> {
    let conn = connect_db_file();

    let app_id = app_id.unwrap_or_default();

    let mut stmt = conn.prepare("WITH RECURSIVE day_buckets AS (
        SELECT
            date(?1 / 1000, 'unixepoch', 'localtime') AS day_local,
            CAST(strftime('%s', date(?1 / 1000, 'unixepoch', 'localtime') || ' 00:00:00', 'utc') AS INTEGER) * 1000 AS day_start_ms,
            CAST(strftime('%s', date(?1 / 1000, 'unixepoch', 'localtime', '+1 day') || ' 00:00:00', 'utc') AS INTEGER) * 1000 AS day_end_ms

        UNION ALL

        SELECT
            date(day_local, '+1 day'),
            day_end_ms,
            CAST(strftime('%s', date(day_local, '+2 day') || ' 00:00:00', 'utc') AS INTEGER) * 1000
        FROM day_buckets
        WHERE day_end_ms < ?2
    ),
    clipped_days AS (
        SELECT
            day_local,
            day_start_ms,
            day_end_ms,
            CASE
                WHEN day_start_ms < ?1 THEN ?1
                ELSE day_start_ms
            END AS bucket_start_ms,
            CASE
                WHEN day_end_ms > ?2 THEN ?2
                ELSE day_end_ms
            END AS bucket_end_ms
        FROM day_buckets
        WHERE day_start_ms < ?2
        AND day_end_ms > ?1
    )
    SELECT
        clipped_days.day_local AS day,
        clipped_days.day_start_ms,
        COALESCE(SUM(
            MIN(ws.end_time, clipped_days.bucket_end_ms) -
            MAX(ws.start_time, clipped_days.bucket_start_ms)
        ), 0) AS total_duration_ms,
        COUNT(ws.id) AS segment_count,
        COUNT(DISTINCT ws.window_exe) AS unique_exes
    FROM clipped_days
    LEFT JOIN window_segments ws
        ON ws.start_time < clipped_days.bucket_end_ms
    AND ws.end_time > clipped_days.bucket_start_ms
    AND ws.duration_ms IS NOT NULL
    AND ws.duration_ms > 0
    AND (?3 = '' OR ws.app_id = ?3)
    GROUP BY clipped_days.day_local, clipped_days.day_start_ms
    ORDER BY clipped_days.day_start_ms;")?;

    let usage_iter = stmt.query_map(params![start_time, end_time, app_id], |row| {
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


pub fn query_heat_map_values(start_time: i64, end_time: i64, app_id: Option<String>) -> rusqlite::Result<Vec<DailyUsageHeatmapDTO>> {
    let conn = connect_db_file();

    let app_id = app_id.unwrap_or_default();

    let mut stmt = conn.prepare("WITH RECURSIVE day_buckets AS (
        SELECT
            date(?1 / 1000, 'unixepoch', 'localtime') AS day_local,
            CAST(strftime('%s', date(?1 / 1000, 'unixepoch', 'localtime') || ' 00:00:00', 'utc') AS INTEGER) * 1000 AS day_start_ms,
            CAST(strftime('%s', date(?1 / 1000, 'unixepoch', 'localtime', '+1 day') || ' 00:00:00', 'utc') AS INTEGER) * 1000 AS day_end_ms

        UNION ALL

        SELECT
            date(day_local, '+1 day'),
            day_end_ms,
            CAST(strftime('%s', date(day_local, '+2 day') || ' 00:00:00', 'utc') AS INTEGER) * 1000
        FROM day_buckets
        WHERE day_end_ms < ?2
    ),
    clipped_days AS (
        SELECT
            day_local,
            day_start_ms,
            day_end_ms,
            CASE
                WHEN day_start_ms < ?1 THEN ?1
                ELSE day_start_ms
            END AS bucket_start_ms,
            CASE
                WHEN day_end_ms > ?2 THEN ?2
                ELSE day_end_ms
            END AS bucket_end_ms
        FROM day_buckets
        WHERE day_start_ms < ?2
        AND day_end_ms > ?1
    )
    SELECT
        clipped_days.day_start_ms,
        COALESCE(SUM(
            MIN(ws.end_time, clipped_days.bucket_end_ms) -
            MAX(ws.start_time, clipped_days.bucket_start_ms)
        ), 0) AS total_duration_ms
    FROM clipped_days
    LEFT JOIN window_segments ws
        ON ws.start_time < clipped_days.bucket_end_ms
    AND ws.end_time > clipped_days.bucket_start_ms
    AND ws.duration_ms > 0
    AND (?3 = '' OR ws.app_id = ?3)
    GROUP BY clipped_days.day_start_ms
    ORDER BY clipped_days.day_start_ms ASC;")?;

    let usage_iter = stmt.query_map(params![start_time, end_time, app_id], |row| {
        Ok(DailyUsageHeatmapDTO {
            day_start_ms: row.get(0)?,
            total_duration_ms: row.get(1)?,
        })
    })?;

    let mut daily_usage = Vec::new();
    for day in usage_iter {
        daily_usage.push(day?);
    }

    Ok(daily_usage)
}

pub fn query_app_avg_time_of_day_usage(start_time: i64, end_time: i64, app_id: String) -> rusqlite::Result<Vec<AvgTimeOfDayUsage>> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("WITH RECURSIVE

    params(app_id, range_start, range_end) AS (
    VALUES (?1, ?2, ?3)
    ),

    -- 1️. Filter overlapping segments and clamp to range
    filtered AS (
    SELECT
        id,
        MAX(start_time, (SELECT range_start FROM params)) AS start_time,
        MIN(end_time, (SELECT range_end FROM params)) AS end_time
    FROM window_segments
    WHERE app_id = (SELECT app_id FROM params)
        AND start_time < (SELECT range_end FROM params)
        AND end_time > (SELECT range_start FROM params)
    ),

    -- 2️. Split segments at hour boundaries
    expanded AS (
    -- first chunk
    SELECT
        id,
        start_time AS chunk_start,
        MIN(
        end_time,
        ((start_time / 3600000) + 1) * 3600000
        ) AS chunk_end
    FROM filtered

    UNION ALL

    -- additional chunks
    SELECT
        e.id,
        e.chunk_end AS chunk_start,
        MIN(
        f.end_time,
        ((e.chunk_end / 3600000) + 1) * 3600000
        ) AS chunk_end
    FROM expanded e
    JOIN filtered f USING (id)
    WHERE e.chunk_end < f.end_time
    ),

    -- 3️. Group by hour-of-day
    hourly AS (
    SELECT
        CAST(
        strftime('%H',
            datetime(chunk_start / 1000, 'unixepoch', 'localtime')
        ) AS INTEGER
        ) AS hour,
        SUM(chunk_end - chunk_start) as total_ms
    FROM expanded
    GROUP BY hour
    ),

    -- 4️. Generate 0..23 hours
    hours AS (
    SELECT 0 AS hour
    UNION ALL
    SELECT hour + 1 FROM hours WHERE hour < 23
    ),

    -- 5️. Count calendar days in selected range
    day_count AS (
    SELECT
        CAST(
        (julianday(date(datetime(((SELECT range_end FROM params) - 1) / 1000, 'unixepoch', 'localtime')))
        - julianday(date(datetime((SELECT range_start FROM params) / 1000,     'unixepoch', 'localtime')))
        + 1)
        AS INTEGER
    ) AS days
    )

    -- 6. Get avg values per hourly bucket
    SELECT
    h.hour,
    COALESCE(hr.total_ms, 0) AS total_ms,
    COALESCE(hr.total_ms, 0) / dc.days AS avg_ms_per_hour_of_day
    FROM hours h
    LEFT JOIN hourly hr USING (hour)
    CROSS JOIN day_count dc
    ORDER BY h.hour;")?;

    let usage_iter = stmt.query_map(params![app_id, start_time, end_time], |row| {
        Ok(AvgTimeOfDayUsage {
            hour: row.get(0)?,
            total_duration_ms: row.get(1)?,
            avg_ms_per_hour_of_day: row.get(2)?
        })
    })?;

    let mut avg_usage = Vec::new();
    for hour in usage_iter {
        avg_usage.push(hour?);
    }

    Ok(avg_usage)
}

pub fn query_app_overall_summary(app_id: String) -> rusqlite::Result<AppOverallSummaryDTO> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT
        COALESCE(SUM(duration_ms), 0) AS total_duration_ms,
        MIN(start_time) AS first_used_ms,
        MAX(start_time) AS last_used_ms
    FROM window_segments
    WHERE app_id = ?1
        AND duration_ms > 0")?;

    let summary = stmt.query_row(params![app_id], |row| {
        Ok(AppOverallSummaryDTO {
            total_duration_ms: row.get(0)?,
            first_used_ms: row.get(1)?,
            last_used_ms: row.get(2)?,
        })
    });

    summary
}