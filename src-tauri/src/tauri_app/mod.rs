mod commands;
pub mod dtos;

use std::thread::JoinHandle;
use std::sync::mpsc::Sender;

use tauri::{Manager, RunEvent, WebviewWindowBuilder};
use tauri::menu::{MenuBuilder};
use tauri::tray::{TrayIconBuilder};

use crate::ControlMsg;

pub fn run(tx_control: Sender<ControlMsg>, mut sql_handle: Option<JoinHandle<()>>, mut sampler_handle: Option<JoinHandle<()>>) {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_top_usage, 
            commands::get_usage_summary,
            commands::get_usage_fragmentation
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