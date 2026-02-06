mod commands;
mod protocols;
mod setup;

use std::thread::JoinHandle;
use std::sync::mpsc::Sender;

use tauri::RunEvent;

use crate::ControlMsg;
use crate::tauri_app::protocols::handle_icon_request;
use crate::tauri_app::setup::setup_menu;

pub fn run(tx_control: Sender<ControlMsg>, mut sql_handle: Option<JoinHandle<()>>, mut sampler_handle: Option<JoinHandle<()>>) {
    tauri::Builder::default()
        .register_uri_scheme_protocol("icons", |_app, request| { 
            handle_icon_request(request)
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
            setup_menu(app, tx_control)
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