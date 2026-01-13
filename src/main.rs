use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindow, GetWindowTextLengthW, GetWindowTextW};

fn main() {
    println!("Hello, world!");

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
}
