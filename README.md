# Termineo

A next-generation terminal emulator built with Electron, React, and xterm.js. Fast, customizable, and designed for power users.

![Termineo](https://img.shields.io/badge/version-0.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## Features

- **Multi-tab terminal** — Open multiple shell sessions side by side, switch instantly without losing state
- **GPU-accelerated rendering** — Powered by xterm.js with canvas renderer for smooth, lag-free output
- **7 built-in color themes** — GitHub Dark, Monokai, Dracula, Nord, Solarized Dark, One Dark, Catppuccin Mocha
- **Full color customization** — 12 individual color pickers for complete control over your terminal palette
- **Multiple shell support** — PowerShell, CMD, Git Bash, WSL, or any custom shell
- **Window opacity control** — Adjustable transparency from 30% to 100%
- **Configurable cursor** — Bar, block, or underline with optional blink
- **Custom font & size** — Choose from 10 popular monospace fonts, sizes 8-32px
- **Scrollback buffer** — Up to 50,000 lines of history
- **Frameless window** — Clean, modern look with custom title bar
- **Portable exe** — Single file, no installation required
- **Settings persist** — All preferences saved automatically across sessions

## Quick Start

### Download & Run

Download `Termineo.exe` from [Releases](https://github.com/nhatphatt/termineo/releases) and double-click to run. No installation needed.

### Build from Source

```bash
# Clone
git clone https://github.com/nhatphatt/termineo.git
cd termineo

# Install dependencies
npm install

# Run in development
npm run electron:dev

# Build portable exe
npm run build
npx electron-builder --win portable
```

The portable exe will be in `dist/Termineo 0.1.0.exe`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| App Shell | Electron |
| Frontend | React 19 + TypeScript |
| Terminal | xterm.js 6 + FitAddon |
| State | Zustand (persisted) |
| PTY | node-pty (utility process) |
| Build | Vite + electron-builder |

## Architecture

```
electron/
  main.cjs          # Electron main process
  preload.cjs       # Context bridge (security sandbox)
  pty-host.cjs      # PTY manager (runs in utility process)

src/
  components/
    terminal/        # XTermRenderer, BlockList, TerminalBlock
    shared/          # TabBar, SettingsPanel
  hooks/             # usePty, useBlocks, useClipboard
  stores/            # Zustand stores (session, block, settings)
  lib/               # IPC bridge, block parser
  styles/            # Global CSS + theme variables
```

**Key design decisions:**

- **PTY runs in a separate utility process** — isolates native code from the renderer, avoids Electron ABI rebuild issues
- **Tabs use `visibility: hidden`** instead of unmounting — keeps WebGL/canvas context alive, zero jitter on tab switch
- **Settings use Zustand + localStorage persist** — instant reactivity, survives app restart
- **All terminal options update live** — colors, font, cursor style change without restarting the shell

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Type in terminal | Direct input to shell |
| Click tab | Switch session |
| Click `+` | New tab |
| Click `×` | Close tab |
| Click `⚙` | Open settings |

## Roadmap

- [ ] Block-based UI — collapsible command/output blocks with OSC 133
- [ ] SSH connection manager with encrypted credential vault
- [ ] AI assistant — inline error analysis and fix suggestions
- [ ] Image paste & render (Sixel/Kitty graphics protocol)
- [ ] Split panes
- [ ] Keyboard-first navigation (Ctrl+K command palette)
- [ ] macOS & Linux builds

## License

MIT
