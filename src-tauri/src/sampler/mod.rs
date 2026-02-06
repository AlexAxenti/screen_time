mod apps_metadata;
mod windows_utils;

use std::{
    collections::HashSet, 
    path::Path, 
    sync::mpsc::{self, Receiver, Sender}, 
    thread::{self, sleep}, 
    time::{Duration, SystemTime}
};

use crate::{AppInfo, ControlMsg, WindowSegment, sampler::{windows_utils::{get_idle_duration, sample_foreground}}};

const IDLE_DURATION: u64 = 120000;

pub fn start(tx_segments: Sender<WindowSegment>, rx_control: Receiver<ControlMsg>) {
    let mut main_segment: Option<WindowSegment> = None;
    let mut running= true;
    let mut applications_found: HashSet<String> = HashSet::new();

    //Init apps worker
    let (tx_apps, rx_apps): 
        (Sender<AppInfo>, Receiver<AppInfo>) = mpsc::channel();

    let apps_worker_handle = thread::spawn(move || {
        apps_metadata::start(rx_apps);
    });

    loop {
        sleep(Duration::from_millis(500));

        let sample_start_time = SystemTime::now();

        //TODO drain messages
        if let Ok(ctrl) = rx_control.try_recv() {
            match ctrl {
                ControlMsg::Pause => {
                    flush_segment(&mut main_segment, sample_start_time, &tx_segments);
                    running = false;
                    println!("Paused");
                }
                ControlMsg::Resume => running = true,
                ControlMsg::Shutdown => {
                    flush_segment(&mut main_segment, sample_start_time, &tx_segments);
                    break;
                }
            }
        }

        if !running {
            continue;
        }
        
        // Calculate time since last input
        let last_input_duration = get_idle_duration();

        if last_input_duration > Duration::from_millis(IDLE_DURATION) {
            flush_segment(&mut main_segment, sample_start_time, &tx_segments);
            continue;
        }

        // Sample foreground
        let Some((window_name, window_exe_path)) = sample_foreground() else {
            continue;
        };

        let window_exe = get_exe_name_from_path(&window_exe_path, "unknown.exe").to_lowercase();

        let app_id: String = hash_exe_path(&window_exe_path);

        if !applications_found.contains(&app_id) {
            println!("Found {:?}", app_id);

            let new_app_info = AppInfo {
                app_id: app_id.clone(),
                app_exe_path: window_exe_path,
                app_exe_name: window_exe.clone()
            };

            tx_apps.send(new_app_info).expect("Failed to send new app info");

            applications_found.insert(app_id.clone());
        }

        let is_tracked = app_is_tracked(&window_exe);

        let sampled_segment = WindowSegment::new(
            app_id,
            window_name,
            window_exe,
            sample_start_time);        

        update_state(&mut main_segment, sampled_segment, is_tracked, sample_start_time, &tx_segments);
    }

    drop(tx_apps);
    apps_worker_handle.join().expect("Failed to close apps worker thread");
    println!("Apps thread closed");
}

fn update_state(
    main_segment: &mut Option<WindowSegment>, 
    sampled_segment: WindowSegment, 
    is_unfocused: bool, 
    sample_start_time: SystemTime,
    tx_segments: &Sender<WindowSegment>
) {
    if main_segment.is_none() {
        if !is_unfocused {
            println!("New focus: {} | {}", sampled_segment.window_name, sampled_segment.window_exe);
            
            *main_segment = Some(sampled_segment);
        }
    } else {
        let same_exe = main_segment
            .as_ref()
            .map(|seg| seg.app_id == sampled_segment.app_id)
            .unwrap_or(false);

        if is_unfocused {
            flush_segment(main_segment, sample_start_time, tx_segments);
        } else if same_exe {
            return;
        } else {
            flush_segment(main_segment, sample_start_time, tx_segments);

            println!("New focus: {} | {}", sampled_segment.window_name, sampled_segment.window_exe);

            *main_segment = Some(sampled_segment);
        }
    }
}

fn flush_segment(
    segment: &mut Option<WindowSegment>,
    end_time: SystemTime,
    tx_segments: &Sender<WindowSegment>
) {
    if let Some(mut seg) = segment.take() {
        seg.finalize(end_time);
        tx_segments.send(seg).expect("Segment sending failed");
    }
}

// TODO have a list from tauri in the future
fn app_is_tracked(exe_path: &str) -> bool {
    let default_unknown_name = "unknown.exe";

    let mut exe_name = get_exe_name_from_path(exe_path, default_unknown_name);

    exe_name = exe_name.to_lowercase();

    exe_name == "explorer.exe" || exe_name == "screen_time.exe" || exe_name == "unknown.exe"
}

fn get_exe_name_from_path(exe_path: &str, default_name: &str) -> String {
    Path::new(exe_path)
        .file_name()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| default_name.to_string())
}

fn hash_exe_path(exe_path: &str) -> String {
    let hash = blake3::hash(exe_path.as_bytes());
    let full_bytes = hash.as_bytes();
    let truncated = &full_bytes[..16];
    let app_id = hex::encode(truncated);

    app_id
}