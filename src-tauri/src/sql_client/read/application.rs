use rusqlite::{OptionalExtension, params};

use crate::{sql_client::init::connect_db_file, types::dtos::{AppInfoDTO, AppMetadataDTO, AppUsageDTO}};

pub enum SortDirection {
    Ascending,
    Descending,
}

pub enum ApplicationSortValue {
    Duration,
    Exe,
}

//TODO rename clearer, search apps, etc?
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
        SUM(MIN(ws.end_time, ?2) - MAX(ws.start_time, ?1)) AS duration,
        COUNT(*) AS segment_count
    FROM window_segments ws
    LEFT JOIN applications a
        ON a.app_id = ws.app_id
    WHERE ws.start_time < ?2 AND ws.end_time > ?1
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


pub fn query_app_usage_total(
    start_time: i64,
    end_time: i64,
    search_value: Option<String>,
) -> rusqlite::Result<i64> {
    let conn = connect_db_file();
    let search_param = search_value.unwrap_or_default();

    let mut stmt = conn.prepare("SELECT COUNT(*) FROM (
        SELECT
            ws.app_id,
            COALESCE(a.display_name, MIN(ws.window_exe)) AS display_name
        FROM window_segments ws
        LEFT JOIN applications a
            ON a.app_id = ws.app_id
        WHERE ws.start_time < ?2 AND ws.end_time > ?1
        GROUP BY ws.app_id
        HAVING (?3 = '' OR display_name LIKE '%' || ?3 || '%')
    )")?;

    let total = stmt.query_row(params![start_time, end_time, search_param], |row|{
        let count: i64 = row.get(0)?;

        Ok(count)
    })?;

    Ok(total)
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

pub fn query_app_metadata(app_id: &str) -> rusqlite::Result<AppMetadataDTO> {
    let conn = connect_db_file();

     let mut stmt = conn.prepare("SELECT
        app_id,
        exe_name,
        display_name,
        is_tracked
    FROM applications
    WHERE app_id = ?1")?;

    let app_metadata = stmt.query_row(params![app_id], |row| {
        Ok(AppMetadataDTO {
            app_info: AppInfoDTO { 
                app_id: row.get(0)?, 
                app_exe: row.get(1)?, 
                display_name: row.get(2)? 
            },
            is_tracked: row.get(3)?
        })
    })?;

   Ok(app_metadata)
}