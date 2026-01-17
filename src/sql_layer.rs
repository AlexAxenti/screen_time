use std::{sync::mpsc::Receiver};

use crate::WindowSegment;

pub fn save_segment_to_db(segment: WindowSegment) {
    println!("Writing to db: {} | {}, Duration: {:?}", 
        segment.window_name, 
        segment.window_exe, 
        segment.duration()
    );
}

pub fn writer_loop(rx_segments: Receiver<WindowSegment>) {
    while let Ok(segment) = rx_segments.recv() {
        save_segment_to_db(segment);
    }
}