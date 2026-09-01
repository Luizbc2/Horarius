const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333/api").replace(/\/$/, "");

type ApiAuthSession = { token: string; refreshToken?: string };
type RefreshPayload = ApiAuthSession & { user?: unknown; organization?: unknown };
type ApiAuthAdapter = {
  getSession: () => Promise<ApiAuthSession | null>;
  onRefresh: (payload: RefreshPayload) => Promise<void>;
  onExpire: () => Promise<void>;
};

let authAdapter: ApiAuthAdapter | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const configureApiAuth = (adapter: ApiAuthAdapter): void => {
  authAdapter = adapter;
};

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

  let response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && headers.has("Authorization") && !path.startsWith("/auth/")) {
    const token = await renewAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    }
  }

  const data = await response.json().catch(() => null) as { message?: string } | null;

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Não foi possível concluir a operação.", response.status);
  }

  return data as T;
}

const renewAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const session = await authAdapter?.getSession();
    if (!session?.refreshToken) return null;
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!response.ok) {
      await authAdapter?.onExpire();
      return null;
    }
    const payload = await response.json() as RefreshPayload;
    await authAdapter?.onRefresh(payload);
    return payload.token;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

export function resolveApiAsset(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL.replace(/\/api$/, "")}${path}`;
}
