mod apps_worker;

use std::{
    collections::HashSet, path::{Path, PathBuf}, sync::mpsc::{self, Receiver, Sender}, thread::{self, sleep}, time::{Duration, SystemTime}
};

use windows::{Win32::Storage::FileSystem::{GetFileVersionInfoSizeW, GetFileVersionInfoW, VerQueryValueW}, core::{BOOL, PWSTR}};
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

use crate::{AppInfo, ControlMsg, WindowSegment};

const IDLE_DURATION: u64 = 120000;

pub fn start(tx_segments: Sender<WindowSegment>, rx_control: Receiver<ControlMsg>) {
    let mut main_segment: Option<WindowSegment> = None;
    let mut running= true;
    let mut applications_found: HashSet<String> = HashSet::new();

    //Init apps worker
    let (tx_apps, rx_apps): 
        (Sender<AppInfo>, Receiver<AppInfo>) = mpsc::channel();

    let apps_worker_handle = thread::spawn(move || {
        apps_worker::start(rx_apps);
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

        let window_exe = get_exe_name_from_path(&window_exe_path).to_lowercase();

        // Hash window exe for app id key
        let hash = blake3::hash(window_exe_path.as_bytes());

        let full_bytes = hash.as_bytes();
        let truncated = &full_bytes[..16];
        let app_id = hex::encode(truncated);

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

        // Check if unfocused/empty explorer
        // TODO change from unfocused to ignore list or something
        let is_unfocused = is_unfocused(&window_exe);

        // Construct sampled segment
        let sampled_segment = WindowSegment::new(
            app_id,
            window_name,
            window_exe,
            sample_start_time);        

        // Update state
        update_state(&mut main_segment, sampled_segment, is_unfocused, sample_start_time, &tx_segments);
    }

    drop(tx_apps);
    apps_worker_handle.join().expect("Failed to close apps worker thread");
    println!("Apps thread closed");
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

// TODO reuse path -> name function
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

//TODO clean up
// Temp code for getting display name
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

use windows::core::PCWSTR;

fn to_wide_null(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

fn query_version_string(block: &[u8], sub_block: &str) -> Option<String> {
    let sub_block_w = to_wide_null(sub_block);

    let mut ptr: *mut core::ffi::c_void = core::ptr::null_mut();
    let mut len: u32 = 0;

    let ok: BOOL = unsafe {
        VerQueryValueW(
            block.as_ptr() as *const core::ffi::c_void,
            PCWSTR(sub_block_w.as_ptr()),
            &mut ptr,
            &mut len,
        )
    };

    if !ok.as_bool() || ptr.is_null() || len == 0 {
        return None;
    }

    // len is in *wide chars* for string values (includes null terminator)
    let wide = unsafe { std::slice::from_raw_parts(ptr as *const u16, len as usize) };

    // Strip trailing null(s)
    let trimmed_len = wide.iter().position(|&c| c == 0).unwrap_or(wide.len());
    String::from_utf16(&wide[..trimmed_len]).ok().map(|s| s.trim().to_string())
}

fn get_translation_lang_codepage(block: &[u8]) -> Option<(u16, u16)> {
    // Query translation table: \VarFileInfo\Translation
    let sub_block_w = to_wide_null(r"\VarFileInfo\Translation");

    let mut ptr: *mut core::ffi::c_void = core::ptr::null_mut();
    let mut len: u32 = 0;

    let ok: BOOL = unsafe {
        VerQueryValueW(
            block.as_ptr() as *const core::ffi::c_void,
            PCWSTR(sub_block_w.as_ptr()),
            &mut ptr,
            &mut len,
        )
    };

    if !ok.as_bool() || ptr.is_null() || len < 4 {
        return None;
    }

    // Translation entries are pairs of u16: LANGID, CODEPAGE
    let bytes = unsafe { std::slice::from_raw_parts(ptr as *const u8, len as usize) };

    if bytes.len() < 4 {
        return None;
    }

    // Read first LANGID/CODEPAGE pair (little endian)
    let lang = u16::from_le_bytes([bytes[0], bytes[1]]);
    let codepage = u16::from_le_bytes([bytes[2], bytes[3]]);
    Some((lang, codepage))
}

/// Returns (FileDescription or ProductName) from EXE version metadata.
/// Returns None if no version info or no matching strings.
pub fn get_exe_display_name_from_version_info(exe_path: &str) -> windows::core::Result<Option<String>> {
    let exe_w = to_wide_null(exe_path);

    let mut handle: u32 = 0;
    let size = unsafe { GetFileVersionInfoSizeW(PCWSTR(exe_w.as_ptr()), Some(&mut handle)) };

    if size == 0 {
        // No version info
        return Ok(None);
    }

    let mut block = vec![0u8; size as usize];

    let ok = unsafe {
        GetFileVersionInfoW(
            PCWSTR(exe_w.as_ptr()),
            None,
            size,
            block.as_mut_ptr() as *mut core::ffi::c_void,
        )
    };

    if ok.is_err() {
        // Windows API failure; surface as "None" or you can return Err if you prefer
        return Ok(None);
    }

    // Find the language/codepage
    let (lang, codepage) = match get_translation_lang_codepage(&block) {
        Some(v) => v,
        None => {
            // Some binaries omit translation info; you can try a common default if you want.
            // 0x0409 = en-US, 0x04B0 = Unicode
            (0x0409, 0x04B0)
        }
    };

    // Build StringFileInfo queries
    let file_desc_key = format!(r"\StringFileInfo\{:04x}{:04x}\FileDescription", lang, codepage);
    let product_name_key = format!(r"\StringFileInfo\{:04x}{:04x}\ProductName", lang, codepage);

    // Prefer FileDescription, fallback ProductName
    if let Some(s) = query_version_string(&block, &file_desc_key) {
        if !s.is_empty() {
            return Ok(Some(s));
        }
    }

    if let Some(s) = query_version_string(&block, &product_name_key) {
        if !s.is_empty() {
            return Ok(Some(s));
        }
    }

    Ok(None)
}

// TODO Clean up
//Temp extract icons code
use std::fs;
use windows_icons::get_icon_by_path;

// ---- small helpers ----

fn icon_out_path(icons_dir: &Path, app_id: &str) -> PathBuf {
    icons_dir.join(format!("{app_id}.png"))
}

// ---- main entrypoint ----

/// Ensures `<icons_dir>/<app_id>.png` exists. If it's already there, does nothing.
/// Returns:
/// - Ok(Some(path)) if the icon already existed or was created
/// - Ok(None) if extraction failed (caller should use placeholder icon)
pub fn ensure_icon_png_from_exe(
    icons_dir: &Path,
    app_id: &str,
    exe_path: &str,
) {
    fs::create_dir_all(icons_dir).expect("Failed to create icons dir");

    let out_path = icon_out_path(icons_dir, app_id);

    // 1) Cache hit: if it exists, we're done
    if out_path.exists() {
        return;
    }

    let icon = get_icon_by_path(exe_path).expect("Failed to get icon");

    icon.save(out_path).expect("Failed to save icon");
}