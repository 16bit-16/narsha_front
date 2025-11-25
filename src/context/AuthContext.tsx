// ✅ 수정된 AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// ✅ User 타입에서 null 제거
type User = { 
  id: string; 
  userId: string; 
  email: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data as any)?.ok === false) {
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

type AuthContextValue = {
  user: User | null; // ✅ 여기서 null 처리
  loading: boolean;
  authBusy: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // ✅ 여기도 수정
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api<{ ok: true; user: User }>("/auth/me");
        setUser(me.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    const me = await api<{ ok: true; user: User }>("/auth/me");
    setUser(me.user);
  };

  const login = async (userId: string, password: string) => {
    setAuthBusy(true);
    try {
      const res = await api<{ ok: true; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ userId, password }),
      });
      setUser(res.user);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setAuthBusy(true);
    try {
      await api<{ ok: true }>("/auth/logout", { method: "POST" });
      setUser(null);
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, authBusy, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}