import { ProfessionalWorkDayDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type ListProfessionalWorkDaysResponseDto = {
  data: ProfessionalWorkDayDto[];
};

type ListProfessionalWorkDaysServiceResult =
  | {
      success: true;
      data: ListProfessionalWorkDaysResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class ListProfessionalWorkDaysService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(
    userId: number,
    professionalId: number,
  ): Promise<ListProfessionalWorkDaysServiceResult> {
    if (!userId || !professionalId) {
      return {
        success: false,
        message: "Usuário autenticado e id do profissional são obrigatórios.",
        statusCode: 400,
      };
    }

    const workDays = await this.professionalRepository.findWorkDaysByProfessionalId(userId, professionalId);

    if (workDays === null) {
      return {
        success: false,
        message: "Profissional não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        data: workDays,
      },
    };
  }
}
