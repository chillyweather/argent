mod commands;
mod sb;

use commands::{save, window};
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::Manager;

#[cfg(target_os = "macos")]
use cocoa::appkit::{NSView, NSVisualEffectBlendingMode, NSVisualEffectMaterial, NSVisualEffectState, NSVisualEffectView, NSWindow, NSWindowCollectionBehavior};
#[cfg(target_os = "macos")]
use cocoa::base::{id, nil};
#[cfg(target_os = "macos")]
use cocoa::foundation::NSRect;
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            save::save_to_sb,
            save::test_connection,
            save::fetch_note,
            save::save_note,
            window::set_always_on_top,
            window::show_and_focus,
        ])
        .setup(|app| {
            let open_window = MenuItemBuilder::with_id("open_window", "Open Window")
                .accelerator("CmdOrCtrl+N")
                .build(app)?;
            let dev_tools = MenuItemBuilder::with_id("dev_tools", "Open Dev Tools")
                .accelerator("CmdOrCtrl+Option+I")
                .build(app)?;

            let file_menu = SubmenuBuilder::new(app, "File")
                .item(&open_window)
                .separator()
                .item(&PredefinedMenuItem::quit(app, None)?)
                .build()?;

            let develop_menu = SubmenuBuilder::new(app, "Develop")
                .item(&dev_tools)
                .build()?;

            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .item(&PredefinedMenuItem::undo(app, None)?)
                .item(&PredefinedMenuItem::redo(app, None)?)
                .separator()
                .item(&PredefinedMenuItem::cut(app, None)?)
                .item(&PredefinedMenuItem::copy(app, None)?)
                .item(&PredefinedMenuItem::paste(app, None)?)
                .item(&PredefinedMenuItem::select_all(app, None)?)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&file_menu)
                .item(&edit_menu)
                .item(&develop_menu)
                .build()?;

            app.set_menu(menu)?;
            app.on_menu_event(move |app_handle, event| {
                if event.id() == open_window.id() {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                } else if event.id() == dev_tools.id() {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        window.open_devtools();
                    }
                }
            });

            #[cfg(target_os = "macos")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let ns_window = window.ns_window().unwrap() as id;
                    unsafe {
                        ns_window.setLevel_(8);

                        let behavior =
                            NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                                | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary
                                | NSWindowCollectionBehavior::NSWindowCollectionBehaviorManaged;
                        ns_window.setCollectionBehavior_(behavior);

                        let content_view = ns_window.contentView();
                        let bounds = NSView::bounds(content_view);

                        let vibrancy_view = NSVisualEffectView::alloc(nil);
                        let vibrancy_view = NSVisualEffectView::initWithFrame_(vibrancy_view, NSRect::new(bounds.origin, bounds.size));

                        vibrancy_view.setMaterial_(NSVisualEffectMaterial::UnderWindowBackground);
                        vibrancy_view.setBlendingMode_(NSVisualEffectBlendingMode::BehindWindow);
                        vibrancy_view.setState_(NSVisualEffectState::Active);
                        vibrancy_view.setWantsLayer(true);

                        let subviews: id = msg_send![content_view, subviews];
                        let existing_view: id = msg_send![subviews, objectAtIndex: 0];
                        
                        let _: () = msg_send![content_view, replaceSubview: existing_view with: vibrancy_view];
                        let _: () = msg_send![vibrancy_view, addSubview: existing_view];
                        
                        let _: () = msg_send![vibrancy_view, setAutoresizingMask: 18];
                    }
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Reopen { .. } = event {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        });
}
