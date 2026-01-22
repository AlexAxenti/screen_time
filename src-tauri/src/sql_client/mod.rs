pub mod reader;
mod writer;
mod init;

use std::{sync::mpsc::Receiver};
use crate::sql_client::init::{connect_db_file, initialize_db};
use crate::sql_client::writer::writer_loop;
use crate::{WindowSegment};

//TODO batching and error handling
pub fn start_sql_client(rx_segments: Receiver<WindowSegment>) {
    let conn = connect_db_file();

    initialize_db(&conn);

    writer_loop(rx_segments, &conn);    
}