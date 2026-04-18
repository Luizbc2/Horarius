import { CreateUserInputDto } from "../../users/dtos/create-user.dto";
import { AuthenticatedUser } from "../auth.types";

export type UpdateUserProfileInput = {
  name: string;
  cpf: string;
  password: string;
};

export interface UserRepository {
  findById(id: number): Promise<AuthenticatedUser | null>;
  findByEmail(email: string): Promise<AuthenticatedUser | null>;
  findByCpf(cpf: string): Promise<AuthenticatedUser | null>;
  create(input: CreateUserInputDto): Promise<AuthenticatedUser>;
  updateProfile(id: number, input: UpdateUserProfileInput): Promise<AuthenticatedUser | null>;
}
