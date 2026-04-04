use tauri::WebviewWindow;

#[tauri::command]
pub fn set_always_on_top(window: WebviewWindow, always_on_top: bool) -> Result<(), String> {
    window
        .set_visible_on_all_workspaces(always_on_top)
        .map_err(|e| e.to_string())?;
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    {
        apply_macos_float(&window, always_on_top)?;
    }

    Ok(())
}

#[tauri::command]
pub fn show_and_focus(window: WebviewWindow) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())
}

#[cfg(target_os = "macos")]
fn apply_macos_float(window: &WebviewWindow, enable: bool) -> Result<(), String> {
    use std::sync::mpsc;

    let win = window.clone();
    let (tx, rx) = mpsc::channel();
    window
        .run_on_main_thread(move || {
            let result = configure_macos_float(&win, enable);
            let _ = tx.send(result);
        })
        .map_err(|e| e.to_string())?;

    rx.recv().map_err(|e| e.to_string())?
}

#[cfg(target_os = "macos")]
fn configure_macos_float(window: &WebviewWindow, enable: bool) -> Result<(), String> {
    use cocoa::appkit::{NSWindow, NSWindowCollectionBehavior};
    use cocoa::base::id;

    let ns_window = window.ns_window().map_err(|e| e.to_string())? as id;
    unsafe {
        let level: i64 = if enable { 8 } else { 0 };
        ns_window.setLevel_(level);

        let behavior = if enable {
            NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary
                | NSWindowCollectionBehavior::NSWindowCollectionBehaviorManaged
        } else {
            NSWindowCollectionBehavior::NSWindowCollectionBehaviorManaged
        };
        ns_window.setCollectionBehavior_(behavior);
    }

    Ok(())
}
