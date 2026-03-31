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

  public async execute(id: number): Promise<DeleteClientServiceResult> {
    if (!id) {
      return {
        success: false,
        message: "Id do cliente é obrigatório.",
        statusCode: 400
      };
    }

    const deleted = await this.clientRepository.delete(id);

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
        message: "Cliente excluído com sucesso."
      }
    };
  }
}
