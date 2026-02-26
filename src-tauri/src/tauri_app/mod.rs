mod commands;
mod protocols;
mod setup;
mod startup;

use std::sync::Mutex;
use std::thread::JoinHandle;
use std::sync::mpsc::Sender;

use tauri::{Emitter, Manager, RunEvent};

use crate::ControlMsg;
use crate::types::models::{CloseBehavior, TauriRuntimeSettings};

pub struct AppState {
    pub tx_control: Sender<ControlMsg>,
    pub runtime_settings: Mutex<TauriRuntimeSettings>,
    pub is_paused: Mutex<bool>
}

pub fn run(
    tx_control: Sender<ControlMsg>, 
    mut sql_handle: Option<JoinHandle<()>>, 
    mut sampler_handle: Option<JoinHandle<()>>,
    runtime_settings: TauriRuntimeSettings
) {
    let app_state = AppState { 
        tx_control, 
        runtime_settings: Mutex::new(runtime_settings),
        is_paused: Mutex::new(false)
    };

    tauri::Builder::default()
        .manage(app_state)
        .register_uri_scheme_protocol("icons", |_app, request| { 
            protocols::handle_icon_request(request)
        })
        .on_window_event(move |window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let state = window.state::<AppState>();

                let settings = state
                    .runtime_settings
                    .lock()
                    .expect("Failed to access runtime settings");

                if matches!(settings.close_behavior, CloseBehavior::Hide) {
                    api.prevent_close();
                    let _ = window.hide();
                    let _ = window.emit("app:reset-to-dashboard", ());
                }
            }
        })
        .invoke_handler(commands::handler())
        .setup(|app| {
            let state = app.state::<AppState>();
            let settings = state.runtime_settings.lock().expect("Failed to acquire runtime settings lock");

            if !settings.is_onboarded {
                println!("Starting app {}", settings.is_onboarded);
                setup::create_webview_window(app.handle());
            };

            drop(settings);
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