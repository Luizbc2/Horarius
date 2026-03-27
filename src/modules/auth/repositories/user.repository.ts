import { AuthenticatedUser } from "../auth.types";

export interface UserRepository {
  findByEmail(email: string): Promise<AuthenticatedUser | null>;
}
