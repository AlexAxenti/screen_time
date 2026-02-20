use std::time::Duration;
use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
use windows::Win32::System::SystemInformation::GetTickCount64;
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

pub fn get_idle_duration() -> Duration {
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

//TODO use clear struct instead of random tuple
pub fn sample_foreground() -> Option<(String, String)> {
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