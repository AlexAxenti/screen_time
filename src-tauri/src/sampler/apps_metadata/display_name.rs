
use windows::{
    Win32::Storage::FileSystem::{
        GetFileVersionInfoSizeW, 
        GetFileVersionInfoW, 
        VerQueryValueW
    }, 
    core::BOOL
};
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

use windows::core::PCWSTR;

pub fn get_exe_display_name_from_version_info(exe_path: &str) -> windows::core::Result<Option<String>> {
    let exe_w = to_wide_null(exe_path);

    let mut handle: u32 = 0;
    let size = unsafe { GetFileVersionInfoSizeW(PCWSTR(exe_w.as_ptr()), Some(&mut handle)) };

    if size == 0 {
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
        return Ok(None);
    }

    let (lang, codepage) = match get_translation_lang_codepage(&block) {
        Some(v) => v,
        None => {
            // Attempting default 0x0409 = en-US, 0x04B0 = Unicode
            (0x0409, 0x04B0)
        }
    };

    let file_desc_key = format!(r"\StringFileInfo\{:04x}{:04x}\FileDescription", lang, codepage);
    let product_name_key = format!(r"\StringFileInfo\{:04x}{:04x}\ProductName", lang, codepage);
    
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

    let wide = unsafe { std::slice::from_raw_parts(ptr as *const u16, len as usize) };

    let trimmed_len = wide.iter().position(|&c| c == 0).unwrap_or(wide.len());
    String::from_utf16(&wide[..trimmed_len]).ok().map(|s| s.trim().to_string())
}

fn get_translation_lang_codepage(block: &[u8]) -> Option<(u16, u16)> {
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

    let bytes = unsafe { std::slice::from_raw_parts(ptr as *const u8, len as usize) };

    if bytes.len() < 4 {
        return None;
    }

    let lang = u16::from_le_bytes([bytes[0], bytes[1]]);
    let codepage = u16::from_le_bytes([bytes[2], bytes[3]]);
    Some((lang, codepage))
}