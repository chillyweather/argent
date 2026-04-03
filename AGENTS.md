# AGENTS.md

## Project
- App name: `Argent`
- Purpose: a fast desktop scratchpad that lets the user capture text and save it to a SilverBullet server as atomic markdown notes.
- Primary workflow: summon app -> type/paste -> press save shortcut -> note is uploaded -> editor clears -> app hides.

## Product Intent
Argent is a quick-capture tool, not a full notes client.
The app should optimize for speed, low friction, and zero data loss.

Core principles:
- Open fast
- Type immediately
- Save with one action
- Never lose unsaved text
- Stay out of the way after success

## Recommended v1 Decisions
These decisions are intentional defaults and should be followed unless explicitly changed later.

- One window only
- Plain textarea only, no markdown preview
- One destination folder only: `QuickNotes/`
- Hide after successful save: `on` by default
- Window stays always available through a global shortcut
- Use a slim custom title bar, not a fully borderless window
- Use timestamp filenames with milliseconds to avoid collisions
- Persist both settings and draft data outside volatile component state
- Keep UI compact and keyboard-first

## Tech Stack
- Desktop framework: `Tauri v2`
- Frontend: `React + TypeScript + Vite`
- Styling: `Tailwind CSS`
- Frontend state: `Zustand`
- Persistence: `tauri-plugin-store`
- Backend HTTP: Rust `reqwest`
- Global shortcuts: Tauri plugin for global shortcut
- Open links in browser: Tauri shell/opener support

## Non-Goals for v1
Do not add these unless explicitly requested:
- Rich text or markdown preview
- Multi-note editing
- Tags, templates, folders, or notebooks
- Search inside previous notes
- Sync beyond SilverBullet upload
- Multi-window support
- Tray-heavy workflows unless needed later

## Core User Flows

### 1. Quick Capture
- User presses global shortcut
- Existing Argent window is shown and focused
- User types or pastes content
- User presses `Cmd/Ctrl + Enter` or clicks save button
- App uploads note to SilverBullet
- On success:
  - clear draft
  - refresh recent notes
  - briefly show success feedback
  - hide window if `hideAfterSave` is enabled
- On failure:
  - keep draft exactly as-is
  - show actionable error state
  - keep focus in editor

### 2. Draft Recovery
- Draft is persisted regularly while user is typing
- If app restarts and an unsent draft exists, restore it automatically
- Show subtle recovered-draft indication if useful, but do not block typing

### 3. Settings
- User opens settings
- User can set:
  - `SB_URL`
  - `SB_TOKEN`
  - global shortcut
  - always on top
  - hide after save
- User can run `Test Connection`
- Settings persist across launches

### 4. Recent Notes
- App fetches the latest 5 notes from `QuickNotes/`
- Clicking a recent note opens it in the default browser
- If recent fetch fails, it should not block editing or saving

## Functional Requirements

### FR-1 Editor
- Main screen is a compact note editor with a monospace textarea
- Editor receives focus when app opens
- Save shortcut: `Cmd + Enter` on macOS, `Ctrl + Enter` on Windows/Linux
- Save button must also exist for discoverability
- Draft autosaves every 2 seconds
- Draft also saves on important lifecycle events when possible
- Draft must not be cleared until remote save succeeds

### FR-2 Atomic Save
When saving:
1. Read current draft
2. Validate required settings exist
3. Generate note path:
   - `QuickNotes/YYYY/MM/YYYY-MM-DD-HHmmss-SSS.md`
4. Send request to SilverBullet through Rust backend
5. On success:
   - clear draft
   - update recent notes
   - show success animation/state
   - hide window if enabled
6. On failure:
   - keep draft
   - surface error clearly

### FR-3 Window Management
- App uses a single existing window
- Global shortcut shows and focuses that window
- Pin toggle controls always-on-top state
- Always-on-top state persists
- Window should be draggable from the custom top bar
- Avoid a fully borderless setup in v1

### FR-4 Recent Notes
- Fetch on launch
- Fetch after each successful save
- Preferred source: SilverBullet query API
- Fallback logic should exist because server capabilities may vary
- Limit to last 5 notes
- Display labels based on timestamp/path, not full raw URLs

### FR-5 Configuration
Required settings:
- `SB_URL` example: `https://notes.example.com`
- `SB_TOKEN`

Optional settings:
- `globalShortcut`
- `alwaysOnTop`
- `hideAfterSave`

Validation:
- Local validation for URL format and empty token
- Remote validation through a connection test

## SilverBullet Integration

### Save Note
Preferred request format:
- Method: `PUT`
- URL: `{SB_URL}/{filepath}`
- Header: `Authorization: Bearer {SB_TOKEN}`
- Header: `Content-Type: text/markdown`
- Body: raw markdown text

### Fetch Recent Notes
Preferred request:
- Method: `POST`
- URL: `{SB_URL}/v1/query`
- JSON body:
```json
{
  "query": "page where name =~ /^QuickNotes\\// order by lastModified desc limit 5"
}
```

### Important Integration Guidance
SilverBullet deployments may differ.
Implementation must be resilient:
- treat query API as preferred, not guaranteed
- keep recent-notes fetching isolated from save flow
- map server/auth/network errors into user-friendly app states
- centralize URL/path building and encoding logic

## Persistence Rules

### Settings Persistence
Persist with `tauri-plugin-store`:
- `sbUrl`
- `sbToken`
- `globalShortcut`
- `alwaysOnTop`
- `hideAfterSave`

### Draft Persistence
Persist current draft in stable local storage, preferably via the same persisted store approach or a persisted Zustand layer.
Do not rely on transient component state.

Persist at least:
- current draft text
- last updated timestamp
- optional last error state if helpful

## Status Model
Do not use only `Connected/Offline`.
Use explicit states:
- `Ready`
- `Saving`
- `Saved`
- `Offline`
- `Auth Error`
- `Server Error`
- `Config Missing`

These states should drive small UI indicators and error feedback.

## Default UX Decisions
- System theme support: light/dark based on OS setting
- Editor font: monospace
- App should feel quick and calm, not busy
- Success feedback should be brief and tactile, such as fade or slide
- Errors should be clear but lightweight
- User should be able to operate the app almost entirely by keyboard

## Visual Direction
Use a compact, polished desktop utility style.
Reference mood: focused, minimal, graphite/silver, slightly premium.

Guidelines:
- Avoid generic bright purple accents
- Avoid oversized layouts
- Use a tight, intentional spacing system
- Keep contrast strong in both dark and light themes
- Make the editor visually dominant
- Keep settings secondary
- Keep motion subtle and meaningful

## Platform Defaults

### Global Shortcut Default
Because `Option + Space` often conflicts on macOS, use safer defaults:
- macOS: `Cmd + Shift + Space`
- Windows/Linux: `Ctrl + Shift + Space`

### Save Shortcut
- macOS: `Cmd + Enter`
- Windows/Linux: `Ctrl + Enter`

## Error Handling Rules
- Never clear text before confirmed save success
- If upload fails, preserve draft exactly
- Distinguish among:
  - invalid config
  - network unreachable
  - authentication failure
  - unexpected server response
- Recent-notes failure must not block editing or saving
- Show errors in plain language

## Performance Expectations
These are targets, not hard guarantees:
- App summon should feel near-instant
- Typing must remain smooth at all times
- Local UI response to save action should be immediate
- Remote completion speed depends on network/server conditions
- Optimize perceived speed, not just raw network timing

## Architecture Guidance

### Frontend Responsibilities
Frontend should handle:
- editor input
- keyboard shortcuts inside app
- local draft state
- settings UI
- status UI
- recent notes rendering
- invoking backend commands

### Backend Responsibilities
Rust backend should handle:
- authenticated HTTP requests to SilverBullet
- connection test
- recent-note fetch
- structured error mapping
- window always-on-top control if needed through commands
- global shortcut registration/show-focus orchestration as appropriate

### Shared Logic
Centralize:
- filepath generation
- URL normalization
- response/error parsing
- settings schema and validation

## Proposed File/Module Shape
This is guidance, not a strict requirement.

Frontend:
- `src/components/Editor.tsx`
- `src/components/TopBar.tsx`
- `src/components/RecentNotes.tsx`
- `src/components/SettingsPanel.tsx`
- `src/store/settings.ts`
- `src/store/draft.ts`
- `src/lib/shortcuts.ts`
- `src/lib/path.ts`
- `src/lib/status.ts`
- `src/types.ts`

Rust:
- `src-tauri/src/main.rs`
- `src-tauri/src/commands/save.rs`
- `src-tauri/src/commands/settings.rs`
- `src-tauri/src/commands/recent.rs`
- `src-tauri/src/commands/window.rs`
- `src-tauri/src/sb/client.rs`
- `src-tauri/src/sb/errors.rs`
- `src-tauri/src/sb/models.rs`

## Execution Plan

### Phase 1 Foundation
- Initialize Tauri v2 app with `React + TypeScript + Vite`
- Add Tailwind
- Add Zustand
- Add store persistence plugin
- Add global shortcut plugin
- Add Rust `reqwest`
- Set up shared types and folder structure

### Phase 2 Persistence and Settings
- Implement persisted settings store
- Implement persisted draft store
- Add startup hydration
- Add settings UI with validation
- Add `Test Connection`

### Phase 3 Backend Commands
- Implement `test_connection`
- Implement `save_to_sb`
- Implement `fetch_recent_notes`
- Implement structured error responses
- Implement always-on-top command support

### Phase 4 Window and Shortcut Behavior
- Implement single-window summon/focus
- Register default global shortcut by platform
- Support updating shortcut from settings
- Persist and restore pin state

### Phase 5 Main UI
- Build compact app shell
- Add top bar with drag region, pin button, settings button
- Add main textarea and save button
- Add status indicator
- Add recent notes list/strip

### Phase 6 Save Flow
- Generate timestamped path with milliseconds
- Invoke backend save command
- Clear draft only on success
- Refresh recent notes after success
- Hide window after success when enabled

### Phase 7 Hardening
- Improve error messages and retry behavior
- Verify draft recovery
- Verify repeated rapid saves
- Verify recent-notes failures do not affect main workflow
- Validate path/URL encoding edge cases

### Phase 8 QA
- Test macOS window behavior
- Test shortcut conflicts
- Test save/open flows against a real SilverBullet instance
- Test offline/auth/server-error scenarios
- Test light and dark themes
- Test desktop and small-window usability

## Implementation Rules for Agents
- Prefer the simplest implementation that satisfies v1
- Do not add extra features unless asked
- Do not replace the plain textarea with a rich editor
- Do not couple save success to recent-notes fetch success
- Do not clear draft early
- Do not introduce multiple destination folders
- Do not assume SilverBullet API behavior beyond the defined preferred flow; include fallback handling where practical
- Keep code modular and explicit
- Favor reliability over cleverness

## Definition of Done for v1
Argent v1 is done when:
- User can configure SilverBullet URL and token
- User can summon the app with a global shortcut
- User can type into the editor immediately
- Draft survives reload/crash/restart
- User can save note with `Cmd/Ctrl + Enter`
- Note is uploaded to SilverBullet as a unique markdown file
- Editor clears only after confirmed success
- App hides after save by default
- User can see and open the 5 most recent quick notes
- Always-on-top toggle works and persists
- Major error states are visible and non-destructive
