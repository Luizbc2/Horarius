import { UniqueConstraintError, ValidationError } from "sequelize";

import { PublicUserDto } from "../dtos/create-user.dto";
import { UpdateUserProfileInput, UserRepository } from "../../auth/repositories/user.repository";
import { isValidCpf, normalizeCpf } from "../../../shared/utils/cpf.util";
import { validatePasswordStrength } from "../../../shared/utils/password-strength.util";
import { hashPassword } from "../../auth/utils/password.util";

type UpdateUserProfileServiceInput = UpdateUserProfileInput & {
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
    const name = input.name.trim();
    const cpf = normalizeCpf(input.cpf);
    const password = input.password.trim();

    if (!input.userId || !name || !cpf || !password) {
      return {
        success: false,
        message: "User id, name, CPF and password are required.",
        statusCode: 400,
      };
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        statusCode: 404,
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

    const existingCpfUser = await this.userRepository.findByCpf(cpf);

    if (existingCpfUser && existingCpfUser.id !== input.userId) {
      return {
        success: false,
        message: "CPF is already in use.",
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
          message: "User not found.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Profile updated successfully.",
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
          message: "Invalid user data.",
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
      return "CPF is already in use.";
    }

    return "User data conflicts with an existing record.";
  }
}
