import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth";
import { getAccessToken, getRefreshToken, clearTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const onLogout = () => setUser(null);
    window.addEventListener("lifeos:logout", onLogout);
    return () => window.removeEventListener("lifeos:logout", onLogout);
  }, [loadProfile]);

  const login = async (usernameOrEmail, password) => {
    const u = await authApi.login(usernameOrEmail, password);
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const u = await authApi.register(payload);
    setUser(u);
    return u;
  };

  const logout = async () => {
    const refresh = getRefreshToken();
    await authApi.logout(refresh).catch(() => {});
    setUser(null);
  };

  const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refetch: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
