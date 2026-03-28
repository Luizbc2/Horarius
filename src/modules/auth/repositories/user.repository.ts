import { CreateUserInputDto } from "../../users/dtos/create-user.dto";
import { AuthenticatedUser } from "../auth.types";

export interface UserRepository {
  findByEmail(email: string): Promise<AuthenticatedUser | null>;
  findByCpf(cpf: string): Promise<AuthenticatedUser | null>;
  create(input: CreateUserInputDto): Promise<AuthenticatedUser>;
}
