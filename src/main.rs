use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use screen_time::WindowSegment;
use screen_time::{sql_layer, sampler};

fn main() {
    //TODO Thread error handling

    let (tx_segments, rx_segments): 
        (Sender<WindowSegment>, Receiver<WindowSegment>) = mpsc::channel();

    let sql_handle = thread::spawn(move || {
        sql_layer::writer_loop(rx_segments);
    });

    let sampler_handle = thread::spawn(|| {
        sampler::start(tx_segments)
    });

    sampler_handle.join().unwrap();
    sql_handle.join().unwrap();
}
