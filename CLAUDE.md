# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Argent** is a fast desktop scratchpad that captures notes and uploads them to a [SilverBullet](https://silverbullet.md) server as timestamped Markdown files. It is built with Tauri v2 (Rust backend) + React/TypeScript (frontend).

Primary workflow: summon with global hotkey → type → Cmd/Ctrl+Enter → note uploads → editor clears → window hides.

## Commands

```bash
npm run tauri dev      # Start dev app with hot reload (Vite at :1420 + Rust backend)
npm run tauri build    # Build production executable → src-tauri/target/release/argent
npm run build          # TypeScript compile + Vite build only (no Tauri)
npm run dev            # Vite frontend only (no Tauri shell)
```

There are no test or lint scripts. TypeScript type-checking runs via `npm run build`.

## Architecture

The app is split into a React frontend (IPC caller) and a Rust backend (IPC handler). All network I/O lives in Rust.

```
src/                          React/TypeScript frontend
  App.tsx                     Root: wires stores, renders layout, registers shortcuts
  components/                 Editor, TopBar, RecentNotes, SettingsPanel
  store/                      Zustand stores — settings, draft (auto-saved every 2s), status
  lib/                        Pure utilities: path formatting, status helpers, shortcut labels

src-tauri/src/
  commands/                   Tauri IPC handlers (save, settings, recent notes, window)
  sb/                         SilverBullet HTTP client (client.rs, error.rs, models.rs)
  lib.rs                      Plugin registration + global shortcut setup
```

**State model:** Three Zustand stores with tauri-plugin-store persistence:
- `useSettingsStore` — SB URL, token, global shortcut, always-on-top, hide-after-save
- `useDraftStore` — editor content + timestamp; auto-saves every 2 seconds
- `useStatusStore` — transient status (Ready / Saving / Saved / Offline / AuthError / ServerError / ConfigMissing)

**IPC boundary:** Frontend calls `invoke('save_to_sb', {...})`, `invoke('test_connection', {...})`, `invoke('fetch_recent_notes', {...})`, `invoke('set_always_on_top', {...})`. All credentials are passed per-call from the settings store; nothing is stored in Rust.

**SilverBullet integration:**
- Save: `PUT {SB_URL}/{filepath}` with Bearer token
- Recent notes: `POST {SB_URL}/v1/query` (SilverBullet query syntax)
- Filename format: `QuickNotes/YYYY/MM/YYYY-MM-DD-HHmmss-ms.md`

## Key Product Rules (from AGENTS.md)

- **Never clear editor text before a confirmed successful save.** Draft is preserved on any failure.
- **One window only.** No multi-window support.
- **No markdown preview, rich text, tags, templates, search, or tray-heavy workflows** — these are explicit v1 non-goals.
- Always-on-top and hide-after-save are user-configurable toggles; hide-after-save defaults on.
- Recent notes fetch (last 5) is non-blocking — failure must not interrupt the editor.

## Tauri Notes

- Tauri v2 API — use `@tauri-apps/api` v2 imports (`@tauri-apps/api/core` for `invoke`, `@tauri-apps/api/window` for window control).
- Plugins used: `tauri-plugin-store`, `tauri-plugin-global-shortcut`, `tauri-plugin-shell`.
- Window has no native decorations; the app renders its own slim title bar.
- Vite dev server runs strictly on port 1420 (set in `vite.config.ts`).
