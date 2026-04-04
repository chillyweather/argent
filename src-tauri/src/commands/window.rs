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
    use objc2::msg_send;
    use raw_window_handle::{HasWindowHandle, RawWindowHandle};

    let handle = window.window_handle().map_err(|e| e.to_string())?;
    let RawWindowHandle::AppKit(ah) = handle.as_raw() else {
        return Err("unsupported macOS window handle".to_string());
    };

    let ns_view = ah.ns_view.as_ptr() as *mut objc2::runtime::AnyObject;
    unsafe {
        let ns_window: *mut objc2::runtime::AnyObject = msg_send![ns_view, window];
        if ns_window.is_null() {
            return Err("failed to access NSWindow".to_string());
        }

        // NSPopUpMenuWindowLevel = 100 floats above fullscreen apps (~24–25).
        // Do NOT set fullScreenAuxiliary — it hides the window from Mission Control.
        let level: isize = if enable { 100 } else { 0 };
        let _: () = msg_send![ns_window, setLevel: level];

        let current: usize = msg_send![ns_window, collectionBehavior];
        // canJoinAllSpaces = 1 << 0 = 1
        let new_behavior = if enable {
            current | 1
        } else {
            current & !1
        };
        let _: () = msg_send![ns_window, setCollectionBehavior: new_behavior];
    }

    Ok(())
}
