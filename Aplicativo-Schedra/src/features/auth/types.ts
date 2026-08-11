export type AccountType = "business" | "personal";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  accountType: AccountType;
  avatarUrl: string | null;
};

export type LoginInput = { email: string; password: string };
export type SignupInput = LoginInput & { name: string; cpf: string; accountType: AccountType };
