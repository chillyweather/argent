# AGENTS.md — Argent

Argent is a fast desktop scratchpad for SilverBullet, built with **Tauri v2** (Rust backend) + **React** + **TypeScript** + **Tailwind CSS** + **Zustand** for state.

## Build / Dev Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (frontend only, port 1420) |
| `npm run build` | Type-check (`tsc --noEmit`) then build frontend with Vite |
| `cargo check` | Type-check Rust backend |
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
  components/
    Editor.tsx                # Content wrapper: local state, autosave draft, status footer
    MarkdownEditor.tsx        # CodeMirror 6 wrapper: markdown language, WYSIWYG preview
    TopBar.tsx                # Title bar: drag region, pin button, settings button
    SettingsPanel.tsx         # Modal: SB URL, token, global shortcut, test connection
    RecentNotes.tsx           # Recent SB notes as clickable chips
  store/                      # Zustand stores with persist middleware
    settings.ts               # Persisted (localStorage): SB config, always-on-top, etc.
    draft.ts                  # Persisted (localStorage): editor draft for crash recovery
    status.ts                 # Volatile: app status + error message
  lib/
    status.ts                 # getStatusColor, getStatusText, parseErrorStatus
    path.ts                   # formatPath utility
    codemirror/
      live-preview.ts         # WYSIWYG markdown decorations (headings, bold, italic, etc.)
      theme.ts                # CodeMirror base theme + highlight style
  types.ts                    # Shared types: AppStatus, Settings, Draft, RecentNote
  index.css                   # Tailwind directives + CSS vars + CodeMirror overrides

src-tauri/                    # Rust backend
  src/
    main.rs                   # Entry: calls argent_lib::run()
    lib.rs                    # Plugin setup, native menus, Reopen handler
    commands/
      mod.rs                  # Module re-exports
      save.rs                 # save_to_sb, test_connection commands
      recent.rs               # fetch_recent_notes command
      window.rs               # set_always_on_top, show_and_focus commands
    sb/
      mod.rs                  # Module re-exports
      client.rs               # SbClient: save_note, test_connection, fetch_recent_notes
      error.rs                # SbError enum (thiserror + Serialize)
      models.rs               # QueryRequest, QueryResponse, PageInfo
  tauri.conf.json             # Window config, permissions, bundle settings
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
- **Styling**: Tailwind only. Custom colors via CSS vars in `index.css`, mapped to `argent-*` tokens in `tailwind.config.js`. Use `bg-argent-bg`, `text-argent-text-muted`, etc.
- **No comments** unless explicitly asked. Code should be self-documenting.
- **Platform detection**: Use `/Mac/i.test(navigator.userAgent)`, never deprecated `navigator.platform`.
- **Tauri calls**: Import from `@tauri-apps/api/core` (`invoke`) and `@tauri-apps/api/window` (`getCurrentWindow`). Import plugins from `@tauri-apps/plugin-*`.

## Code Style — Rust

- **Edition**: 2021. Use `thiserror` for error enums, `serde` for serialization.
- **Commands** (`#[tauri::command]`): Return `Result<T, SbError>`, never `Result<T, String>`. Validate inputs early, return `SbError::ConfigMissing` for missing config.
- **Error types**: `SbError` derives both `thiserror::Error` and `serde::Serialize`. Each variant has a display message via `#[error(...)]`.
- **Naming**: Snake case for functions/variables. Pascal case for types. Tauri command names use snake_case (`save_to_sb`, `test_connection`).
- **Async**: Commands are `async`. Use `reqwest::Client` for HTTP. `tokio` is the runtime.
- **Imports**: Group std → external crates → crate-internal. No `use super::*`.

## Error Handling

- **Rust side**: `SbError` enum covers Network, AuthFailed, ServerError, NotFound, ConfigMissing. The `From<reqwest::Error>` impl maps HTTP statuses to variants.
- **Frontend side**: `parseErrorStatus(error: string)` in `src/lib/status.ts` maps error strings to `AppStatus` values. Always set status before calling `setError()`. The status store's `setError` only sets the error message, not the status.
- **Transient states**: The `useEffect` in `App.tsx` that syncs config → status must skip overwriting `Saving` and `Saved` states.

## Key Conventions

- **Draft persistence**: Never clear draft before confirmed save success. Draft recovers on app restart via Zustand persist.
- **Recent notes refresh**: `RecentNotes` receives a `refreshKey` prop. Increment it after successful save.
- **Window close**: `onCloseRequested` prevents default and hides the window instead (macOS dock behavior).
- **Always-on-top**: Restored from persisted settings on app startup. Toggle via `invoke('set_always_on_top')`.
- **Save shortcut**: `Mod-Enter` in CodeMirror. Display label is platform-conditional (`⌘↵` vs `Ctrl↵`).
