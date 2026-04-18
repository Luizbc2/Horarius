import { AppointmentRepository } from "../repositories/appointment.repository";

type DeleteAppointmentResponseDto = {
  message: string;
};

type DeleteAppointmentServiceResult =
  | {
      success: true;
      data: DeleteAppointmentResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class DeleteAppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  public async execute(userId: number, id: number): Promise<DeleteAppointmentServiceResult> {
    if (!userId || !id) {
      return {
        success: false,
        message: "Usuário autenticado e id do agendamento são obrigatórios.",
        statusCode: 400,
      };
    }

    const deleted = await this.appointmentRepository.delete(userId, id);

    if (!deleted) {
      return {
        success: false,
        message: "Agendamento não encontrado.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      data: {
        message: "Agendamento excluido com sucesso.",
      },
    };
  }
}
