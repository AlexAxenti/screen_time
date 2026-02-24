use std::env;
use std::io;
use std::path::PathBuf;

use winreg::enums::*;
use winreg::RegKey;

const REG_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const APP_REGISTRY_NAME: &str = "ScreenTime";

pub fn configure_start_on_startup(enable: bool) -> io::Result<()> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    let (run_key, _) = hkcu.create_subkey(REG_PATH)?;

    if enable {
        enable_startup(&run_key)
    } else {
        disable_startup(&run_key)
    }
}

fn enable_startup(run_key: &RegKey) -> io::Result<()> {
    let exe_path: PathBuf = env::current_exe()?;

    let exe_str = exe_path
        .to_str()
        .ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Invalid exe path"))?;

    // quoting path in case of spaces
    let quoted = format!("\"{}\"", exe_str);

    match run_key.get_value::<String, _>(APP_REGISTRY_NAME) {
        Ok(existing) if existing == quoted => {
            return Ok(());
        }
        _ => {
            run_key.set_value(APP_REGISTRY_NAME, &quoted)?;
        }
    }

    Ok(())
}

fn disable_startup(run_key: &RegKey) -> io::Result<()> {
    match run_key.delete_value(APP_REGISTRY_NAME) {
        Ok(_) => Ok(()),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e),
    }
}