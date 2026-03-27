export type LoginInput = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user: Omit<AuthenticatedUser, "password">;
};
