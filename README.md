# Argent

A fast desktop scratchpad for [SilverBullet](https://silverbullet.md), built with Tauri v2 + React + TypeScript. Two modes: **Scratchpad** for quick capture, **Todo** for managing a persistent `todo.md`.

## Features

- Two modes: Scratchpad (quick capture) and Todo (persistent `todo.md`)
- Live WYSIWYG markdown preview with CodeMirror 6
- Optional Vim keybindings
- Save to SilverBullet with `Cmd/Ctrl+Enter` (scratchpad mode)
- Auto-save with debounce (todo mode)
- Draft recovery after crashes
- Always-on-top with fullscreen support (macOS)
- Native macOS window chrome with vibrancy
- Open SilverBullet in browser from the title bar
- Settings persisted across restarts

## Prerequisites

- **Node.js** 18+
- **Rust** 1.70+ (install via https://rustup.rs)
- **npm** 9+

## Setup

```bash
git clone <repo-url> argent && cd argent
npm install
```

## Commands

### Development

| Command | What it does |
|---|---|
| `npm run tauri dev` | Start full Tauri dev app (Rust + Vite HMR) |
| `npm run dev` | Start Vite dev server only (frontend, port 1420) |

### Building

| Command | What it does |
|---|---|
| `npm run tauri build` | Production build (Rust + Vite) — outputs `.dmg`/`.app` on macOS |
| `npm run build` | Type-check (`tsc --noEmit`) then Vite frontend build |
| `npx vite build` | Frontend build only, no type-check |

### Type-checking

| Command | What it does |
|---|---|
| `npx tsc --noEmit` | TypeScript type-check only |
| `cargo check` | Rust type-check only (run from `src-tauri/`) |
| `cargo build` | Full Rust build (run from `src-tauri/`) |

### Testing

| Command | What it does |
|---|---|
| `cargo test` | Run Rust unit tests (run from `src-tauri/`) |

No frontend test framework is configured yet.

## Modes

### Scratchpad (default)

Type a note and press `Cmd/Ctrl+Enter` to save. Notes are stored at `Inbox/YYYY/MM/<filename>.md` in SilverBullet. If the first line is a heading (`# Title`), it becomes the filename. Otherwise a timestamp is used.

The editor content clears after a successful save. A draft is auto-saved to localStorage every 2 seconds and recovered on restart.

### Todo

Opens and edits `todo.md` from the root of your SilverBullet vault. If the file doesn't exist, it's created on first edit. Changes auto-save to the server after 1.5 seconds of inactivity. The Save button is hidden in this mode.

Switch between modes with the circle-check icon in the title bar or `Cmd/Ctrl+D`.

## Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|---|---|---|
| Save note (scratchpad) | `Cmd+Enter` | `Ctrl+Enter` |
| Switch mode | `Cmd+D` | `Ctrl+D` |
| Vim toggle | Settings panel | Settings panel |
| Open window (menu) | `Cmd+N` | `Ctrl+N` |
| Quit (menu) | `Cmd+Q` | `Ctrl+Q` |

## Configuration

1. Click the gear icon in the title bar
2. Enter your SilverBullet URL (e.g. `https://notes.example.com`)
3. Enter your API token
4. Click **Test Connection** to verify

Settings are persisted in localStorage and survive app restarts.

## Project Structure

```
src/                          # React frontend
  App.tsx                     # Root: mode switching, save orchestration, window setup
  components/
    Editor.tsx                # Content wrapper: mode-aware save behavior
    MarkdownEditor.tsx        # CodeMirror 6 wrapper: vim mode, live preview
    TopBar.tsx                # Title bar: mode toggle, Open SB, pin, settings
    SettingsPanel.tsx         # Modal: SB URL, token, vim, theme, test connection
  store/
    settings.ts               # Persisted: SB config, mode, vim, theme, always-on-top
    draft.ts                  # Persisted: editor draft for crash recovery
    status.ts                 # Volatile: app status + error message
  lib/
    status.ts                 # getStatusColor, getStatusText, parseErrorStatus
    codemirror/
      live-preview.ts         # WYSIWYG decorations: headings, bold, links, checklists
      theme.ts                # CodeMirror theme
  types.ts                    # AppStatus, AppMode, Settings, Draft

src-tauri/                    # Rust backend
  src/
    main.rs                   # Entry point
    lib.rs                    # Plugin setup, native menus, macOS vibrancy
    commands/
      save.rs                 # save_to_sb, test_connection, fetch_note, save_note
      window.rs               # set_always_on_top (with fullScreenAuxiliary), show_and_focus
    sb/
      client.rs               # SbClient: save_note, fetch_note, test_connection
      error.rs                # SbError enum (thiserror + Serialize)
  tauri.conf.json             # Window config, bundle settings
  capabilities/default.json   # Tauri v2 ACL permissions
  Cargo.toml                  # Dependencies
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Editor | CodeMirror 6, @replit/codemirror-vim |
| Backend | Tauri v2, Rust, reqwest, tokio |
| Persistence | Zustand persist (localStorage) |
| macOS native | cocoa, objc (vibrancy, fullscreen auxiliary) |

## Troubleshooting

**Window doesn't appear above fullscreen apps**: Make sure "always on top" is enabled (pin icon in title bar). This sets `fullScreenAuxiliary` on macOS so Argent floats over fullscreen spaces.

**Connection test fails**: Verify your SilverBullet URL includes the protocol (`https://`), your API token is correct, and SilverBullet is running.

**Cmd+Enter doesn't save**: This shortcut is captured at the DOM level to work even when Vim mode is active. If another app is intercepting it, try disabling that app's shortcut.

**Draft not recovered**: Drafts are saved every 2 seconds in scratchpad mode. Todo mode doesn't use drafts — it loads from the server.

## License

MIT