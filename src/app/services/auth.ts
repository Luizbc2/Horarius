import { api } from "../lib/api";

type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    cpf: string;
  };
};

export type SignupResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    cpf: string;
  };
};

export function loginWithApi(input: LoginRequest) {
  return api.post<LoginResponse>("/auth/login", input);
}

export function signupWithApi(input: SignupRequest) {
  return api.post<SignupResponse>("/users", input);
}
