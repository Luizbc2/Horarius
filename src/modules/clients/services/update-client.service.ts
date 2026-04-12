import { ValidationError } from "sequelize";

import { isValidEmail } from "../../../shared/utils/email.util";
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

  public async execute(id: number, input: UpdateClientRequestDto): Promise<UpdateClientServiceResult> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const cpf = input.cpf?.trim() ?? "";
    const notes = input.notes.trim();

    if (!id || !name || !email || !phone) {
      return {
        success: false,
        message: "Id, nome, e-mail e telefone sao obrigatorios.",
        statusCode: 400
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de e-mail invalido.",
        statusCode: 400
      };
    }

    try {
      const updatedClient = await this.clientRepository.update(id, {
        name,
        email,
        phone,
        cpf,
        notes
      });

      if (!updatedClient) {
        return {
          success: false,
          message: "Cliente nao encontrado.",
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
          message: "Dados de cliente invalidos.",
          statusCode: 400
        };
      }

      throw error;
    }
  }
}


