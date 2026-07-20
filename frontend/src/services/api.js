import axios from "axios";

const isBrowser = typeof window !== "undefined";
const defaultBase =
  isBrowser &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://agri-ai-backend-production.up.railway.app"
    : "http://localhost:8000";
const raw = (import.meta.env.VITE_API_URL || defaultBase).trim();

export const api = axios.create({
  baseURL: raw.replace(/\/$/, ""),
  timeout: 60000,
});

api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem("sf_token");
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (!err.response) {
      const net =
        err.code === "ECONNABORTED"
          ? "සේවාදායකය කල් ඉකුත් විය. නැවත උත්සාහ කරන්න."
          : err.code === "ERR_NETWORK"
            ? "සර්වරයට සම්බන්ධ විය නොහැක (අන්තර්ජාලය / API ලිපිනය පරීක්ෂා කරන්න)."
            : "සර්වරයට සම්බන්ධ විය නොහැක.";
      const e = new Error(net);
      e.cause = err;
      return Promise.reject(e);
    }

    const d = err?.response?.data?.detail;
    let msg = d;
    if (Array.isArray(d)) {
      msg = d
        .map((x) => (typeof x === "string" ? x : `${x?.loc?.join(".")}: ${x?.msg || JSON.stringify(x)}`))
        .join("; ");
    } else if (d && typeof d === "object") {
      msg = JSON.stringify(d);
    }
    msg =
      msg ||
      err?.response?.data?.message ||
      err?.message ||
      "දෝෂයක් ඇති විය.";
    const e = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    e.cause = err;
    return Promise.reject(e);
  }
);
