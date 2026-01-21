use std::{
    path::Path, sync::mpsc::{Receiver, Sender}, thread::sleep, time::{Duration, SystemTime}
};

use windows::core::PWSTR;
use windows::Win32::Foundation::CloseHandle; 
use windows::Win32::System::Threading::{
    OpenProcess, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION, 
    QueryFullProcessImageNameW    
};
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowTextLengthW, GetWindowTextW, 
    GetWindowThreadProcessId
};
use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
use windows::Win32::System::SystemInformation::GetTickCount64;

use crate::{ControlMsg, WindowSegment};

const IDLE_DURATION: u64 = 120000;

pub fn start(tx_segments: Sender<WindowSegment>, rx_control: Receiver<ControlMsg>) {
    let mut main_segment: Option<WindowSegment> = None;
    let mut running= true;

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
        let Some((window_name, window_exe)) = sample_foreground() else {
            continue;
        };

        let window_exe = get_exe_name_from_path(&window_exe).to_lowercase();

        // Check if unfocused/empty explorer
        let is_unfocused = is_unfocused(&window_exe);

        // Construct sampled segment
        let sampled_segment = WindowSegment::new(window_name, window_exe, sample_start_time);        

        // Update state
        update_state(&mut main_segment, sampled_segment, is_unfocused, sample_start_time, &tx_segments);
    }
}

fn sample_foreground() -> Option<(String, String)> {
    let foreground_window_hwnd = unsafe {
        GetForegroundWindow()
    };

    // Get foreground window text name
    let window_text_length = unsafe {
        GetWindowTextLengthW(foreground_window_hwnd)
    };

    let mut buffer = vec![0u16; (window_text_length + 1) as usize];

    let chars_count = unsafe {
        GetWindowTextW(foreground_window_hwnd, &mut buffer)
    };

    let window_text = String::from_utf16_lossy(&buffer[0..chars_count as usize]);

    // Get PID
    let mut hwnd_process_id: u32 = 0;
    unsafe {
        GetWindowThreadProcessId(foreground_window_hwnd, Some(&mut hwnd_process_id));
    }

    // Get process handle
    // TODO Handle none
    let process_handle = match unsafe {
        OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, hwnd_process_id)
    } {
        Ok(handle) => {
            handle
        }
        Err(e) => {
            eprintln!("Failed to open process {e}");
            return None;
        }
    };

    // Get process exe path
    // TODO Handle buffer too small
    let mut process_image_buffer = vec![0u16; 256];

    let pwstr = PWSTR(process_image_buffer.as_mut_ptr());

    let mut lpdwsize: u32 = 256;

    if let Err(e) = unsafe {
        QueryFullProcessImageNameW(process_handle, PROCESS_NAME_WIN32, pwstr, &mut lpdwsize)
    } { 
        eprintln!("Error {e}");
    }

    let process_exe = String::from_utf16_lossy(&process_image_buffer[0..lpdwsize as usize]);

    // Close handle
    // TODO handle error?
    if let Err(e) = unsafe {
        CloseHandle(process_handle)
    } {
        eprintln!("Failed to close handle {e}");
    }

    Some((window_text, process_exe))
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
            .map(|seg| seg.window_exe == sampled_segment.window_exe)
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

fn is_unfocused(exe_path: &str) -> bool {
    let exe_path = Path::new(&exe_path);

    let exe_name = exe_path
        .file_name()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Invalid filename".to_string())
        .to_lowercase();

    exe_name == "explorer.exe" || exe_name == "screen_time.exe"
}

fn get_idle_duration() -> Duration {
    let mut last_input_info = LASTINPUTINFO {
        cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
        dwTime: 0,
    };

    let success = unsafe {
        GetLastInputInfo(&mut last_input_info)
    };

    if !success.as_bool() {
        eprintln!("Failed to get the last input info");

        Duration::from_millis(0)
    } else {
        let tick_count = unsafe { GetTickCount64() };

        let diff = tick_count - last_input_info.dwTime as u64;

        Duration::from_millis(diff.into())
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

fn get_exe_name_from_path(exe_path: &str) -> String {
    Path::new(exe_path)
        .file_name()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "unknown.exe".to_string())
}