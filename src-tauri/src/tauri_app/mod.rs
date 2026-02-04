mod commands;
pub mod dtos;

use std::thread::JoinHandle;
use std::sync::mpsc::Sender;
use std::{fs};

use tauri::{Manager, RunEvent, WebviewWindowBuilder};
use tauri::menu::{MenuBuilder};
use tauri::tray::{TrayIconBuilder};
use tauri::http::{header, Response, StatusCode};

use crate::ControlMsg;
use crate::paths::icons_dir;

pub fn run(tx_control: Sender<ControlMsg>, mut sql_handle: Option<JoinHandle<()>>, mut sampler_handle: Option<JoinHandle<()>>) {
    tauri::Builder::default()
        .register_uri_scheme_protocol("icons", move |_app, request| {
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
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_top_usage, 
            commands::get_usage_summary,
            commands::get_usage_fragmentation,
            commands::get_weeks_daily_usage,
            commands::get_applications,
            commands::search_applications
        ])
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("resume", "Resume")
                .text("pause", "Pause")
                .separator()
                .text("dashboard", "Open Dashboard")
                .separator()
                .text("quit", "Quit")
                .build()
                .expect("failed to build menu");

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Screen Time Tracker")
                .build(app)
                .expect("failed to build tray icon");

            app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
                println!("Menu event: {:?}", event.id());

                match event.id().0.as_str() {
                    "quit" => {
                        println!("Shutting down");
                        tx_control.send(ControlMsg::Shutdown).ok();

                        app_handle.exit(0);
                    }
                    "resume" => {
                        println!("Resuming");
                        tx_control.send(ControlMsg::Resume).ok();
                    }
                    "pause" => {
                        println!("Pausing");
                        tx_control.send(ControlMsg::Pause).ok();
                    }
                    "dashboard" => {
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        } else {
                            let win = WebviewWindowBuilder::new(
                                app_handle, 
                                "main", 
                                tauri::WebviewUrl::App("index.html".into()))
                            .title("Screen Time")
                            .inner_size(1200.0, 800.0)
                            .center()
                            .build();

                            if let Ok(win) = win {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                    _ => {
                        println!("Unhandled event");
                    }
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app_handle, event| {
            match event {
                RunEvent::ExitRequested { api, code, .. } => {
                    if code.is_none() {
                        api.prevent_exit();
                    } else {
                        println!("exit code: {:?}", code);
                    }
                }
                RunEvent::Exit => {
                    println!("Shutdown cleaning");
                    if let Some(h) = sampler_handle.take() {
                        h.join().unwrap();
                        println!("Sampler thread closed");
                    }
                    if let Some(h) = sql_handle.take() {
                        h.join().unwrap();
                        println!("Sql thread closed");
                    }
                }
                _ => {}
            }
        });
}

fn is_safe_icon_name(s: &str) -> bool {
    if !s.ends_with(".png") {
        return false;
    }
    let stem = &s[..s.len() - 4]; // remove ".png"
    !stem.is_empty() && stem.chars().all(|c| c.is_ascii_hexdigit())
}