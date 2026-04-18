export const AUTH_STORAGE_KEY = "horarius:auth";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export const normalizeCpf = (value: string): string => value.replace(/\D/g, "").slice(0, 11);

const canUseLocalStorage = (): boolean => typeof window !== "undefined";

const normalizeAuthUser = (user: AuthUser): AuthUser => ({
  id: user.id,
  name: user.name.trim(),
  email: user.email.trim().toLowerCase(),
  cpf: normalizeCpf(user.cpf),
});

export function readStoredSession(): AuthSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession) as Partial<AuthSession>;

    if (
      !parsedSession.token ||
      typeof parsedSession.user?.id !== "number" ||
      !parsedSession.user.email ||
      !parsedSession.user.name
    ) {
      return null;
    }

    return {
      token: parsedSession.token,
      user: {
        id: parsedSession.user.id,
        email: parsedSession.user.email,
        name: parsedSession.user.name,
        cpf: typeof parsedSession.user.cpf === "string" ? normalizeCpf(parsedSession.user.cpf) : "",
      },
    };
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: session.token,
      user: normalizeAuthUser(session.user),
    } satisfies AuthSession),
  );
}

export function clearStoredSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return readStoredSession()?.token ?? null;
}
