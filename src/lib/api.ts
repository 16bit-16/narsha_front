export type ApiError = { error?: string; message?: string };

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// ✅ 하나의 통합된 api 함수
export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = sessionStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { 
    ...options, 
    headers,
    credentials: "include",
  });
  
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!res.ok || data?.ok === false) {
    const msg = data.error || data.message || res.statusText;
    throw new Error(msg);
  }
  
  return data as T;
}

// ✅ 헬퍼 함수들 (api 함수 사용)
async function post<T>(path: string, body: any): Promise<T> {
  return api<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function get<T>(path: string): Promise<T> {
  return api<T>(path, { method: "GET" });
}

export const AuthAPI = {
  login: (userId: string, password: string) =>
    post<{ ok: true; user: any; token: string }>("/auth/login", { userId, password }),
  me: () => get<{ ok: true; user: any }>("/auth/me"),
  logout: () => post<{ ok: true }>("/auth/logout", {}),
};

export { post, get };