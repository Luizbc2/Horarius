import { CreateUserInputDto } from "../../users/dtos/create-user.dto";
import { AuthenticatedUser } from "../auth.types";
import { UserModel } from "../models/user.model";
import { UpdateUserProfileInput, UserRepository } from "./user.repository";

export class SequelizeUserRepository implements UserRepository {
  public async findById(id: number): Promise<AuthenticatedUser | null> {
    const user = await UserModel.findByPk(id);

    if (!user) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  public async findByEmail(email: string): Promise<AuthenticatedUser | null> {
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
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      cpf: input.cpf,
      password: input.password
    });

    return this.toAuthenticatedUser(user);
  }

  public async updateProfile(id: number, input: UpdateUserProfileInput): Promise<AuthenticatedUser | null> {
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
}
