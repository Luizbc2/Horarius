export type LoginInput = {
  email: string;
  password: string;
  accountType?: AccountType;
};

export type AccountType = "business" | "personal";
export type UserRole = "admin" | "user";

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  password: string;
  accountType?: AccountType;
  role?: UserRole;
  active?: boolean;
  avatarUrl?: string | null;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: Omit<AuthenticatedUser, "password">;
};
