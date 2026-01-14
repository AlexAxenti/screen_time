use std::{thread::sleep, time::Duration};

use windows::{Win32::{Foundation::CloseHandle, System::Threading::{OpenProcess, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION, QueryFullProcessImageNameW}, UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId}}, core::PWSTR};

fn main() {
    loop {
        sleep(Duration::from_millis(500));

        let foreground_window_hwnd = unsafe {
            GetForegroundWindow()
        };

        let window_text_length = unsafe {
            GetWindowTextLengthW(foreground_window_hwnd)
        };

        let mut buffer = vec![0u16; (window_text_length + 1) as usize];

        println!("Window length: {window_text_length}");

        unsafe {
            GetWindowTextW(foreground_window_hwnd, &mut buffer)
        };

        let window_text = String::from_utf16_lossy(&buffer);

        println!("Window text: {window_text}");

        let mut hwnd_process_id: u32 = 0;
        unsafe {
            GetWindowThreadProcessId(foreground_window_hwnd, Some(&mut hwnd_process_id));
        }

        println!("Window pid: {hwnd_process_id}");

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

        let mut process_image_buffer = vec![0u16; 256];

        let pwstr = PWSTR(process_image_buffer.as_mut_ptr());

        let mut lpdwsize: u32 = 256;

        if let Err(e) = unsafe {
            QueryFullProcessImageNameW(process_handle, PROCESS_NAME_WIN32, pwstr, &mut lpdwsize)
        } { 
            println!("Error {e}");
        }

        let process_exe = String::from_utf16_lossy(&process_image_buffer[0..lpdwsize as usize]);

        println!("Process exe: {process_exe}");

        if let Err(e) = unsafe {
            CloseHandle(process_handle)
        } {
            eprintln!("Failed to close handle {e}");
        }
    }
}
