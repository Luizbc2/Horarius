import { ValidationError } from "sequelize";

import { isValidCpf, normalizeCpf } from "../../../shared/utils/cpf.util";
import { isValidEmail } from "../../../shared/utils/email.util";
import {
  hasTextLengthBetween,
  INPUT_LIMITS,
  isValidPhone,
  normalizeMultiLineText,
  normalizePhone,
  normalizeSingleLineText,
} from "../../../shared/utils/input-validation.util";
import { ClientRepository } from "../repositories/client.repository";
import { ClientDto, CreateClientRequestDto } from "../dtos/client.dto";

type CreateClientResponseDto = {
  message: string;
  client: ClientDto;
};

type CreateClientServiceResult =
  | {
      success: true;
      data: CreateClientResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class CreateClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(userId: number, input: CreateClientRequestDto): Promise<CreateClientServiceResult> {
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.clientName);
    const email = input.email?.trim().toLowerCase() ?? "";
    const phone = normalizePhone(input.phone);
    const cpf = normalizeCpf(input.cpf ?? "");
    const notes = normalizeMultiLineText(input.notes, INPUT_LIMITS.notes);

    if (!name) {
      return {
        success: false,
        message: "Nome do cliente é obrigatório.",
        statusCode: 400
      };
    }

    if (!hasTextLengthBetween(name, 2, INPUT_LIMITS.clientName)) {
      return {
        success: false,
        message: "O nome do cliente deve ter entre 2 e 120 caracteres.",
        statusCode: 400
      };
    }

    if (email && (email.length > INPUT_LIMITS.email || !isValidEmail(email))) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400
      };
    }

    if (phone && !isValidPhone(phone)) {
      return {
        success: false,
        message: "Telefone do cliente inválido.",
        statusCode: 400
      };
    }

    if (cpf && !isValidCpf(cpf)) {
      return {
        success: false,
        message: "CPF do cliente inválido.",
        statusCode: 400
      };
    }

    if (notes && !hasTextLengthBetween(notes, 3, INPUT_LIMITS.notes)) {
      return {
        success: false,
        message: "As observações do cliente devem ter entre 3 e 500 caracteres.",
        statusCode: 400
      };
    }

    try {
      const createdClient = await this.clientRepository.create(userId, {
        name,
        email,
        phone,
        cpf,
        notes
      });

      return {
        success: true,
        data: {
          message: "Cliente cadastrado com sucesso.",
          client: createdClient
        }
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados de cliente inválidos.",
          statusCode: 400
        };
      }

      throw error;
    }
  }
}
