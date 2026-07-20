import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const NotificationContext = createContext(null);

function normalizeAlert(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id != null ? String(raw.id) : "";
  if (!id) return null;
  return {
    id,
    message: raw.message || "",
    alert_type: raw.alert_type || "",
    is_read: Boolean(raw.is_read),
    created_at: raw.created_at || null,
  };
}

export function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/alerts");
      const list = (data.alerts || []).map(normalizeAlert).filter(Boolean);
      setAlerts(list);
    } catch (e) {
      setError(e?.message || "දත්ත ලබා ගැනීම අසාර්ථකයි.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (!localStorage.getItem("sf_token")) return;
    } catch {
      return;
    }
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const unreadCount = useMemo(() => alerts.filter((a) => !a.is_read).length, [alerts]);

  const markRead = useCallback(async (id) => {
    try {
      await api.put(`/alerts/${id}/read`, { is_read: true });
      setAlerts((prev) => prev.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      refresh,
      alerts,
      loading,
      error,
      unreadCount,
      markRead,
    }),
    [open, toggle, refresh, alerts, loading, error, unreadCount, markRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
