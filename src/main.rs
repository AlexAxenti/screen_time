use std::sync::mpsc::{self, Receiver, Sender};
use std::{io, thread};

use screen_time::{sql_layer, sampler, WindowSegment, ControlMsg};

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

    loop {
        let mut input = String::new();

        io::stdin().read_line(&mut input).expect("Failed to read line");

        let trimmed_input = input.trim();

        if trimmed_input == "p" {
            tx_control.send(ControlMsg::Pause).expect("Failed to pause");
        } else if trimmed_input == "r" {
            tx_control.send(ControlMsg::Resume).expect("Failed to resume");
        } else if trimmed_input == "q" {
            tx_control.send(ControlMsg::Shutdown).expect("Failed to shutdown");
            break;
        }
    }

    sampler_handle.join().unwrap();
    sql_handle.join().unwrap();

    println!("Shutting down");
}
