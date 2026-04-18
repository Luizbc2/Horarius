import { AuthenticatedUser } from "../../modules/auth/auth.types";
import { UpdateUserProfileInput, UserRepository } from "../../modules/auth/repositories/user.repository";
import { CreateUserInputDto } from "../../modules/users/dtos/create-user.dto";

type InMemoryUserRepositoryOptions = {
  users?: AuthenticatedUser[];
};

export class InMemoryUserRepository implements UserRepository {
  public lastCreatedInput: CreateUserInputDto | null = null;
  public lastUpdatedInput: UpdateUserProfileInput | null = null;

  private readonly users: AuthenticatedUser[];
  private nextId: number;

  constructor(options: InMemoryUserRepositoryOptions = {}) {
    this.users = options.users ? [...options.users] : [];
    this.nextId = this.users.reduce((highestId, user) => Math.max(highestId, user.id), 0) + 1;
  }

  public async findById(id: number): Promise<AuthenticatedUser | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  public async findByEmail(email: string): Promise<AuthenticatedUser | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
  }

  public async findByCpf(cpf: string): Promise<AuthenticatedUser | null> {
    return this.users.find((user) => user.cpf === cpf) ?? null;
  }

  public async create(input: CreateUserInputDto): Promise<AuthenticatedUser> {
    const createdUser: AuthenticatedUser = {
      id: this.nextId++,
      name: input.name,
      email: input.email,
      cpf: input.cpf,
      password: input.password,
    };

    this.lastCreatedInput = { ...input };
    this.users.push(createdUser);

    return createdUser;
  }

  public async updateProfile(id: number, input: UpdateUserProfileInput): Promise<AuthenticatedUser | null> {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return null;
    }

    const currentUser = this.users[userIndex];

    if (!currentUser) {
      return null;
    }

    const updatedUser: AuthenticatedUser = {
      ...currentUser,
      name: input.name,
      cpf: input.cpf,
      password: input.password,
    };

    this.lastUpdatedInput = { ...input };
    this.users[userIndex] = updatedUser;

    return updatedUser;
  }
}
