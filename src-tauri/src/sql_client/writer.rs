use std::{sync::mpsc::Receiver, time::{SystemTime, UNIX_EPOCH}};
use crate::{WindowSegment};
use rusqlite::{Connection, params};

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

    let epoch_start_time = segment
        .focus_start_time
        .duration_since(UNIX_EPOCH)
        .unwrap();

    let start_int = epoch_start_time.as_millis() as i64;

    let epoch_end_time = segment
        .focus_end_time
        .expect("segment must be finalized before DB write")
        .duration_since(UNIX_EPOCH)
        .unwrap();
    
    let end_int = epoch_end_time.as_millis() as i64;

    let duration_ms = segment.duration().unwrap().as_millis() as i64;

    db_connection.execute("INSERT INTO window_segments (
        window_name,
        window_exe,
        start_time,
        end_time,
        duration_ms,
        created_at
    ) 
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)", 
    params![
        &segment.window_name, 
        &segment.window_exe,
        start_int, 
        end_int, 
        duration_ms,
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64
    ]).expect("Failed to write!");
}