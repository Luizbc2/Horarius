export type LoginInput = {
  email: string;
  password: string;
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
  sid?: number;
  organizationId?: number;
  membershipId?: number;
  organizationRole?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
};

export type LoginResponse = {
  message: string;
  token: string;
  refreshToken?: string;
  organization?: {
    id: number;
    name: string;
    slug: string;
    role: string;
    permissions: string[];
  };
  user: Omit<AuthenticatedUser, "password">;
};
