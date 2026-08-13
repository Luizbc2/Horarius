import type { AccountType, UserRole } from "../../auth/auth.types";

export type AdminUserDto = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  accountType: AccountType;
  role: UserRole;
  active: boolean;
  avatarUrl: string | null;
  createdAt: Date;
};

export type AdminUserPageDto = {
  data: AdminUserDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};
