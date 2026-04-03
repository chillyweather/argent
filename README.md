# Argent

A fast desktop scratchpad for capturing notes to SilverBullet.

## Features

- Quick capture with global shortcut (Cmd/Ctrl+Shift+Space)
- Automatic draft saving (every 2 seconds)
- Draft recovery on restart
- One-click save to SilverBullet (Cmd/Ctrl+Enter)
- Recent notes list
- Always-on-top toggle
- Dark/light theme support
- Settings persistence

## Prerequisites

- Node.js 18+
- Rust 1.70+
- npm or yarn

## Setup

1. Install Rust (if not already installed):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install dependencies:

```bash
npm install
```

3. Generate Tauri icons (macOS/Linux):

```bash
cd src-tauri/icons
curl -sL "https://raw.githubusercontent.com/nicholasjackson/misc/master/icon.png" -o 32x32.png 2>/dev/null || echo "Icon generation skipped"
```

Or create your own icons (required for production build):
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (macOS)
- icon.ico (Windows)

## Development

Run the development server:

```bash
npm run tauri dev
```

This will:
1. Start the Vite frontend at http://localhost:1420
2. Build and launch the Tauri app
3. Watch for changes with hot reload

## Build

Build for production:

```bash
npm run tauri build
```

The executable will be in `src-tauri/target/release/argent`.

## Configuration

On first launch:
1. Click the settings icon (gear) in the top bar
2. Enter your SilverBullet URL (e.g., `https://notes.example.com`)
3. Enter your API token
4. Click "Test Connection" to verify
5. Save settings

## Note Destination

Notes are saved to `Inbox/YYYY/MM/` with timestamped filenames (e.g., `Inbox/2026/04/2026-04-01-143025-123456.md`).

The recent notes list shows the last 5 notes from `Inbox/`.

## Usage

1. **Summon the app**: Press `Cmd+Shift+Space` (macOS) or `Ctrl+Shift+Space` (Windows/Linux)
2. **Type your note** in the textarea
3. **Save**: Press `Cmd+Enter` (macOS) or `Ctrl+Enter` (Windows/Linux), or click the Save button
4. **View recent notes**: Click on any note in the recent list to open it in your browser

## Project Structure

```
argent/
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── store/             # Zustand stores
│   ├── lib/               # Utilities
│   └── types.ts           # TypeScript types
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands/      # Tauri commands
│   │   ├── sb/            # SilverBullet client
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|--------------|
| Summon app | Cmd+Shift+Space | Ctrl+Shift+Space |
| Save note | Cmd+Enter | Ctrl+Enter |
| Settings | Click gear icon | Click gear icon |

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: Tauri v2 + Rust
- **Persistence**: tauri-plugin-store (settings & draft)
- **HTTP**: reqwest (Rust)
- **Global shortcuts**: tauri-plugin-global-shortcut

## Troubleshooting

### Global shortcut not working
- Check that no other app is using the same shortcut
- On macOS, grant "Accessibility" permissions in System Preferences > Privacy & Security

### Connection test fails
- Verify your SilverBullet URL is correct
- Ensure your API token is valid
- Check network connectivity

### Draft not recovered
- Drafts are saved every 2 seconds
- If the app crashes, restart to recover

## License

MIT
