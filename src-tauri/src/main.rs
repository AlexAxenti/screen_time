use std::{
    sync::mpsc::{self, Receiver, Sender},
    thread
};

use screen_time::{
    sampler,
    sql_client::{self, reader::{query_usage, query_usage_summary}},
    ControlMsg, UsageSummaryDTO, WindowSegment, WindowSegmentDTO
};

use tauri::{Manager, RunEvent, WebviewWindowBuilder};
use tauri::menu::{MenuBuilder};
use tauri::tray::{TrayIconBuilder};

fn main() {
    //TODO Thread error handling
    let (tx_segments, rx_segments): 
        (Sender<WindowSegment>, Receiver<WindowSegment>) = mpsc::channel();

    let mut sql_handle = Some(thread::spawn(move || {
        sql_client::run_sql_client(rx_segments);
    }));

    let (tx_control, rx_control): 
        (Sender<ControlMsg>, Receiver<ControlMsg>) = mpsc::channel();

    let mut sampler_handle = Some(thread::spawn(move || {
        sampler::start(tx_segments, rx_control);
    }));

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_usage, get_usage_summary])
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

#[tauri::command]
fn greet() -> String {
    "Hello there!".to_string()
}

#[tauri::command]
fn get_usage() -> Vec<WindowSegmentDTO> {
    let window_segments = query_usage().expect("Failed to read from DB");

    window_segments
}

#[tauri::command]
fn get_usage_summary(start_time: i64) -> UsageSummaryDTO {
    println!("Received command");
    let usage_summary = query_usage_summary(start_time).expect("Failed to read from DB");

    usage_summary
}