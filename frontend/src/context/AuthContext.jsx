import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("sf_token"));
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback((t) => {
    setToken(t);
    if (t) localStorage.setItem("sf_token", t);
    else localStorage.removeItem("sf_token");
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data);
    } catch (e) {
      const raw = e?.cause ?? e;
      const status = raw?.response?.status;
      // Only drop session when the token is rejected — not on network blips or 5xx.
      if (status === 401 || status === 403) {
        setUser(null);
        persistToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, persistToken]);

  useEffect(() => {
    refreshProfile().catch(() => setLoading(false));
  }, [refreshProfile]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post("/auth/login-json", { email, password });
        persistToken(data.access_token);
        setUser(data.user);
        return data;
      } catch (e) {
        throw e;
      }
    },
    [persistToken]
  );

  const register = useCallback(
    async (payload) => {
      try {
        const { data } = await api.post("/auth/register", payload);
        persistToken(data.access_token);
        setUser(data.user);
        return data;
      } catch (e) {
        throw e;
      }
    },
    [persistToken]
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshProfile }),
    [user, token, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
