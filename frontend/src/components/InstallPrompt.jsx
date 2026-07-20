import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [evt, setEvt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setEvt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !evt) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 82,
        zIndex: 60,
      }}
    >
      <div className="sf-card" style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900 }}>📲 මුල් තිරයට එකතු කරන්න</div>
          <div className="sf-muted" style={{ fontSize: 13 }}>
            Smart Farm AI — වේගයෙන් විවෘත කරන්න
          </div>
        </div>
        <button
          type="button"
          className="sf-btn sf-btn-primary"
          style={{ width: "auto", minWidth: 140 }}
          onClick={async () => {
            try {
              await evt.prompt();
              await evt.userChoice;
            } catch {
              /* ignore */
            } finally {
              setVisible(false);
              setEvt(null);
            }
          }}
        >
          Install
        </button>
        <button type="button" className="sf-btn sf-btn-ghost" style={{ width: "auto" }} onClick={() => setVisible(false)}>
          ✕
        </button>
      </div>
    </div>
  );
}
