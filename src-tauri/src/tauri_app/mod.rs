mod commands;
mod protocols;
mod setup;

use std::thread::JoinHandle;
use std::sync::mpsc::Sender;

use tauri::RunEvent;

use crate::ControlMsg;

const HIDE_ON_CLOSE: bool = false;

pub struct AppState {
    pub tx_control: Sender<ControlMsg>,
}

pub fn run(tx_control: Sender<ControlMsg>, mut sql_handle: Option<JoinHandle<()>>, mut sampler_handle: Option<JoinHandle<()>>) {
    let app_state = AppState { tx_control };

    tauri::Builder::default()
        .manage(app_state)
        .register_uri_scheme_protocol("icons", |_app, request| { 
            protocols::handle_icon_request(request)
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if HIDE_ON_CLOSE {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(commands::handler())
        .setup(|app| {
            setup::setup_menu(app)
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