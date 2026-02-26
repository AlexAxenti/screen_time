// pub mod reader;
mod init;
mod migrations;
mod read;
pub use read::*;
pub mod writer;

use crate::{sql_client::init::{connect_db_file, init_migrations_table, run_migrations}};

pub fn init_db() {
    let mut conn = connect_db_file();

    init_migrations_table(&conn);
    run_migrations(&mut conn);
}
