import {
  CreateUserInputDto,
  CreateUserResponseDto,
  PublicUserDto,
} from "../dtos/create-user.dto";
import { UserRepository } from "../../auth/repositories/user.repository";
import { isValidEmail } from "../../../shared/utils/email.util";
import { isValidCpf, normalizeCpf } from "../../../shared/utils/cpf.util";
import { validatePasswordStrength } from "../../../shared/utils/password-strength.util";
import { hashPassword } from "../../auth/utils/password.util";

type CreateUserServiceResult =
  | {
      success: true;
      data: CreateUserResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(input: CreateUserInputDto): Promise<CreateUserServiceResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf);
    const password = input.password.trim();

    if (!name || !email || !cpf || !password) {
      return {
        success: false,
        message: "Name, email, cpf and password are required.",
        statusCode: 400,
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Invalid email format.",
        statusCode: 400,
      };
    }

    if (!isValidCpf(cpf)) {
      return {
        success: false,
        message: "Invalid CPF.",
        statusCode: 400,
      };
    }

    const passwordValidationMessage = validatePasswordStrength(password);

    if (passwordValidationMessage) {
      return {
        success: false,
        message: passwordValidationMessage,
        statusCode: 400,
      };
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      return {
        success: false,
        message: "Email is already in use.",
        statusCode: 409,
      };
    }

    const existingCpfUser = await this.userRepository.findByCpf(cpf);

    if (existingCpfUser) {
      return {
        success: false,
        message: "CPF is already in use.",
        statusCode: 409,
      };
    }

    const createdUser = await this.userRepository.create({
      name,
      email,
      cpf,
      password: await hashPassword(password),
    });

    return {
      success: true,
      data: {
        message: "User created successfully.",
        user: this.toPublicUser(createdUser),
      },
    };
  }

  private toPublicUser(user: PublicUserDto): PublicUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  }
}
