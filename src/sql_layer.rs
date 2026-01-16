use crate::WindowSegment;

pub fn save_segment_to_db(segment: WindowSegment) {
    println!("Writing to db: {} | {}, Duration: {:?}", 
        segment.window_name, 
        segment.window_exe, 
        segment.duration()
    );
}