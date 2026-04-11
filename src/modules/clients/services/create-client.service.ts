import { ValidationError } from "sequelize";

import { isValidEmail } from "../../../shared/utils/email.util";
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

  public async execute(input: CreateClientRequestDto): Promise<CreateClientServiceResult> {
    const name = input.name.trim();
    const email = input.email?.trim().toLowerCase() ?? "";
    const phone = input.phone?.trim() ?? "";
    const cpf = input.cpf?.trim() ?? "";
    const notes = input.notes.trim();

    if (!name) {
      return {
        success: false,
        message: "Nome do cliente é obrigatório.",
        statusCode: 400
      };
    }

    if (email && !isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400
      };
    }

    try {
      const createdClient = await this.clientRepository.create({
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

