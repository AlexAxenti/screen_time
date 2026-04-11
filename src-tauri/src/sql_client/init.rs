use std::{fs, time::Duration};
use rusqlite::{Connection, params};

use crate::{sql_client::migrations::MIGRATIONS, utils::paths::local_data_dir};

pub fn connect_db_file() -> Connection {
    let app_data_dir = local_data_dir();

    if !app_data_dir.exists() { 
        println!("Creating dir");
        if let Err(e) = fs::create_dir_all(&app_data_dir) {
            //TODO this should probably panic
            eprintln!("Failed to create app data folder: {e}");
            panic!("Failed to create app data folder");
        }
    }

    let sqlite_file_path = app_data_dir.join("usage.sqlite3");

    let Ok(conn) = Connection::open(sqlite_file_path) else {
        //TODO this should probably panic
        eprintln!("Failed to open db file");
        panic!("Failed to open db file");
    };

    if let Err(e) = conn.pragma_update(None, "journal_mode", &"WAL") {
        //TODO this should probably panic
        eprintln!("Failed to set journal_mode: {e}");
        panic!("Failed to set journal_mode");
    }
    if let Err(e) = conn.pragma_update(None, "synchronous", &"NORMAL") {
        //TODO this should probably panic
        eprintln!("Failed to set synchronous mode: {e}");
        panic!("Failed to set synchronous mode");
    }
    if let Err(e) = conn.busy_timeout(Duration::from_secs(3)) {
        //TODO this should probably panic
        eprintln!("Failed to set busy_timeout: {e}");
        panic!("Failed to set busy_timeout");
    }

    conn
}

pub fn init_migrations_table(conn: &Connection) {
    if let Err(e) = conn.execute("CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at INTEGER NOT NULL
    );", ()) {
        //TODO this should probably panic
        eprintln!("Failed to initialize migrations table: {e}");
        panic!("Failed to initialize migrations table");
    }
}

pub fn run_migrations(conn: &mut Connection) {
    let current_migration_version: i64 = match conn
        .query_row("SELECT COALESCE(MAX(version), 0) FROM schema_migrations", [], |row| row.get(0)) {
        Ok(v) => v,
        Err(e) => {
            //TODO this should probably panic
            eprintln!("Failed to get migration version: {e}");
            panic!("Failed to get migration version");
        }
    };

    for migration in MIGRATIONS.iter().filter(
        |m| m.migration_version > current_migration_version
    ) {
        println!("Running migration {}", migration.migration_version);
        
        let tx = match conn.transaction() {
            Ok(tx) => tx,
            Err(e) => {
                //TODO this should probably panic
                eprintln!("Failed to create transaction for migration {}: {e}", migration.migration_version);
                panic!("Failed to create transaction");
            }
        };

        if let Err(e) = tx.execute_batch(migration.migration_sql) {
            //TODO this should probably panic
            eprintln!("Failed to execute migration {}: {e}", migration.migration_version);
            panic!("Failed to execute migration");
        }

        if let Err(e) = tx.execute(
            "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?1, ?2, strftime('%s','now'))",
            params![migration.migration_version, migration.migration_name],
        ) {
            //TODO this should probably panic
            eprintln!("Failed to add migration row for {}: {e}", migration.migration_version);
            panic!("Failed to add migration row");
        }

        if let Err(e) = tx.commit() {
            //TODO this should probably panic
            eprintln!("Failed to commit migration {}: {e}", migration.migration_version);
            panic!("Failed to commit migration");
        }
    }
}

// fn initialize_db(conn: &Connection) {
//     // Window segments
//     conn.execute("CREATE TABLE IF NOT EXISTS window_segments (
//         id INTEGER PRIMARY KEY,
//         app_id TEXT,
//         window_name TEXT,
//         window_exe TEXT NOT NULL,
//         start_time INTEGER NOT NULL,
//         end_time INTEGER NOT NULL,
//         duration_ms INTEGER NOT NULL,
//         created_at INTEGER NOT NULL
//     )", ()).expect("Failed to intialize segments table");

//     conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_start_time
//         ON window_segments(start_time);", ()).unwrap();

//     conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_exe_start_time
//         ON window_segments(window_exe, start_time);", ()).unwrap();

//     conn.execute("CREATE INDEX IF NOT EXISTS idx_window_segments_app_id_time
//         ON window_segments(app_id, start_time);", ()).unwrap();

//     // Applications
//     conn.execute("CREATE TABLE IF NOT EXISTS applications (
//         app_id TEXT PRIMARY KEY,
//         exe_path TEXT NOT NULL,
//         exe_name TEXT NOT NULL,
//         display_name TEXT NOT NULL,
//         created_at INTEGER NOT NULL,
//         last_updated INTEGER NOT NULL,
//         is_tracked INTEGER NOT NULL DEFAULT 1
//     )", ()).expect("Failed to initialize applications table");

//     conn.execute("CREATE INDEX IF NOT EXISTS idx_applications_app_id
//         ON applications(app_id);", ()).unwrap();

//     // Settings
//     conn.execute(
//     "CREATE TABLE IF NOT EXISTS settings (
//         id INTEGER PRIMARY KEY CHECK (id = 1),
//         start_on_startup INTEGER NOT NULL DEFAULT 0,
//         close_behavior TEXT NOT NULL DEFAULT 'destroy',
//         idle_duration_ms INTEGER NOT NULL DEFAULT 120000
//     );",()).expect("Failed to initialize settings table");

//     conn.execute(
//     "INSERT OR IGNORE INTO settings (id) VALUES (1);",
//     ()).expect("Failed to initialize settings row");
// }