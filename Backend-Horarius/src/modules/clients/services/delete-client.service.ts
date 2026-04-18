import { ClientRepository } from "../repositories/client.repository";

type DeleteClientResponseDto = {
  message: string;
};

type DeleteClientServiceResult =
  | {
      success: true;
      data: DeleteClientResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class DeleteClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  public async execute(userId: number, id: number): Promise<DeleteClientServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do cliente são obrigatórios.",
        statusCode: 400
      };
    }

    const deleted = await this.clientRepository.delete(userId, id);

    if (!deleted) {
      return {
        success: false,
        message: "Cliente não encontrado.",
        statusCode: 404
      };
    }

    return {
      success: true,
      data: {
        message: "Cliente excluido com sucesso."
      }
    };
  }
}

