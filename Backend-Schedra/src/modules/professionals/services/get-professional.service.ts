import { ProfessionalDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type GetProfessionalResponseDto = {
  professional: ProfessionalDto;
};

type GetProfessionalServiceResult =
  | {
      success: true;
      data: GetProfessionalResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class GetProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(userId: number, id: number): Promise<GetProfessionalServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do profissional são obrigatórios.",
        statusCode: 400,
      };
    }

    const professional = await this.professionalRepository.findById(userId, id);

    if (!professional) {
      return {
        success: false,
        message: "Profissional não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        professional,
      },
    };
  }
}
