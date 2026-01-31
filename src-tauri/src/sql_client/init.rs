use std::{fs, time::Duration};
use directories_next::ProjectDirs;
use rusqlite::Connection;

pub fn connect_db_file() -> Connection {
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

pub fn initialize_db(conn: &Connection) {
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

    conn.execute("CREATE TABLE IF NOT EXISTS applications (
        app_id TEXT PRIMARY KEY,
        exe_path TEXT NOT NULL,
        exe_name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL
    )", ()).expect("Failed to initialize applications table");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_applications_app_id
        ON applications(app_id);", ()).unwrap();
}