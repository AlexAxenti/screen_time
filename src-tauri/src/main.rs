use std::{
    sync::mpsc::{self, Receiver, Sender},
    thread
};

use screen_time::{
    ControlMsg, WindowSegment, sampler, sql_client::{self}, tauri_app
};

fn main() {
    //TODO Thread error handling
    let (tx_segments, rx_segments): 
        (Sender<WindowSegment>, Receiver<WindowSegment>) = mpsc::channel();

    let sql_handle = Some(thread::spawn(move || {
        sql_client::start_sql_client(rx_segments);
    }));

    let (tx_control, rx_control): 
        (Sender<ControlMsg>, Receiver<ControlMsg>) = mpsc::channel();

    let sampler_handle = Some(thread::spawn(move || {
        sampler::start(tx_segments, rx_control);
    }));

    tauri_app::run(tx_control, sql_handle, sampler_handle);
}