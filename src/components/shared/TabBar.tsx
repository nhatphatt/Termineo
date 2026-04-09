import { useSessionStore } from "../../stores/sessionStore";
import { useSettingsStore } from "../../stores/settingsStore";

export function TabBar() {
  const sessions = useSessionStore((s) => s.sessions);
  const activeId = useSessionStore((s) => s.activeSessionId);
  const setActive = useSessionStore((s) => s.setActive);
  const createSession = useSessionStore((s) => s.createSession);
  const closeSession = useSessionStore((s) => s.closeSession);
  const tabPosition = useSettingsStore((s) => s.tabPosition);
  const setShowSettings = useSettingsStore((s) => s.setShowSettings);

  const isVertical = tabPosition === "left" || tabPosition === "right";

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize();
  };
  const handleMaximize = () => {
    window.electronAPI?.windowMaximize();
  };
  const handleClose = () => {
    window.electronAPI?.windowClose();
  };

  return (
    <div className={`tab-bar tab-bar-${tabPosition}`}>
      <div className={`tab-list ${isVertical ? "tab-list-vertical" : "tab-list-horizontal"}`}>
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`tab ${s.id === activeId ? "tab-active" : ""} ${isVertical ? "tab-vertical" : ""}`}
            onClick={() => setActive(s.id)}
            onKeyDown={(e) => e.key === "Enter" && setActive(s.id)}
            role="tab"
            tabIndex={0}
            aria-selected={s.id === activeId}
            title={s.label}
          >
            <span className="tab-label">{s.label}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeSession(s.id);
              }}
              aria-label={`Close ${s.label}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          className={`tab-new ${isVertical ? "tab-new-vertical" : ""}`}
          onClick={() => createSession("Shell")}
          aria-label="New tab"
        >
          +
        </button>
      </div>

      {/* Spacer + controls */}
      <div style={{ flex: 1 }} />
      <div className={`tab-actions ${isVertical ? "tab-actions-vertical" : ""}`}>
        <button
          className="tab-action-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          ⚙
        </button>
        {tabPosition === "top" && (
          <div className="window-controls">
            <button onClick={handleMinimize} aria-label="Minimize" title="Minimize">─</button>
            <button onClick={handleMaximize} aria-label="Maximize" title="Maximize">□</button>
            <button className="win-close" onClick={handleClose} aria-label="Close" title="Close">×</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WindowControls() {
  const tabPosition = useSettingsStore((s) => s.tabPosition);
  if (tabPosition === "top") return null;

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize();
  };
  const handleMaximize = () => {
    window.electronAPI?.windowMaximize();
  };
  const handleClose = () => {
    window.electronAPI?.windowClose();
  };

  return (
    <div className="floating-window-controls">
      <button onClick={handleMinimize} title="Minimize">─</button>
      <button onClick={handleMaximize} title="Maximize">□</button>
      <button className="win-close" onClick={handleClose} title="Close">×</button>
    </div>
  );
}
