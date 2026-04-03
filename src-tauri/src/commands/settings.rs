use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub sb_url: String,
    pub sb_token: String,
    pub global_shortcut: String,
    pub always_on_top: bool,
    pub hide_after_save: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            sb_url: String::new(),
            sb_token: String::new(),
            global_shortcut: if cfg!(target_os = "macos") {
                "Cmd+Shift+Space".to_string()
            } else {
                "Ctrl+Shift+Space".to_string()
            },
            always_on_top: false,
            hide_after_save: true,
        }
    }
}

#[tauri::command]
pub fn get_settings() -> Settings {
    Settings::default()
}

#[tauri::command]
pub fn save_settings(_settings: Settings) -> Result<(), String> {
    Ok(())
}
