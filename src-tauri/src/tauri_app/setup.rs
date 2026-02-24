use std::sync::Arc;

use tauri::{App, menu::{MenuBuilder, MenuItemBuilder}, tray::TrayIconBuilder};

use crate::ControlMsg;
use super::AppState;

use tauri::{Manager, WebviewWindowBuilder};

pub fn setup_menu(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let state = app.state::<AppState>();
    let is_paused = *state.is_paused.lock().expect("Failed to access is paused mutex");

    let resume_item = Arc::new(
        MenuItemBuilder::with_id("resume", "Resume")
        .enabled(is_paused)           // only enabled if paused
        .build(app)?
    );

    let pause_item = Arc::new(
        MenuItemBuilder::with_id("pause", "Pause")
        .enabled(!is_paused)          // only enabled if running
        .build(app)?
    );

    let menu = MenuBuilder::new(app)
        .item(resume_item.as_ref())
        .item(pause_item.as_ref())
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

    let resume_item_cb = Arc::clone(&resume_item);
    let pause_item_cb  = Arc::clone(&pause_item);

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
                let mut paused = state.is_paused.lock().expect("Failed to access is paused mutex");
                if !*paused {
                    return;
                }

                *paused = false;
                state.tx_control.send(ControlMsg::Resume).ok();

                pause_item_cb.set_enabled(true).ok();
                resume_item_cb.set_enabled(false).ok();
            }
            "pause" => {
                println!("Pausing");
                let mut paused = state.is_paused.lock().expect("Failed to access is paused mutex");
                if *paused {
                    return;
                }

                *paused = true;
                state.tx_control.send(ControlMsg::Pause).ok();

                pause_item_cb.set_enabled(false).ok();
                resume_item_cb.set_enabled(true).ok();
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
                    .visible(false)
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