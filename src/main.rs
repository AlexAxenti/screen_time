use std::{
    path::Path, thread::sleep, time::{Duration, SystemTime}
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

//TODO track exe name without path, and add Path variable
struct WindowSegment {
    window_name: String,
    window_exe: String,
    focus_start_time: SystemTime,
    focus_end_time: Option<SystemTime>,
}

fn main() {
    let mut main_segment: Option<WindowSegment> = None;
    loop {
        sleep(Duration::from_millis(500));
        
        // Calculate time since last input
        let last_input_duration = {
            let mut last_input_info = LASTINPUTINFO {
                cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
                dwTime: 0,
            };

            let success = unsafe {
                GetLastInputInfo(&mut last_input_info)
            };

            if !success.as_bool() {
                eprintln!("Failed to get the last input info");
                // last_input_duration = Duration::from_millis(0);
                Duration::from_millis(0)
            } else {
                let tick_count = unsafe { GetTickCount64() };

                let diff = tick_count - last_input_info.dwTime as u64;

                // last_input_duration = Duration::from_millis(diff.into())
                Duration::from_millis(diff.into())
            }            
        };

        println!("Time since last input: {:?}", last_input_duration);

        if last_input_duration > Duration::from_millis(5000) {
            // let end_time = SystemTime::now();
            // segment.focus_end_time = Some(end_time);
            // //TODO: Write to SQL

            // println!("Lost focus, duration: {:?}", end_time.duration_since(segment.focus_start_time));
            // main_segment = None;
            println!("Idle");
            continue;
        }

        // Track time for segment
        let start_time = SystemTime::now();

        // Get foreground window HWND
        let foreground_window_hwnd = unsafe {
            GetForegroundWindow()
        };

        // Get foreground window text name
        let window_text_length = unsafe {
            GetWindowTextLengthW(foreground_window_hwnd)
        };

        let mut buffer = vec![0u16; (window_text_length + 1) as usize];

        // println!("Window length: {window_text_length}");

        let chars_count = unsafe {
            GetWindowTextW(foreground_window_hwnd, &mut buffer)
        };

        let window_text = String::from_utf16_lossy(&buffer[0..chars_count as usize]);

        // println!("Window text: {:?}", window_text);

        // Get PID
        let mut hwnd_process_id: u32 = 0;
        unsafe {
            GetWindowThreadProcessId(foreground_window_hwnd, Some(&mut hwnd_process_id));
        }

        // println!("Window pid: {hwnd_process_id}");

        // Get process handle
        let process_handle = match unsafe {
            OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, hwnd_process_id)
        } {
            Ok(handle) => {
                handle
            }
            Err(e) => {
                eprintln!("Failed to open process {e}");
                continue;
            }
        };

        // Get process exe path
        let mut process_image_buffer = vec![0u16; 256];

        let pwstr = PWSTR(process_image_buffer.as_mut_ptr());

        let mut lpdwsize: u32 = 256;

        if let Err(e) = unsafe {
            QueryFullProcessImageNameW(process_handle, PROCESS_NAME_WIN32, pwstr, &mut lpdwsize)
        } { 
            eprintln!("Error {e}");
        }

        let process_exe = String::from_utf16_lossy(&process_image_buffer[0..lpdwsize as usize]);

        // println!("Process exe: {process_exe}");

        // Close handle
        if let Err(e) = unsafe {
            CloseHandle(process_handle)
        } {
            eprintln!("Failed to close handle {e}");
        }

        // Construct sampled segment
        // TODO Check for empty explorer first
        let sampled_segment = WindowSegment {
            window_name: window_text,
            window_exe: process_exe,
            focus_start_time: start_time,
            focus_end_time: None
        };

        // check if unfocused/empty explorer
        let exe_path = Path::new(&sampled_segment.window_exe);

        let exe_name = exe_path
            .file_name()
            .map(|s| s.to_string_lossy().into_owned())
            .unwrap_or_else(|| "Invalid filename".to_string())
            .to_lowercase();

        let is_unfocused = if exe_name == "explorer.exe" && sampled_segment.window_name.len() == 0 {
            true
        } else {
            false
        };

        // println!("Length: {}", sampled_segment.window_name.len());

        // Compare to main_segment
        match main_segment.as_mut() {
            None => {
                if is_unfocused {
                    continue;
                }

                println!("New focus: {} | {}", sampled_segment.window_name, sampled_segment.window_exe);
                
                main_segment = Some(sampled_segment);
            },
            Some(segment) => {
                if is_unfocused {
                    let end_time = SystemTime::now();
                    segment.focus_end_time = Some(end_time);
                    //TODO: Write to SQL

                    println!("Lost focus, duration: {:?}", end_time.duration_since(segment.focus_start_time));
                    main_segment = None;
                } else if segment.window_exe == sampled_segment.window_exe {
                    continue;
                } else {
                    let end_time = SystemTime::now();
                    segment.focus_end_time = Some(end_time);
                    //TODO: Write to SQL
                    println!("Ending focus, duration: {:?}", end_time.duration_since(segment.focus_start_time));
                    println!("New focus: {} | {}", sampled_segment.window_name, sampled_segment.window_exe);

                    main_segment = Some(sampled_segment);
                }
            }
        }
    }
}
