const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const token = sessionStorage.getItem("token"); // localStorage → sessionStorage

    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        ...init,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data as any)?.ok === false) {
        throw new Error((data as any)?.error || `HTTP ${res.status}`);
    }
    return data as T;
}