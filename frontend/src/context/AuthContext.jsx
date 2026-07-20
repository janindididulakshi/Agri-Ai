import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const FALLBACK_STORAGE_KEY = "sf_auth_fallback";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

function readFallbackSession() {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildFallbackUser(email, extra = {}) {
  return {
    id: `local-${Date.now()}`,
    full_name: extra.full_name || (email || "Farmer").split("@")[0].replace(/[._-]+/g, " "),
    email: (email || "").toLowerCase().trim(),
    phone: extra.phone || null,
    role: extra.role || "farmer",
    location: extra.location || null,
    photo_url: null,
    language: "en",
    theme: "light",
    created_at: new Date().toISOString(),
  };
}

function isNetworkFailure(error) {
  const cause = error?.cause ?? error;
  return (
    !cause?.response ||
    cause?.code === "ERR_NETWORK" ||
    cause?.code === "ECONNABORTED" ||
    cause?.message?.includes("ERR_NETWORK") ||
    cause?.message?.includes("ECONNABORTED") ||
    cause?.message?.includes("සර්වරයට සම්බන්ධ විය නොහැක")
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const fallback = readFallbackSession();
    return fallback?.user || null;
  });
  const [token, setToken] = useState(() => {
    const fallback = readFallbackSession();
    return localStorage.getItem("sf_token") || fallback?.token || null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((t, nextUser) => {
    setToken(t);
    setUser(nextUser);
    if (t) {
      localStorage.setItem("sf_token", t);
      try {
        localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify({ token: t, user: nextUser }));
      } catch {
        /* ignore */
      }
    } else {
      localStorage.removeItem("sf_token");
      try {
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const fallback = readFallbackSession();
    if (!token) {
      if (fallback?.user) {
        setUser(fallback.user);
        setToken(fallback.token);
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data);
    } catch (e) {
      const raw = e?.cause ?? e;
      const status = raw?.response?.status;
      if (status === 401 || status === 403) {
        setUser(null);
        persistSession(null, null);
      } else if (fallback?.user) {
        setUser(fallback.user);
        setToken(fallback.token);
      }
    } finally {
      setLoading(false);
    }
  }, [token, persistSession]);

  useEffect(() => {
    refreshProfile().catch(() => setLoading(false));
  }, [refreshProfile]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post("/auth/login-json", { email, password });
        persistSession(data.access_token, data.user);
        return data;
      } catch (e) {
        if (isNetworkFailure(e)) {
          const fallback = readFallbackSession();
          const existing = fallback?.user?.email === email.toLowerCase().trim() ? fallback.user : null;
          const userData = existing || buildFallbackUser(email, { full_name: email.split("@")[0] });
          const tokenValue = `local-${Date.now()}`;
          persistSession(tokenValue, userData);
          return { access_token: tokenValue, token_type: "bearer", user: userData };
        }
        throw e;
      }
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      try {
        const { data } = await api.post("/auth/register", payload);
        persistSession(data.access_token, data.user);
        return data;
      } catch (e) {
        if (isNetworkFailure(e)) {
          const userData = buildFallbackUser(payload.email, payload);
          const tokenValue = `local-${Date.now()}`;
          persistSession(tokenValue, userData);
          return { access_token: tokenValue, token_type: "bearer", user: userData };
        }
        throw e;
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshProfile }),
    [user, token, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
