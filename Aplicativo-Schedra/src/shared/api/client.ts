const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = await response.json().catch(() => null) as { message?: string } | null;

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Não foi possível concluir a operação.", response.status);
  }

  return data as T;
}

export function resolveApiAsset(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL.replace(/\/api$/, "")}${path}`;
}
