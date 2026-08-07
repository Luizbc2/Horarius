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
import { ClientDto, UpdateClientRequestDto } from "../dtos/client.dto";
import { ClientRepository } from "../repositories/client.repository";

type UpdateClientResponseDto = {
  message: string;
  client: ClientDto;
};

type UpdateClientServiceResult =
  | {
      success: true;
      data: UpdateClientResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class UpdateClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(
    userId: number,
    id: number,
    input: UpdateClientRequestDto,
  ): Promise<UpdateClientServiceResult> {
    const name = normalizeSingleLineText(input.name, INPUT_LIMITS.clientName);
    const email = input.email.trim().toLowerCase();
    const phone = normalizePhone(input.phone);
    const cpf = normalizeCpf(input.cpf ?? "");
    const notes = normalizeMultiLineText(input.notes, INPUT_LIMITS.notes);

    if (!userId || !id || !name || !email || !phone) {
      return {
        success: false,
        message: "Usuário autenticado, id, nome, e-mail e telefone são obrigatórios.",
        statusCode: 400
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
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

    if (email.length > INPUT_LIMITS.email) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400
      };
    }

    if (!isValidPhone(phone)) {
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
      const updatedClient = await this.clientRepository.update(userId, id, {
        name,
        email,
        phone,
        cpf,
        notes
      });

      if (!updatedClient) {
        return {
          success: false,
          message: "Cliente não encontrado.",
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          message: "Cliente atualizado com sucesso.",
          client: updatedClient
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


