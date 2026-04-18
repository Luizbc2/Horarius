import { ProfessionalRepository } from "../repositories/professional.repository";

type DeleteProfessionalResponseDto = {
  message: string;
};

type DeleteProfessionalServiceResult =
  | {
      success: true;
      data: DeleteProfessionalResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class DeleteProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(userId: number, id: number): Promise<DeleteProfessionalServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do profissional são obrigatórios.",
        statusCode: 400,
      };
    }

    const deleted = await this.professionalRepository.delete(userId, id);

    if (!deleted) {
      return {
        success: false,
        message: "Profissional não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        message: "Profissional excluido com sucesso.",
      },
    };
  }
}
