import { CreateUserInputDto } from "../../users/dtos/create-user.dto";
import { AuthenticatedUser } from "../auth.types";
import { UserModel } from "../models/user.model";
import { UpdateUserProfileInput, UserRepository } from "./user.repository";

export class SequelizeUserRepository implements UserRepository {
  public async findById(id: number): Promise<AuthenticatedUser | null> {
    this.assertModelIsInitialized();
    const user = await UserModel.findByPk(id);

    if (!user) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  public async findByEmail(email: string): Promise<AuthenticatedUser | null> {
    this.assertModelIsInitialized();
    const user = await UserModel.findOne({
      where: {
        email: email.toLowerCase()
      }
    });

    if (!user) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  public async findByCpf(cpf: string): Promise<AuthenticatedUser | null> {
    this.assertModelIsInitialized();
    const user = await UserModel.findOne({
      where: {
        cpf
      }
    });

    if (!user) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  public async create(input: CreateUserInputDto): Promise<AuthenticatedUser> {
    this.assertModelIsInitialized();
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      cpf: input.cpf,
      password: input.password
    });

    return this.toAuthenticatedUser(user);
  }

  public async updateProfile(id: number, input: UpdateUserProfileInput): Promise<AuthenticatedUser | null> {
    this.assertModelIsInitialized();
    const user = await UserModel.findByPk(id);

    if (!user) {
      return null;
    }

    user.name = input.name;
    user.cpf = input.cpf;
    user.password = input.password;

    await user.save();

    return this.toAuthenticatedUser(user);
  }

  private toAuthenticatedUser(user: UserModel): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      password: user.password
    };
  }

  private assertModelIsInitialized(): void {
    if (!UserModel.sequelize) {
      throw new Error(
        "O modelo de usuario nao foi inicializado. Confira DATABASE_URL, DB_SSL e se o backend foi redeployado apos salvar as variaveis no Vercel.",
      );
    }
  }
}
