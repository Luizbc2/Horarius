import { ForeignKeyConstraintError, ValidationError } from "sequelize";

import {
  AppointmentDto,
  AppointmentStatus,
  UpdateAppointmentRequestDto,
} from "../dtos/appointment.dto";
import {
  hasTextLengthBetween,
  INPUT_LIMITS,
  isPositiveInteger,
  normalizeMultiLineText,
} from "../../../shared/utils/input-validation.util";
import { AppointmentRepository } from "../repositories/appointment.repository";

type UpdateAppointmentResponseDto = {
  appointment: AppointmentDto;
  message: string;
};

type UpdateAppointmentServiceResult =
  | {
      success: true;
      data: UpdateAppointmentResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

const VALID_STATUSES: AppointmentStatus[] = ["confirmado", "pendente", "cancelado"];

export class UpdateAppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  public async execute(
    userId: number,
    id: number,
    input: UpdateAppointmentRequestDto,
  ): Promise<UpdateAppointmentServiceResult> {
    const clientId = Number(input.clientId);
    const professionalId = Number(input.professionalId);
    const serviceId = Number(input.serviceId);
    const scheduledAt = input.scheduledAt?.trim();
    const status = input.status?.trim().toLowerCase() as AppointmentStatus;
    const notes = normalizeMultiLineText(input.notes, INPUT_LIMITS.notes);

    if (!userId || !id || !clientId || !professionalId || !serviceId || !scheduledAt || !status) {
      return {
        success: false,
        message: "Usuário autenticado, id, cliente, profissional, serviço, horário e status são obrigatórios.",
        statusCode: 400,
      };
    }

    if (!this.isValidStatus(status)) {
      return {
        success: false,
        message: "Status do agendamento inválido.",
        statusCode: 400,
      };
    }

    if (Number.isNaN(Date.parse(scheduledAt))) {
      return {
        success: false,
        message: "Horário do agendamento inválido.",
        statusCode: 400,
      };
    }

    if (!isPositiveInteger(clientId) || !isPositiveInteger(professionalId) || !isPositiveInteger(serviceId)) {
      return {
        success: false,
        message: "Cliente, profissional e serviço precisam ser identificadores válidos.",
        statusCode: 400,
      };
    }

    if (input.notes && !hasTextLengthBetween(notes, 3, INPUT_LIMITS.notes)) {
      return {
        success: false,
        message: "As observações do agendamento devem ter entre 3 e 500 caracteres.",
        statusCode: 400,
      };
    }

    try {
      const appointment = await this.appointmentRepository.update(userId, id, {
        clientId,
        professionalId,
        serviceId,
        scheduledAt,
        status,
        notes,
      });

      if (!appointment) {
        return {
          success: false,
          message: "Agendamento não encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          appointment,
          message: "Agendamento atualizado com sucesso.",
        },
      };
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        return {
          success: false,
          message: "Cliente, profissional ou serviço informado não existe.",
          statusCode: 400,
        };
      }

      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados do agendamento são inválidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }

  private isValidStatus(status: AppointmentStatus): boolean {
    return VALID_STATUSES.includes(status);
  }
}
