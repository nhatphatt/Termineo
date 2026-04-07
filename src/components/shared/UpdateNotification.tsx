import { useState, useEffect } from "react";

type UpdateState = "idle" | "available" | "downloading" | "ready";

export function UpdateNotification() {
  const [state, setState] = useState<UpdateState>("idle");
  const [version, setVersion] = useState("");
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");

  useEffect(() => {
    window.electronAPI?.updaterGetVersion().then(setCurrentVersion).catch(() => {});

    const unAvailable = window.electronAPI?.onUpdaterAvailable((payload) => {
      setVersion(payload.version);
      setState("available");
      setDismissed(false);
    });

    const unProgress = window.electronAPI?.onUpdaterProgress((payload) => {
      setState("downloading");
      setProgress(payload.percent);
    });

    const unDownloaded = window.electronAPI?.onUpdaterDownloaded(() => {
      setState("ready");
    });

    return () => {
      unAvailable?.();
      unProgress?.();
      unDownloaded?.();
    };
  }, []);

  if (state === "idle" || dismissed) return null;

  return (
    <div className="update-bar">
      {state === "available" && (
        <>
          <span className="update-text">
            Termineo <strong>v{version}</strong> available
            {currentVersion ? ` (current: v${currentVersion})` : ""}
          </span>
          <button className="update-btn" onClick={() => {
            setState("downloading");
            window.electronAPI?.updaterDownload();
          }}>
            Update
          </button>
          <button className="update-dismiss" onClick={() => setDismissed(true)}>×</button>
        </>
      )}

      {state === "downloading" && (
        <>
          <span className="update-text">Downloading update...</span>
          <div className="update-progress-bar">
            <div className="update-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="update-percent">{progress}%</span>
        </>
      )}

      {state === "ready" && (
        <>
          <span className="update-text">Update ready!</span>
          <button className="update-btn" onClick={() => window.electronAPI?.updaterInstall()}>
            Restart now
          </button>
          <button className="update-dismiss" onClick={() => setDismissed(true)}>Later</button>
        </>
      )}

      <style>{`
        .update-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: rgba(88, 166, 255, 0.12);
          border-bottom: 1px solid rgba(88, 166, 255, 0.25);
          font-size: 12px;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .update-text { flex: 1; }
        .update-btn {
          padding: 3px 12px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-family: inherit;
          cursor: pointer;
          font-weight: 600;
        }
        .update-btn:hover { opacity: 0.85; }
        .update-dismiss {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
        }
        .update-dismiss:hover { color: var(--text-primary); }
        .update-progress-bar {
          width: 120px;
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .update-progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 3px;
          transition: width 0.3s;
        }
        .update-percent {
          font-size: 11px;
          color: var(--text-secondary);
          min-width: 30px;
        }
      `}</style>
    </div>
  );
}
