use std::time::{Duration, SystemTime};

pub struct WindowSegment {
    pub window_name: String,
    pub window_exe: String,
    pub focus_start_time: SystemTime,
    pub focus_end_time: Option<SystemTime>,
}

impl WindowSegment {
    pub fn new(window_name: String, window_exe: String, focus_start_time: SystemTime) -> WindowSegment {
        Self {
            window_name,
            window_exe,
            focus_start_time,
            focus_end_time: None
        }
    }

    pub fn finalize(&mut self, focus_end_time: SystemTime) {
        self.focus_end_time = Some(focus_end_time);
    }

    pub fn duration(&self) -> Option<Duration> {
        self.focus_end_time.and_then(|end_time| end_time.duration_since(self.focus_start_time).ok())
    }
}

pub enum ControlMsg {
    Pause,
    Resume,
    Shutdown
}