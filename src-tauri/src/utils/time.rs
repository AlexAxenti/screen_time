use std::time::{SystemTime, UNIX_EPOCH};

pub fn system_time_to_millis(time: SystemTime) -> i64 {
    let epoch_time = time.duration_since(UNIX_EPOCH).expect("Failed to convert to epoch time");

    epoch_time.as_millis() as i64
}
