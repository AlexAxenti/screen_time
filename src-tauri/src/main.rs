use std::sync::mpsc::{self, Receiver, Sender};
use std::{thread};

use screen_time::{sql_layer, sampler, WindowSegment, ControlMsg};
use tauri::{RunEvent, WebviewWindowBuilder};
use tauri::menu::{MenuBuilder};
use tauri::tray::{TrayIconBuilder};

fn main() {
    //TODO Thread error handling
    let (tx_segments, rx_segments): 
        (Sender<WindowSegment>, Receiver<WindowSegment>) = mpsc::channel();

    let mut sql_handle = Some(thread::spawn(move || {
        sql_layer::run_sql_layer(rx_segments);
    }));

    let (tx_control, rx_control): 
        (Sender<ControlMsg>, Receiver<ControlMsg>) = mpsc::channel();

    let mut sampler_handle = Some(thread::spawn(move || {
        sampler::start(tx_segments, rx_control);
    }));

    tauri::Builder::default()
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("resume", "Resume")
                .text("pause", "Pause")
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

            let _window = WebviewWindowBuilder::new(
                app, 
                "ScreenTime", 
                tauri::WebviewUrl::App("index.html".into()))
            .title("Screen Time")
            .build()
            .expect("failed to build window");

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
