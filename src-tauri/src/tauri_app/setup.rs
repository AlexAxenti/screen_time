use tauri::{App, menu::MenuBuilder, tray::TrayIconBuilder};

use crate::ControlMsg;
use super::AppState;

use tauri::{Manager, WebviewWindowBuilder};

pub fn setup_menu(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
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

        let state = app_handle.state::<AppState>();

        match event.id().0.as_str() {
            "quit" => {
                println!("Shutting down");
                state.tx_control.send(ControlMsg::Shutdown).ok();

                app_handle.exit(0);
            }
            "resume" => {
                println!("Resuming");
                state.tx_control.send(ControlMsg::Resume).ok();
            }
            "pause" => {
                println!("Pausing");
                state.tx_control.send(ControlMsg::Pause).ok();
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
}