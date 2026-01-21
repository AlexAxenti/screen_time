use std::{fs, sync::mpsc::Receiver};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use crate::WindowSegment;
use crate::models::WindowSegmentDTO;
use directories_next::ProjectDirs;
use rusqlite::{Connection, params};

//TODO batching and error handling
pub fn run_sql_layer(rx_segments: Receiver<WindowSegment>) {
    let conn = connect_db_file();

    initialize_db(&conn);

    writer_loop(rx_segments, &conn);    
}

fn writer_loop(rx_segments: Receiver<WindowSegment>, db_connection: &Connection) {
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

pub fn read_usage() -> rusqlite::Result<Vec<WindowSegmentDTO>> {
    let conn = connect_db_file();

    println!("Reading from db");

    let mut stmt = conn.prepare("SELECT 
        window_exe, 
        SUM(duration_ms) AS duration
    FROM window_segments
    GROUP BY window_exe")?;

    let segment_iter = stmt.query_map(params![], |row| {
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

fn connect_db_file() -> Connection {
    let proj_dir = ProjectDirs::from("com", "screen_time", "screen_time")
        .expect("Failed to connect to db file");

    let app_data_dir = proj_dir.data_local_dir();

    if !app_data_dir.exists() { 
        println!("Creating dir");
        fs::create_dir_all(app_data_dir).expect("failed to create folder");
    }

    let sqlite_file_path = app_data_dir.join("usage.sqlite3");

    let Ok(conn) = Connection::open(sqlite_file_path) else {
        panic!("Failed to open db file");
    };

    conn.pragma_update(None, "journal_mode", &"WAL").unwrap();
    conn.pragma_update(None, "synchronous", &"NORMAL").unwrap();
    conn.busy_timeout(Duration::from_secs(3)).unwrap();

    conn
}

fn initialize_db(conn: &Connection) {
    conn.execute("CREATE TABLE IF NOT EXISTS window_segments (
        id INTEGER PRIMARY KEY,
        window_name TEXT,
        window_exe TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at INTEGER NOT NULL
    )", ()).expect("Failed to intialize table");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_start_time
        ON window_segments(start_time);", ()).unwrap();

    conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_exe_start_time
        ON window_segments(window_exe, start_time);", ()).unwrap();
}