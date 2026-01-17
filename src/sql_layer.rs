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
    loop {
        let received_segment = rx_segments.recv();

        let Ok(segment) = received_segment else {
            continue;
        };

        save_segment_to_db(segment);
    }
}