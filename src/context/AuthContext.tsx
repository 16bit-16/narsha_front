// context/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../utils/api";

type User = { 
  _id: string; 
  nickname: string;
  userId: string; 
  email: string;
  profileImage?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authBusy: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  // 앱 시작 시 세션 복구
  useEffect(() => {
    (async () => {
      try {
        const me = await api<{ ok: true; user: User }>("/auth/me");
        setUser(me.user);
      } catch {
        setUser(null);
        sessionStorage.removeItem("token"); // 만료된 토큰 제거
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
      const res = await api<{ ok: true; user: User; token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ userId, password }),
        }
      );
      
      sessionStorage.setItem("token", res.token); // 변경
      setUser(res.user);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setAuthBusy(true);
    try {
      await api<{ ok: true }>("/auth/logout", { method: "POST" });
      alert("로그아웃되었습니다.");
      // localStorage에서 토큰 제거
      sessionStorage.removeItem("token");
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