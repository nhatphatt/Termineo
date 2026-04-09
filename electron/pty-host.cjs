/**
 * PTY Host — runs as a child process with ELECTRON_RUN_AS_NODE=1.
 * Communicates with main process via process.send / process.on('message').
 */
const os = require("os");
const path = require("path");

// In packaged app, node-pty is in app.asar.unpacked
let pty;
try {
  pty = require("node-pty");
} catch {
  const unpackedPath = path.join(__dirname, "..", "node_modules", "node-pty")
    .replace("app.asar", "app.asar.unpacked");
  pty = require(unpackedPath);
}

/** @type {Map<string, import('node-pty').IPty>} */
const sessions = new Map();

process.on("message", (msg) => {
  const { type, sessionId, data, cols, rows, shellPath, cwd } = msg;

  switch (type) {
    case "spawn": {
      if (sessions.has(sessionId)) {
        process.send({ type: "error", sessionId, error: "Session already exists" });
        return;
      }
      const defaultShell = os.platform() === "win32" ? "powershell.exe" : (process.env.SHELL || "/bin/bash");
      const shell = shellPath || defaultShell;
      const args = (shell.includes("powershell") || shell.includes("pwsh")) ? ["-NoLogo"] : [];

      try {
        // Ensure Starship prompt is available in PATH
        const starshipBin = path.join(os.homedir(), ".starship", "bin");
        const envWithStarship = { ...process.env };
        if (envWithStarship.PATH && !envWithStarship.PATH.includes(starshipBin)) {
          envWithStarship.PATH = `${starshipBin};${envWithStarship.PATH}`;
        } else if (envWithStarship.Path && !envWithStarship.Path.includes(starshipBin)) {
          envWithStarship.Path = `${starshipBin};${envWithStarship.Path}`;
        }
        envWithStarship.STARSHIP_CONFIG = path.join(os.homedir(), ".config", "starship.toml");

        const proc = pty.spawn(shell, args, {
          name: "xterm-256color",
          cols: cols || 80,
          rows: rows || 24,
          cwd: cwd || os.homedir(),
          env: envWithStarship,
        });

        proc.onData((output) => {
          process.send({ type: "output", sessionId, data: output });
        });

        proc.onExit(({ exitCode }) => {
          sessions.delete(sessionId);
          process.send({ type: "exit", sessionId, exitCode });
        });

        sessions.set(sessionId, proc);
        process.send({ type: "spawned", sessionId });
      } catch (err) {
        process.send({ type: "error", sessionId, error: err.message });
      }
      break;
    }

    case "write": {
      const proc = sessions.get(sessionId);
      if (proc) proc.write(data);
      break;
    }

    case "resize": {
      const proc = sessions.get(sessionId);
      if (proc) proc.resize(cols, rows);
      break;
    }

    case "kill": {
      const proc = sessions.get(sessionId);
      if (proc) {
        proc.kill();
        sessions.delete(sessionId);
      }
      break;
    }
  }
});

process.send({ type: "ready" });
