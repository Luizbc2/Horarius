export type AccountType = "business" | "personal";
export type UserRole = "admin" | "user";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  accountType: AccountType;
  role: UserRole;
  active: boolean;
  avatarUrl: string | null;
};

export type AuthOrganization = {
  id: number;
  name: string;
  slug: string;
  role: string;
  permissions: string[];
};

export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { name: string; cpf: string };
