use crate::types::models::SchemaMigration;

pub const MIGRATIONS: [SchemaMigration; 1] = [
    SchemaMigration {
        migration_version: 1,
        migration_name: "Initial setup",
        migration_sql: r#"
        CREATE TABLE IF NOT EXISTS window_segments (
            id INTEGER PRIMARY KEY,
            app_id TEXT,
            window_name TEXT,
            window_exe TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL,
            duration_ms INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_window_segments_start_time
            ON window_segments(start_time);
        CREATE INDEX IF NOT EXISTS idx_window_segments_exe_start_time
            ON window_segments(window_exe, start_time);
        CREATE INDEX IF NOT EXISTS idx_window_segments_app_id_time
            ON window_segments(app_id, start_time);

        CREATE TABLE IF NOT EXISTS applications (
            app_id TEXT PRIMARY KEY,
            exe_path TEXT NOT NULL,
            exe_name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            last_updated INTEGER NOT NULL,
            is_tracked INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            start_on_startup INTEGER NOT NULL DEFAULT 0,
            close_behavior TEXT NOT NULL DEFAULT 'destroy',
            idle_duration_ms INTEGER NOT NULL DEFAULT 120000
        );

        INSERT OR IGNORE INTO settings (id) VALUES (1);
        "#
    }
];
