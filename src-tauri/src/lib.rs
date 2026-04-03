mod commands;
mod sb;

use commands::{recent, save, settings, window};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            save::save_to_sb,
            save::test_connection,
            recent::fetch_recent_notes,
            settings::get_settings,
            settings::save_settings,
            window::set_always_on_top,
            window::show_and_focus,
        ])
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
