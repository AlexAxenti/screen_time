use std::{sync::mpsc::Receiver, time::{SystemTime}};
use crate::{WindowSegment, sql_client::init::connect_db_file, utils::time::system_time_to_millis};
use rusqlite::{Connection, params};

//TODO error handling
pub fn run_writer_loop(rx_segments: Receiver<WindowSegment>, db_connection: &Connection) {
    while let Ok(segment) = rx_segments.recv() {
        save_segment_to_db(segment, db_connection);
    }
}

fn save_segment_to_db(segment: WindowSegment, db_connection: &Connection) {
    println!("Writing to db: {} | {}, Duration: {:?}", 
        segment.window_name, 
        segment.window_exe, 
        segment.duration()
    );

    let start_int = system_time_to_millis(segment.focus_start_time);
    let end_int = system_time_to_millis(segment.focus_end_time.expect("segment must be finalized before DB write"));

    let duration_ms = segment.duration().unwrap().as_millis() as i64;

    let created_at = system_time_to_millis(SystemTime::now());

    db_connection.execute("INSERT INTO window_segments (
        app_id,
        window_name,
        window_exe,
        start_time,
        end_time,
        duration_ms,
        created_at
    ) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)", 
    params![
        &segment.app_id,
        &segment.window_name, 
        &segment.window_exe,
        start_int, 
        end_int, 
        duration_ms,
        created_at,
    ]).expect("Failed to write!");
}

pub fn save_application_to_db(app_id: &str, exe_path: &str, exe_name: &str, display_name: &str) {
    let created_at = system_time_to_millis(SystemTime::now());

    let conn = connect_db_file();

    conn.execute("INSERT INTO applications(
        app_id,
        exe_path,
        exe_name,
        display_name,
        created_at,
        last_updated
    )
    VALUES(?1, ?2, ?3, ?4, ?5, ?6)", 
    params![
        app_id,
        exe_path, 
        exe_name,
        display_name, 
        created_at, 
        created_at,
    ]).expect("Failed to write!");
} 