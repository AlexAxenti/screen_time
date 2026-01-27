pub mod reader;
mod writer;
mod init;

use std::sync::mpsc::Receiver;
use crate::sql_client::{init::{connect_db_file, initialize_db}, writer::run_writer_loop};
use crate::WindowSegment;

//TODO batching and error handling
//TODO add app name and icon table/caching
pub fn start_sql_client(rx_segments: Receiver<WindowSegment>) {
    let conn = connect_db_file();

    initialize_db(&conn);

    run_writer_loop(rx_segments, &conn);    
}