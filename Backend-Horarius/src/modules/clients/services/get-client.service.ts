import { ClientDto } from "../dtos/client.dto";
import { ClientRepository } from "../repositories/client.repository";

type GetClientResponseDto = {
  client: ClientDto;
};

type GetClientServiceResult =
  | {
      success: true;
      data: GetClientResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class GetClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(userId: number, id: number): Promise<GetClientServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do cliente são obrigatórios.",
        statusCode: 400,
      };
    }

    const client = await this.clientRepository.findById(userId, id);

    if (!client) {
      return {
        success: false,
        message: "Cliente não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        client,
      },
    };
  }
}
