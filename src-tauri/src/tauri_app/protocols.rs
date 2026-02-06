use std::fs;

use tauri::http::{Response, StatusCode, header};

use crate::utils::paths::icons_dir;

pub fn handle_icon_request(
    request: tauri::http::Request<Vec<u8>>
) -> Response<Vec<u8>> {
    let mut name = request.uri().path().trim_start_matches('/');

    if name.is_empty() {
        if let Some(host) = request.uri().host() {
            name = host;
        }
    }

    if name.is_empty() || !is_safe_icon_name(name) {
        return Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body(Vec::new())
            .unwrap();
    }

    let path = icons_dir().join(name);

    match fs::read(path) {
        Ok(bytes) => Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "image/png")
            .body(bytes)
            .unwrap(),
        Err(_) => Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Vec::new())
            .unwrap(),
    }
}

fn is_safe_icon_name(s: &str) -> bool {
    if !s.ends_with(".png") {
        return false;
    }
    let stem = &s[..s.len() - 4]; // remove ".png"
    !stem.is_empty() && stem.chars().all(|c| c.is_ascii_hexdigit())
}