import { ValidationError } from "sequelize";

import {
  hasTextLengthBetween,
  INPUT_LIMITS,
  isNonNegativeAmount,
  isPositiveInteger,
  normalizeMultiLineText,
  normalizeSingleLineText,
} from "../../../shared/utils/input-validation.util";
import { ServiceDto, UpdateServiceRequestDto } from "../dtos/service.dto";
import { ServiceRepository } from "../repositories/service.repository";

type UpdateServiceResponseDto = {
  message: string;
  service: ServiceDto;
};

type UpdateServiceServiceResult =
  | {
      success: true;
      data: UpdateServiceResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class UpdateServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(
    userId: number,
    id: number,
    input: UpdateServiceRequestDto,
  ): Promise<UpdateServiceServiceResult> {
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.name);
    const category = normalizeSingleLineText(input.category, INPUT_LIMITS.category);
    const description = normalizeMultiLineText(input.description, INPUT_LIMITS.description);
    const durationMinutes = Number(input.durationMinutes);
    const price = Number(input.price);

    if (!userId || !id || !name || !category || !durationMinutes || Number.isNaN(price)) {
      return {
        success: false,
        message: "Usuário autenticado, id, nome, categoria, duração e preço são obrigatórios.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(name, 2, INPUT_LIMITS.name)) {
      return {
        success: false,
        message: "O nome do serviço deve ter entre 2 e 120 caracteres.",
        statusCode: 400,
      };
    }

    if (!hasTextLengthBetween(category, 2, INPUT_LIMITS.category)) {
      return {
        success: false,
        message: "A categoria do serviço deve ter entre 2 e 80 caracteres.",
        statusCode: 400,
      };
    }

    if (description && !hasTextLengthBetween(description, 5, INPUT_LIMITS.description)) {
      return {
        success: false,
        message: "A descrição do serviço deve ter entre 5 e 500 caracteres.",
        statusCode: 400,
      };
    }

    if (!isPositiveInteger(durationMinutes, 1440)) {
      return {
        success: false,
        message: "A duração do serviço deve ser um número inteiro entre 1 e 1440.",
        statusCode: 400,
      };
    }

    if (!isNonNegativeAmount(price, 99999.99)) {
      return {
        success: false,
        message: "O preço do serviço deve ser um valor entre 0 e 99999.99.",
        statusCode: 400,
      };
    }

    try {
      const updatedService = await this.serviceRepository.update(userId, id, {
        name,
        category,
        durationMinutes,
        price,
        description,
      });

      if (!updatedService) {
        return {
          success: false,
          message: "Serviço não encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Serviço atualizado com sucesso.",
          service: updatedService,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados do serviço são inválidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }
}
