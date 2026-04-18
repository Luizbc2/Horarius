export type PublicUserDto = {
  id: number;
  name: string;
  email: string;
  cpf: string;
};

export type CreateUserRequestDto = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type CreateUserInputDto = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type CreateUserResponseDto = {
  message: string;
  user: PublicUserDto;
};
