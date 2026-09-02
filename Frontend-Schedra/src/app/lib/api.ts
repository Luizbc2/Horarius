export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3333/api";

type QueryValue = string | number | boolean | null | undefined;
import type { JsonValue } from "../types/http";
import { clearStoredSession, persistSession, readStoredSession } from "./auth-storage";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: JsonValue | null;

  constructor(message: string, status: number, data: JsonValue | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const buildUrl = (path: string, query?: Record<string, QueryValue>): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(`${baseUrl}${normalizedPath}`, origin);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const isJsonResponse = (contentType: string | null): boolean => contentType?.includes("application/json") ?? false;

const parseResponseBody = async (response: Response): Promise<JsonValue | null> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");

  if (isJsonResponse(contentType)) {
    return (await response.json()) as JsonValue;
  }

  const text = await response.text();
  return text || null;
};

const createHeaders = (initHeaders?: HeadersInit, body?: unknown): Headers => {
  const headers = new Headers(initHeaders);

  if (body !== undefined && body !== null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, headers: initHeaders, ...init } = options;
  const headers = createHeaders(initHeaders, body);
  let response = await fetch(buildUrl(path, query), {
    ...init,
    credentials: "include",
    headers,
    body: body === undefined || body === null ? undefined : JSON.stringify(body),
  });

  if (
    response.status === 401 &&
    headers.has("Authorization") &&
    path !== "/auth/login" &&
    path !== "/auth/refresh"
  ) {
    const renewedToken = await renewAccessToken();
    if (renewedToken) {
      headers.set("Authorization", `Bearer ${renewedToken}`);
      response = await fetch(buildUrl(path, query), {
        ...init,
        credentials: "include",
        headers,
        body: body === undefined || body === null ? undefined : JSON.stringify(body),
      });
    }
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
        ? data.message
        : `HTTP ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

let refreshPromise: Promise<string | null> | null = null;

const renewAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const storedSession = readStoredSession();
    if (!storedSession) return null;
    const response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-auth-client": "web" },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      clearStoredSession();
      return null;
    }
    const data = await response.json() as {
      token: string;
      user?: typeof storedSession.user;
      organization?: typeof storedSession.organization;
    };
    persistSession({
      token: data.token,
      user: data.user ?? storedSession.user,
      organization: data.organization ?? storedSession.organization,
    });
    return data.token;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
