use rusqlite::{OptionalExtension, params};
use crate::{
    sql_client::init::connect_db_file, 
    types::dtos::{AppInfoDTO, AppUsageDTO, AppUsageSummaryDTO, AvgTimeOfDayUsage, DailyUsageDTO, DailyUsageHeatmapDTO, UsageFragmentationDTO, UsageSummaryDTO}
};

//TODO split up reader into domain based query modules
pub enum SortDirection {
    Ascending,
    Descending,
}

pub enum ApplicationSortValue {
    Duration,
    Exe,
}

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

pub fn query_app_usage_summary(start_time: i64, end_time: i64, app_id: String) -> rusqlite::Result<AppUsageSummaryDTO> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT
        COALESCE(SUM(ws.duration_ms), 0) AS total_duration_ms,
        COALESCE(COUNT(*), 0) AS segment_count,
        COALESCE(
            CAST(AVG(ws.duration_ms) AS INTEGER),
            0
        ) AS avg_segment_duration_ms
        FROM window_segments ws
        WHERE ws.start_time >= ?1
            AND ws.start_time <  ?2
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

pub fn query_app_usage(
    start_time: i64, 
    end_time: i64,
    sort_value: ApplicationSortValue, 
    sort_direction: SortDirection,
    page_count: Option<i64>,
    page_size: Option<i64>,
    search_value: Option<String>,
) -> rusqlite::Result<Vec<AppUsageDTO>> {
    let conn = connect_db_file();
    
    let sort_direction = match sort_direction {
        SortDirection::Ascending => "ASC",
        SortDirection::Descending => "DESC"
    };
    
    let order_by_clause = match sort_value {
        ApplicationSortValue::Duration => format!("ORDER BY duration {}, display_name COLLATE NOCASE {}", sort_direction, sort_direction),
        _ => format!("ORDER BY display_name COLLATE NOCASE {}, duration {}", sort_direction, sort_direction)
    };
    
    let search_param = search_value.unwrap_or_default();
    
    let pagination_clause = match (page_count, page_size) {
        (Some(page), Some(size)) => format!("LIMIT {} OFFSET {}", size, page * size),
        _ => String::new()
    };
    
    let stmt_str = format!("SELECT 
        ws.app_id,
        ws.window_exe, 
        COALESCE(a.display_name, MIN(ws.window_exe)) AS display_name,
        SUM(ws.duration_ms) AS duration,
        COUNT(*) AS segment_count
    FROM window_segments ws
    LEFT JOIN applications a
        ON a.app_id = ws.app_id
    WHERE start_time >= ?1 AND start_time < ?2
    GROUP BY ws.app_id
    HAVING (?3 = '' OR display_name LIKE '%' || ?3 || '%')
    {}
    {}", order_by_clause, pagination_clause);
    
    let mut stmt = conn.prepare(&stmt_str)?;

    let segment_iter = stmt.query_map(params![start_time, end_time, search_param], |row| {
        Ok(AppUsageDTO {
            app_info: AppInfoDTO {
                app_id: row.get(0)?,
                app_exe: row.get(1)?,
                display_name: row.get(2)?
            },
            duration: row.get(3)?,
            segment_count: row.get(4)?
        })
    })?;

    let mut segments = Vec::new();
    for segment in segment_iter {
        segments.push(segment?);
    }

    Ok(segments)
}

pub fn query_usage_fragmentation(start_time: i64, end_time: i64, app_id: Option<String>) -> rusqlite::Result<Vec<UsageFragmentationDTO>> {
    let conn = connect_db_file();

    let app_id = app_id.unwrap_or_default();

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
    WHERE start_time >= ?1 
        AND start_time < ?2
        AND (?3 = '' OR app_id = ?3)
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
        AND (?3 = '' OR app_id = ?3)
    GROUP BY day
    ORDER BY day;")?;

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

pub fn query_app_titles(
    query: String,
    tracked: Option<bool>
) -> rusqlite::Result<Vec<AppInfoDTO>> {
    let conn = connect_db_file();

    let tracked_clause = match tracked {
        Some(true) => "AND is_tracked = 1",
        Some(false) => "AND is_tracked = 0",
        None => "",
    };
    
    let stmt_str = format!("SELECT
        app_id,
        exe_name,
        display_name
    FROM applications
    WHERE display_name LIKE '%' || ?1 || '%'
    {}
    ORDER BY display_name COLLATE NOCASE ASC
    LIMIT 6;", tracked_clause);

    let mut stmt = conn.prepare(&stmt_str)?;

    let apps_iter = stmt.query_map(params![query], |row| {
        Ok(AppInfoDTO {
            app_id: row.get(0)?,
            app_exe: row.get(1)?,
            display_name: row.get(2)?
        })
    })?;

    let mut apps = Vec::new();
    for app in apps_iter {
        apps.push(app?);
    }

    Ok(apps)
}

//TODO clean up the two below fns
pub fn query_untracked_app_ids() -> rusqlite::Result<Vec<String>> {
    let conn = connect_db_file();
    
    let mut stmt = conn.prepare("SELECT
        app_id
    FROM applications
    WHERE is_tracked = 0;")?;

    let apps_iter = stmt.query_map(params![], |row| {
       Ok(row.get(0)?)
    })?;

    let mut apps = Vec::new();
    for app in apps_iter {
        apps.push(app?);
    }

    Ok(apps)
}

pub fn query_untracked_apps() -> rusqlite::Result<Vec<AppInfoDTO>> {
    let conn = connect_db_file();
    
    let mut stmt = conn.prepare("SELECT
        app_id,
        exe_name,
        display_name
    FROM applications
    WHERE is_tracked = 0;")?;

    let apps_iter = stmt.query_map(params![], |row| {
        Ok(AppInfoDTO {
            app_id: row.get(0)?,
            app_exe: row.get(1)?,
            display_name: row.get(2)?
        })
    })?;

    let mut apps = Vec::new();
    for app in apps_iter {
        apps.push(app?);
    }

    Ok(apps)
}

pub fn check_for_application(app_id: &str) -> rusqlite::Result<bool> {
    let conn = connect_db_file();

    let mut stmt = conn.prepare("SELECT 1 FROM applications
    WHERE app_id = ?1 LIMIT 1")?;

    let exists = stmt.query_row(params![app_id], |_| {
        Ok(())
    })
    .optional()?
    .is_some();

   Ok(exists)
}

pub fn query_heat_map_values(start_time: i64, end_time: i64, app_id: Option<String>) -> rusqlite::Result<Vec<DailyUsageHeatmapDTO>> {
    let conn = connect_db_file();

    let app_id = app_id.unwrap_or_default();

    let mut stmt = conn.prepare("SELECT
    CAST(strftime('%s', date(ws.start_time / 1000, 'unixepoch', 'localtime')) AS INTEGER) * 1000
        AS day_start_ms,
    SUM(ws.duration_ms) AS total_duration_ms
    FROM window_segments ws
    WHERE ws.start_time >= ?1
        AND ws.start_time <  ?2
        AND ws.duration_ms > 0
        AND (?3 = '' OR ws.app_id = ?3)
    GROUP BY day_start_ms
    ORDER BY day_start_ms ASC;")?;

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

    -- 1️. Filter segments by start_time in range
    filtered AS (
    SELECT
        id,
        start_time,
        end_time
    FROM window_segments
    WHERE app_id = (SELECT app_id FROM params)
        AND start_time >= (SELECT range_start FROM params)
        AND start_time <  (SELECT range_end FROM params)
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