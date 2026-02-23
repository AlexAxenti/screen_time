use std::{fs, time::Duration};
use rusqlite::Connection;

use crate::utils::paths::local_data_dir;

pub fn connect_db_file() -> Connection {
    let app_data_dir = local_data_dir();

    if !app_data_dir.exists() { 
        println!("Creating dir");
        fs::create_dir_all(&app_data_dir).expect("failed to create folder");
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

pub fn initialize_db(conn: &Connection) {
    // Window segments
    conn.execute("CREATE TABLE IF NOT EXISTS window_segments (
        id INTEGER PRIMARY KEY,
        app_id TEXT,
        window_name TEXT,
        window_exe TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at INTEGER NOT NULL
    )", ()).expect("Failed to intialize segments table");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_start_time
        ON window_segments(start_time);", ()).unwrap();

    conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_exe_start_time
        ON window_segments(window_exe, start_time);", ()).unwrap();

    conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_app_id_time
        ON window_segments(app_id, start_time);", ()).unwrap();

    // Applications
    conn.execute("CREATE TABLE IF NOT EXISTS applications (
        app_id TEXT PRIMARY KEY,
        exe_path TEXT NOT NULL,
        exe_name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL,
        is_tracked INTEGER NOT NULL DEFAULT 1
    )", ()).expect("Failed to initialize applications table");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_applications_app_id
        ON applications(app_id);", ()).unwrap();

    // Settings
    conn.execute(
    "CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        start_on_startup INTEGER NOT NULL DEFAULT 0,
        close_behavior TEXT NOT NULL DEFAULT 'destroy',
        idle_duration_ms INTEGER NOT NULL DEFAULT 120000
    );",()).expect("Failed to initialize settings table");

    conn.execute(
    "INSERT OR IGNORE INTO settings (id) VALUES (1);",
    ()).expect("Failed to initialize settings row");
}