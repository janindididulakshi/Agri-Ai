import { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext.jsx";

function formatWhen(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

export default function NotificationPanel() {
  const { open, setOpen, alerts, loading, error, markRead } = useNotifications();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="gov-notif-root" role="presentation">
      <button type="button" className="gov-notif-backdrop" aria-label="Close notifications" onClick={() => setOpen(false)} />
      <div className="gov-notif-panel" role="dialog" aria-modal="true" aria-labelledby="gov-notif-title">
        <div className="gov-notif-panel-head">
          <h2 id="gov-notif-title">Notifications</h2>
          <button type="button" className="gov-notif-close" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
        </div>
        {loading ? <div className="gov-notif-muted gov-notif-pad">පූරණය…</div> : null}
        {error ? (
          <div className="gov-notif-pad" style={{ color: "#c62828", fontWeight: 700 }}>
            {error}
          </div>
        ) : null}
        {!loading && !error && alerts.length === 0 ? (
          <div className="gov-notif-muted gov-notif-pad">දැනුම්දීම් නැත.</div>
        ) : null}
        <ul className="gov-notif-list">
          {alerts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={`gov-notif-row${a.is_read ? "" : " gov-notif-row--unread"}`}
                onClick={() => !a.is_read && markRead(a.id)}
              >
                <div className="gov-notif-row-type">{a.alert_type || "Alert"}</div>
                <div className="gov-notif-row-msg">{a.message || "—"}</div>
                <div className="gov-notif-row-time">{formatWhen(a.created_at)}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
