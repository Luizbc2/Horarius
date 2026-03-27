import { env } from "../../../config/env";
import { AuthenticatedUser } from "../auth.types";
import { UserRepository } from "./user.repository";

export class InMemoryUserRepository implements UserRepository {
  private readonly users: AuthenticatedUser[];

  constructor() {
    this.users = [
      {
        id: 1,
        name: env.authDemoUser.name,
        email: env.authDemoUser.email.toLowerCase(),
        cpf: env.authDemoUser.cpf,
        password: env.authDemoUser.password
      }
    ];
  }

  public async findByEmail(email: string): Promise<AuthenticatedUser | null> {
    const user = this.users.find((storedUser) => storedUser.email === email.toLowerCase());

    return user || null;
  }
}
