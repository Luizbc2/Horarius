import type { AccountType } from "../../auth/auth.types";
import type { UserRole } from "../../auth/auth.types";

export type PublicUserDto = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  accountType?: AccountType;
  role?: UserRole;
  active?: boolean;
  avatarUrl?: string | null;
};

export type CreateUserRequestDto = {
  name: string;
  email: string;
  cpf: string;
  password: string;
  accountType?: AccountType;
};

export type CreateUserInputDto = {
  name: string;
  email: string;
  cpf: string;
  password: string;
  accountType?: AccountType;
};

export type CreateUserResponseDto = {
  message: string;
  user: PublicUserDto;
};
