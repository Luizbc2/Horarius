import { UniqueConstraintError, ValidationError } from "sequelize";

import { PublicUserDto } from "../dtos/create-user.dto";
import { UpdateUserProfileInput, UserRepository } from "../../auth/repositories/user.repository";
import { isValidCpf, normalizeCpf } from "../../../shared/utils/cpf.util";
import { hasTextLengthBetween, INPUT_LIMITS, normalizeSingleLineText } from "../../../shared/utils/input-validation.util";
import { validatePasswordStrength } from "../../../shared/utils/password-strength.util";
import { hashPassword } from "../../auth/utils/password.util";

type UpdateUserProfileServiceInput = UpdateUserProfileInput & {
  authenticatedUserId: number;
  email?: string;
  userId: number;
};

type UpdateUserProfileResponseDto = {
  message: string;
  user: PublicUserDto;
};

type UpdateUserProfileServiceResult =
  | {
      success: true;
      data: UpdateUserProfileResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class UpdateUserProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute(input: UpdateUserProfileServiceInput): Promise<UpdateUserProfileServiceResult> {
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.name);
    const cpf = normalizeCpf(input.cpf);
    const password = input.password.trim();

    if (!input.authenticatedUserId || !input.userId || !name || !cpf || !password) {
      return {
        success: false,
        message: "Id do usuário autenticado, id do usuário, nome, CPF e senha são obrigatórios.",
        statusCode: 400,
      };
    }

    if (input.authenticatedUserId !== input.userId) {
      return {
        success: false,
        message: "Você só pode editar o próprio perfil.",
        statusCode: 403,
      };
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      return {
        success: false,
        message: "Usuário não encontrado.",
        statusCode: 404,
      };
    }

    if (input.email && input.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return {
        success: false,
        message: "O e-mail não pode ser alterado.",
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

    const existingCpfUser = await this.userRepository.findByCpf(cpf);

    if (existingCpfUser && existingCpfUser.id !== input.userId) {
      return {
        success: false,
        message: "CPF já está em uso.",
        statusCode: 409,
      };
    }

    try {
      const updatedUser = await this.userRepository.updateProfile(input.userId, {
        name,
        cpf,
        password: await hashPassword(password),
      });

      if (!updatedUser) {
        return {
          success: false,
          message: "Usuário não encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Perfil atualizado com sucesso.",
          user: this.toPublicUser(updatedUser),
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

    if (fields.includes("cpf")) {
      return "CPF já está em uso.";
    }

    return "Os dados do usuario entram em conflito com um registro existente.";
  }
}



