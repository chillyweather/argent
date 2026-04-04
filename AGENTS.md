# AGENTS.md — Argent

Argent is a fast desktop scratchpad for SilverBullet, built with **Tauri v2** (Rust backend) + **React** + **TypeScript** + **Tailwind CSS** + **Zustand** for state + **CodeMirror 6** with live WYSIWYG markdown preview.

## Build / Dev Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (frontend only, port 1420) |
| `npm run build` | Type-check (`tsc --noEmit`) then build frontend with Vite |
| `cargo check` | Type-check Rust backend (`src-tauri/`) |
| `cargo build` | Build Rust backend |
| `npx tsc --noEmit` | TypeScript type-check only |
| `npx vite build` | Frontend build only (no type-check) |
| `npm run tauri dev` | Full Tauri dev app (Rust + Vite) |
| `npm run tauri build` | Production build |
| `cargo test` | Run Rust tests |

No test framework is configured on the frontend. No single-test commands exist yet.

## Project Structure

```
src/                          # React frontend
  App.tsx                     # Root: window setup, save orchestration, always-on-top restore
  types.ts                    # Shared types: AppStatus, Settings, Draft
  components/
    Editor.tsx                # Content wrapper: local state, autosave draft, status footer
    MarkdownEditor.tsx        # CodeMirror 6 wrapper: vim mode (Compartment), live preview
    TopBar.tsx                # Title bar: drag region, open SB button, pin button, settings
    SettingsPanel.tsx         # Modal: SB URL, token, vim toggle, test connection
  store/                      # Zustand stores with persist middleware
    settings.ts               # Persisted (localStorage): SB config, always-on-top, vimEnabled
    draft.ts                  # Persisted (localStorage): editor draft for crash recovery
    status.ts                 # Volatile: app status + error message (setError only sets message)
  lib/
    status.ts                 # getStatusColor, getStatusText, parseErrorStatus
    codemirror/
      live-preview.ts         # WYSIWYG decorations: headings, bold, italic, links, code, checklists
      theme.ts                # CodeMirror base theme + highlight style
  index.css                   # Tailwind directives + CSS vars + CodeMirror overrides

src-tauri/                    # Rust backend
  src/
    main.rs                   # Entry: calls argent_lib::run()
    lib.rs                    # Plugin setup, native menus, Reopen handler
    commands/
      mod.rs                  # Module re-exports
      save.rs                 # save_to_sb, test_connection commands
      window.rs               # set_always_on_top (includes macOS fullScreenAuxiliary flag)
    sb/
      mod.rs                  # Module re-exports
      client.rs               # SbClient: save_note, test_connection
      error.rs                # SbError enum (thiserror + Serialize)
  tauri.conf.json             # Window config (visibleOnAllWorkspaces), bundle settings
  capabilities/default.json   # Tauri v2 ACL permissions
  Cargo.toml                  # Dependencies, release profile (LTO, strip, opt-level "s")
```

## Code Style — TypeScript / React

- **Strict mode** is enabled in `tsconfig.json`. Never use `any`. Prefer explicit types.
- **Imports**: Use relative paths (`../store/settings`, not `@/`). Group: React → Tauri APIs → external libs → internal.
- **Components**: Named exports (`export function Editor`), not default exports (except `App.tsx`).
- **Props**: Define `interface` above the component. Export only the component, not the props interface.
- **State**: Zustand stores in `src/store/`. Use `persist` middleware for data that survives restarts. Status store is intentionally volatile.
- **Hooks**: Use `useCallback` for event handlers passed as props. Use refs (`useRef`) to avoid stale closures in async/callback contexts (see `MarkdownEditor.tsx`).
- **Styling**: Tailwind only. Custom colors via CSS vars in `index.css`, mapped to `argent-*` tokens in `tailwind.config.js`.
- **No comments** unless explicitly asked. Code should be self-documenting.
- **Platform detection**: Use `/Mac/i.test(navigator.userAgent)`, never deprecated `navigator.platform`.
- **Tauri calls**: Import `invoke` from `@tauri-apps/api/core`. Import window APIs from `@tauri-apps/api/window`. Import plugins from `@tauri-apps/plugin-*`.

## Code Style — Rust

- **Edition**: 2021. Use `thiserror` for error enums, `serde` for serialization.
- **Commands** (`#[tauri::command]`): Return `Result<T, SbError>`, never `Result<T, String>`. Validate inputs early, return `SbError::ConfigMissing` for missing config.
- **Error types**: `SbError` derives both `thiserror::Error` and `serde::Serialize`. Each variant has a display message via `#[error(...)]`.
- **Naming**: Snake case for functions/variables. Pascal case for types. Tauri command names use snake_case (`save_to_sb`, `set_always_on_top`).
- **Async**: Commands are `async`. Use `reqwest::Client` for HTTP. `tokio` is the runtime.
- **Imports**: Group std → external crates → crate-internal. No `use super::*`.
- **macOS native APIs**: Use `cocoa` crate + `NSWindow` trait. Access `NSWindow` via `window.ns_window()? as id`.

## Error Handling

- **Rust side**: `SbError` enum covers Network, AuthFailed, ServerError, NotFound, ConfigMissing. The `From<reqwest::Error>` impl maps HTTP statuses to variants.
- **Frontend side**: `parseErrorStatus(error: string)` in `src/lib/status.ts` maps error strings to `AppStatus`. Callers set status explicitly before calling `setError()` (which only sets the message).
- **Transient states**: The `useEffect` in `App.tsx` that syncs config → status must skip overwriting `Saving` and `Saved` states.

## Key Conventions

- **Draft persistence**: Never clear draft before confirmed save success. Draft recovers on app restart via Zustand persist.
- **Window close**: `onCloseRequested` prevents default and hides the window instead (macOS dock behavior).
- **Always-on-top**: Restored from persisted settings on startup. Toggle via `invoke('set_always_on_top')`. On macOS: uses `cocoa` crate to set `NSWindow` level (8) and collection behavior (`CanJoinAllSpaces | FullScreenAuxiliary | Managed`). `FullScreenAuxiliary` enables floating over fullscreen apps; `Managed` keeps the window visible in Mission Control.
- **Save shortcut**: `Mod-Enter` handled via native DOM `keydown` listener on the editor (bypasses CodeMirror keymaps and vim). Display label is platform-conditional (`⌘↵` vs `Ctrl↵`).
- **Vim mode**: Toggleable via `Compartment` in `MarkdownEditor.tsx`. `@replit/codemirror-vim` placed before other keymaps. Setting persists in Zustand.
- **Live preview**: CodeMirror decorations hide markdown markers and apply CSS. Markers reappear when cursor enters the range. Checklist items toggle `[ ]` ↔ `[x]` via click on checkbox widget.
