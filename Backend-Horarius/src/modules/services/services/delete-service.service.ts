import { ServiceRepository } from "../repositories/service.repository";

type DeleteServiceResponseDto = {
  message: string;
};

type DeleteServiceServiceResult =
  | {
      success: true;
      data: DeleteServiceResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class DeleteServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(userId: number, id: number): Promise<DeleteServiceServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do serviço são obrigatórios.",
        statusCode: 400,
      };
    }

    const deleted = await this.serviceRepository.delete(userId, id);

    if (!deleted) {
      return {
        success: false,
        message: "Serviço não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        message: "Serviço excluído com sucesso.",
      },
    };
  }
}
