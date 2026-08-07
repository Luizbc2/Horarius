import {
  CreateUserInputDto,
  CreateUserResponseDto,
  PublicUserDto,
} from "../dtos/create-user.dto";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { UserRepository } from "../../auth/repositories/user.repository";
import { isValidEmail } from "../../../shared/utils/email.util";
import { isValidCpf, normalizeCpf } from "../../../shared/utils/cpf.util";
import { hasTextLengthBetween, INPUT_LIMITS, normalizeSingleLineText } from "../../../shared/utils/input-validation.util";
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
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.name);
    const email = input.email.trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf);
    const password = input.password.trim();

    if (!name || !email || !cpf || !password) {
      return {
        success: false,
        message: "Nome, e-mail, CPF e senha são obrigatórios.",
        statusCode: 400,
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(name, 2, INPUT_LIMITS.name)) {
      return {
        success: false,
        message: "O nome do usuário deve ter entre 2 e 120 caracteres.",
        statusCode: 400,
      };
    }

    if (email.length > INPUT_LIMITS.email) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400,
      };
    }

    if (!isValidCpf(cpf)) {
      return {
        success: false,
        message: "CPF inválido.",
        statusCode: 400,
      };
    }

    if (password.length > INPUT_LIMITS.password) {
      return {
        success: false,
        message: `A senha deve ter no maximo ${INPUT_LIMITS.password} caracteres.`,
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
        message: "E-mail já está em uso.",
        statusCode: 409,
      };
    }

    const existingCpfUser = await this.userRepository.findByCpf(cpf);

    if (existingCpfUser) {
      return {
        success: false,
        message: "CPF já está em uso.",
        statusCode: 409,
      };
    }

    try {
      const createdUser = await this.userRepository.create({
        name,
        email,
        cpf,
        password: await hashPassword(password),
      });

      return {
        success: true,
        data: {
          message: "Usuário cadastrado com sucesso.",
          user: this.toPublicUser(createdUser),
        },
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return {
          success: false,
          message: this.getUniqueConstraintMessage(error),
          statusCode: 409,
        };
      }

      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados de usuário inválidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }

  private toPublicUser(user: PublicUserDto): PublicUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  }

  private getUniqueConstraintMessage(error: UniqueConstraintError): string {
    const fields = error.errors.map((item) => item.path);

    if (fields.includes("email")) {
      return "E-mail já está em uso.";
    }

    if (fields.includes("cpf")) {
      return "CPF já está em uso.";
    }

    return "Os dados do usuario entram em conflito com um registro existente.";
  }
}



