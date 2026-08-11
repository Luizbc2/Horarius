export type LoginInput = {
  email: string;
  password: string;
  accountType?: AccountType;
};

export type AccountType = "business" | "personal";

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  password: string;
  accountType?: AccountType;
  avatarUrl?: string | null;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: Omit<AuthenticatedUser, "password">;
};
