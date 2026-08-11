import { apiRequest } from "../../../shared/api/client";
import type { AuthUser, LoginInput, SignupInput } from "../types";

export type AuthResponse = { message: string; token: string; user: AuthUser };
export type SignupResponse = { message: string; user: AuthUser };

export const login = (input: LoginInput) =>
  apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) });

export const signup = (input: SignupInput) =>
  apiRequest<SignupResponse>("/users", { method: "POST", body: JSON.stringify(input) });

export const uploadAvatar = (token: string, uri: string, mimeType = "image/jpeg") => {
  const body = new FormData();
  body.append("avatar", { uri, name: `avatar-${Date.now()}.jpg`, type: mimeType } as unknown as Blob);

  return apiRequest<{ message: string; user: AuthUser }>("/users/me/avatar", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
};
