use std::sync::mpsc::{self, Receiver, Sender};
use std::{thread};

use screen_time::{sql_layer, sampler, WindowSegment, ControlMsg};

use tao::event_loop::EventLoopBuilder;
use tao::platform::run_return::EventLoopExtRunReturn;
use tao::{
    event::Event,
    event_loop::{ControlFlow, EventLoop},
};

use tray_icon::{
    menu::{Menu, MenuEvent, MenuItem, PredefinedMenuItem},
    Icon, TrayIconBuilder, TrayIconEvent,
};

#[derive(Debug, Clone)]
enum UserEvent {
    Tray(TrayIconEvent),
    Menu(MenuEvent),
}


fn main() {
    //TODO Thread error handling

    let (tx_segments, rx_segments): 
        (Sender<WindowSegment>, Receiver<WindowSegment>) = mpsc::channel();

    let sql_handle = thread::spawn(move || {
        sql_layer::writer_loop(rx_segments);
    });

    let (tx_control, rx_control): 
        (Sender<ControlMsg>, Receiver<ControlMsg>) = mpsc::channel();

    let sampler_handle = thread::spawn(|| {
        sampler::start(tx_segments, rx_control);
    });


    let mut event_loop: EventLoop<UserEvent> = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let proxy = event_loop.create_proxy();

    TrayIconEvent::set_event_handler(Some(move |event| {
        let _ = proxy.send_event(UserEvent::Tray(event));
    }));

    let proxy = event_loop.create_proxy();
    MenuEvent::set_event_handler(Some(move |event| {
        let _ = proxy.send_event(UserEvent::Menu(event));
    }));

     let menu = Menu::new();

    let pause_item = MenuItem::new("Pause", true, None);
    let resume_item = MenuItem::new("Resume", true, None);
    let quit_item = MenuItem::new("Quit", true, None);

    menu.append(&pause_item).unwrap();
    menu.append(&resume_item).unwrap();
    menu.append(&PredefinedMenuItem::separator()).unwrap();
    menu.append(&quit_item).unwrap();

    let tray_icon = TrayIconBuilder::new()
        .with_tooltip("Screen Time (Rust)")
        .with_icon(load_icon())
        .with_menu(Box::new(menu))
        .build()
        .expect("failed to build tray icon");
    
    event_loop.run_return(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        let _keep_alive = &tray_icon;

        match event {
            Event::UserEvent(UserEvent::Menu(menu_event)) => {
                let id = menu_event.id;

                if id == pause_item.id().clone() {
                    println!("Pause clicked");
                    tx_control.send(ControlMsg::Pause).ok();
                } else if id == resume_item.id().clone() {
                    println!("Resume clicked");
                    tx_control.send(ControlMsg::Resume).ok();
                } else if id == quit_item.id().clone() {
                    println!("Quit clicked");
                    tx_control.send(ControlMsg::Shutdown).ok();

                    *control_flow = ControlFlow::Exit;
                }
            }

            Event::UserEvent(UserEvent::Tray(tray_event)) => {
                // Optional: handle click events on the tray icon itself
                // println!("Tray event: {:?}", tray_event);
                let _ = tray_event;
            }

            _ => {}
        }
    });

    sampler_handle.join().unwrap();
    sql_handle.join().unwrap();

    println!("Shutting down");
}

fn load_icon() -> Icon {
    let bytes = include_bytes!("../assets/icon.png");

    let image = image::load_from_memory(bytes)
        .expect("failed to decode tray icon png")
        .into_rgba8();

    let (width, height) = image.dimensions();
    let rgba = image.into_raw();

    Icon::from_rgba(rgba, width, height).expect("Failed to create tray icon")
}