import { ServiceDto } from "../dtos/service.dto";
import { ServiceRepository } from "../repositories/service.repository";

type GetServiceResponseDto = {
  service: ServiceDto;
};

type GetServiceServiceResult =
  | {
      success: true;
      data: GetServiceResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class GetServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(userId: number, id: number): Promise<GetServiceServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do serviço são obrigatórios.",
        statusCode: 400,
      };
    }

    const service = await this.serviceRepository.findById(userId, id);

    if (!service) {
      return {
        success: false,
        message: "Serviço não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        service,
      },
    };
  }
}
