import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const themes = {
  green: {
    "--sf-bg": "#eef4ef",
    "--sf-card": "#ffffff",
    "--sf-primary": "#0bc25c",
    "--sf-accent": "#6edb9f",
    "--sf-text": "#1a2e24",
    "--sf-muted-text": "#5c6d64",
    "--sf-border": "rgba(27, 67, 50, 0.12)",
    "--sf-input-bg": "#ffffff",
    "--gov-sidebar-bg": "#0bc25c",
    "--gov-hero": "#0bc25c",
    "--sf-msg-user": "#fcebd7",
    "--sf-msg-ai": "#d8f3dc",
    "--sf-warning-banner": "#fff3cd",
    "--sf-warning-text": "#664d03",
  },
  gold: {
    "--sf-bg": "#fdfaf3",
    "--sf-card": "#ffffff",
    "--sf-primary": "#c47f00",
    "--sf-accent": "#f4a923",
    "--sf-text": "#2d2319",
    "--sf-muted-text": "#6d614e",
    "--sf-border": "rgba(196, 127, 0, 0.14)",
    "--sf-input-bg": "#fffefb",
    "--gov-sidebar-bg": "#3d2914",
    "--gov-hero": "#5d4032",
    "--sf-msg-user": "#ffe8cc",
    "--sf-msg-ai": "#e8f5e9",
    "--sf-warning-banner": "#fff8e6",
    "--sf-warning-text": "#6b4f04",
  },
  night: {
    "--sf-bg": "#0d1110",
    "--sf-card": "#161d1a",
    "--sf-primary": "#40916c",
    "--sf-accent": "#ffd166",
    "--sf-text": "#e8f5e9",
    "--sf-muted-text": "#a3b8ab",
    "--sf-border": "rgba(255,255,255,0.08)",
    "--sf-input-bg": "rgba(0,0,0,0.35)",
    "--gov-sidebar-bg": "#050807",
    "--gov-hero": "#0a1612",
    "--sf-msg-user": "#3d3428",
    "--sf-msg-ai": "#1e3d2e",
    "--sf-warning-banner": "#3d3518",
    "--sf-warning-text": "#ffe082",
  },
  contrast: {
    "--sf-bg": "#000000",
    "--sf-card": "#0a0a0a",
    "--sf-primary": "#ffffff",
    "--sf-accent": "#ffff00",
    "--sf-text": "#ffff00",
    "--sf-muted-text": "#dddddd",
    "--sf-border": "#ffff00",
    "--sf-input-bg": "#000000",
    "--gov-sidebar-bg": "#000000",
    "--gov-hero": "#000000",
    "--sf-msg-user": "#222200",
    "--sf-msg-ai": "#003300",
    "--sf-warning-banner": "#222200",
    "--sf-warning-text": "#ffff00",
  },
};

/** Map legacy keys saved in localStorage / older profiles */
const LEGACY_THEME = { nature: "green", sunlight: "gold" };

const ThemeContext = createContext({
  theme: "green",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const raw = localStorage.getItem("sf_theme") || "green";
    return LEGACY_THEME[raw] || raw;
  });

  useEffect(() => {
    const normalized = LEGACY_THEME[theme] || theme;
    if (normalized !== theme) {
      setThemeState(normalized);
      return;
    }
    localStorage.setItem("sf_theme", theme);
    const vars = themes[theme] || themes.green;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  const setTheme = useCallback((t) => {
    try {
      const n = LEGACY_THEME[t] || t;
      setThemeState(n);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
