import { ValidationError } from "sequelize";

import { isValidEmail } from "../../../shared/utils/email.util";
import {
  hasTextLengthBetween,
  INPUT_LIMITS,
  isValidPhone,
  normalizePhone,
  normalizeSingleLineText,
} from "../../../shared/utils/input-validation.util";
import { ProfessionalDto, UpdateProfessionalRequestDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type UpdateProfessionalResponseDto = {
  message: string;
  professional: ProfessionalDto;
};

type UpdateProfessionalServiceResult =
  | {
      success: true;
      data: UpdateProfessionalResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class UpdateProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(
    userId: number,
    id: number,
    input: UpdateProfessionalRequestDto,
  ): Promise<UpdateProfessionalServiceResult> {
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.name);
    const email = input.email.trim().toLowerCase();
    const phone = normalizePhone(input.phone);
    const specialty = normalizeSingleLineText(input.specialty, INPUT_LIMITS.specialty);
    const status = input.status.trim().toLowerCase();

    if (!userId || !id || !name || !email || !phone || !specialty || !status) {
      return {
        success: false,
        message: "Usuário autenticado, id, nome, e-mail, telefone, especialidade e status são obrigatórios.",
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
        message: "O nome do profissional deve ter entre 2 e 120 caracteres.",
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

    if (!isValidPhone(phone)) {
      return {
        success: false,
        message: "Telefone do profissional inválido.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(specialty, 2, INPUT_LIMITS.specialty)) {
      return {
        success: false,
        message: "A especialidade deve ter entre 2 e 80 caracteres.",
        statusCode: 400,
      };
    }

    if (!["ativo", "ferias"].includes(status)) {
      return {
        success: false,
        message: "Status do profissional inválido.",
        statusCode: 400,
      };
    }

    try {
      const updatedProfessional = await this.professionalRepository.update(userId, id, {
        name,
        email,
        phone,
        specialty,
        status,
      });

      if (!updatedProfessional) {
        return {
          success: false,
          message: "Profissional não encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Profissional atualizado com sucesso.",
          professional: updatedProfessional,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados do profissional são inválidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }
}
