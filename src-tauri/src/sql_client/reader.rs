use rusqlite::{params};
use crate::{
    sql_client::init::connect_db_file, 
    tauri_app::dtos::{UsageSummaryDTO, WindowSegmentDTO}
};

pub fn query_top_usage(start_time: i64) -> rusqlite::Result<Vec<WindowSegmentDTO>> {
    let conn = connect_db_file();

    println!("Reading from db");

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

pub fn query_usage_summary(start_time: i64) -> rusqlite::Result<UsageSummaryDTO> {
    let conn = connect_db_file();

    println!("Reading summary from db");

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



