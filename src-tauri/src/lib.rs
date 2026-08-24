use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;

use tauri::{AppHandle, WebviewWindowBuilder};
use tauri_plugin_cli::CliExt;

struct Config {
    pub kiosk: bool,
}

static BACKEND_READY: AtomicBool = AtomicBool::new(false);
static CONFIG: OnceLock<Config> = OnceLock::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let mut config = app.config().app.windows[0].clone();
            let mut kiosk = false;

            if let Ok(matches) = app.cli().matches() {
                dbg!("{:?}", &matches);

                kiosk = matches
                    .args
                    .get("kiosk")
                    .and_then(|arg| arg.value.as_bool())
                    .unwrap_or(false);
                dbg!("{:?}", &kiosk);

                if kiosk {
                    config.height = config.height - 39.59;
                }
            }

            WebviewWindowBuilder::from_config(app.handle(), &config)?.build()?;

            CONFIG.set(Config { kiosk }).ok();

            BACKEND_READY.store(true, Ordering::SeqCst);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            is_backend_ready,
            get_initial_data,
            exit
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn is_backend_ready() -> bool {
    return BACKEND_READY.load(Ordering::SeqCst);
}

#[derive(Debug, Serialize, Deserialize)]
struct Initial {
    pub kiosk: bool,
}

#[tauri::command]
fn get_initial_data() -> Initial {
    return Initial {
        kiosk: CONFIG.get().unwrap().kiosk,
    };
}

#[tauri::command]
fn exit(app: AppHandle) {
    #[cfg(target_os = "macos")]
    {
        app.hide().unwrap();
    }
    #[cfg(not(target_os = "macos"))]
    {
        app.exit(0);
    }
}
