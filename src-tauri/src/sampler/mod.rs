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

const DEFAULT_UNKNOWN_NAME: &str = "unknown.exe";

pub fn start(
    tx_segments: Sender<WindowSegment>, 
    rx_control: Receiver<ControlMsg>,
    untracked_app_ids: Vec<String>
) {
    let mut main_segment: Option<WindowSegment> = None;
    let mut running= true;
    let mut applications_found: HashSet<String> = HashSet::new();

    let mut untracked_app_ids_set: HashSet<String> = HashSet::new();
    for app_id in untracked_app_ids {
        untracked_app_ids_set.insert(app_id);
    }

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
                },
                ControlMsg::SetTracked { app_id, is_tracked } => {
                    if is_tracked {
                        untracked_app_ids_set.remove(&app_id);
                    } else {
                        untracked_app_ids_set.insert(app_id);
                    }
                    println!("Untracked app_ids: {:?}", untracked_app_ids_set);
                } 
            }
        }

        if !running {
            continue;
        }
        
        let last_input_duration = get_idle_duration();

        if last_input_duration > Duration::from_millis(IDLE_DURATION) {
            flush_segment(&mut main_segment, sample_start_time, &tx_segments);
            continue;
        }
        let Some((window_name, window_exe_path)) = sample_foreground() else {
            continue;
        };

        let window_exe = get_exe_name_from_path(&window_exe_path, DEFAULT_UNKNOWN_NAME).to_lowercase();

        let app_id: String = hash_exe_path(&window_exe_path);

        if !applications_found.contains(&app_id) {
            println!("Found {:?}", app_id);

            let new_app_info = AppInfo {
                app_id: app_id.clone(),
                app_exe_path: window_exe_path,
                app_exe_name: window_exe.clone()
            };

            tx_apps.send(new_app_info).unwrap_or_else(|e| {
                eprintln!("Failed to send new app info: {e}");
            });

            applications_found.insert(app_id.clone());
        }

        let app_is_ignored = is_app_ignored(&window_exe, &app_id, &untracked_app_ids_set);

        let sampled_segment = WindowSegment::new(
            app_id,
            window_name,
            window_exe,
            sample_start_time);        

        update_state(&mut main_segment, sampled_segment, app_is_ignored, sample_start_time, &tx_segments);
    }

    drop(tx_apps);
    if let Err(e) = apps_worker_handle.join() {
        eprintln!("Failed to close apps worker thread: {e:?}");
    }
    println!("Apps thread closed");
}

fn update_state(
    main_segment: &mut Option<WindowSegment>, 
    sampled_segment: WindowSegment, 
    should_ignore: bool, 
    sample_start_time: SystemTime,
    tx_segments: &Sender<WindowSegment>
) {
    if main_segment.is_none() {
        if !should_ignore {
            println!("New focus: {} | {}", sampled_segment.window_name, sampled_segment.window_exe);
            
            *main_segment = Some(sampled_segment);
        }
    } else {
        let same_exe = main_segment
            .as_ref()
            .map(|seg| seg.app_id == sampled_segment.app_id)
            .unwrap_or(false);

        if should_ignore {
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
        if let Err(e) = tx_segments.send(seg) {
            eprintln!("Failed to send segment: {e}");
        }
    }
}

// TODO have a list from tauri in the future
fn is_app_ignored(
    exe_name: &str,
    app_id: &str,
    untracked_app_ids_set: &HashSet<String>
) -> bool {
    //TODO remove screen time when more polished

    exe_name == "explorer.exe" || 
    exe_name == "screen_time.exe" || 
    exe_name == DEFAULT_UNKNOWN_NAME || 
    untracked_app_ids_set.contains(app_id)
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