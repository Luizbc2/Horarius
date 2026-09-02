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
import { ClientRepository } from "../../clients/repositories/client.repository";
import { ProfessionalRepository } from "../../professionals/repositories/professional.repository";
import { ServiceRepository } from "../../services/repositories/service.repository";
import { AppointmentConflictError } from "../errors/appointment-conflict.error";
import { AppointmentAccessError } from "../errors/appointment-access.error";
import { SchedulingPolicyService } from "./scheduling-policy.service";

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
const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pendente: ["pendente", "confirmado", "cancelado"],
  confirmado: ["confirmado", "pendente", "cancelado"],
  cancelado: ["cancelado", "pendente"],
};

export class UpdateAppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly clientRepository: ClientRepository,
    private readonly professionalRepository: ProfessionalRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly schedulingPolicy = new SchedulingPolicyService(),
  ) {}

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

    if (!Number.isInteger(input.version) || input.version < 0) {
      return {
        success: false,
        message: "A versão atual do agendamento é obrigatória. Atualize a tela e tente novamente.",
        statusCode: 409,
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

    const [currentAppointment, client, professional, service] = await Promise.all([
      this.appointmentRepository.findById(userId, id),
      this.clientRepository.findById(userId, clientId),
      this.professionalRepository.findById(userId, professionalId),
      this.serviceRepository.findById(userId, serviceId),
    ]);

    if (!currentAppointment) {
      return { success: false, message: "Agendamento não encontrado.", statusCode: 404 };
    }

    if (!STATUS_TRANSITIONS[currentAppointment.status].includes(status)) {
      return { success: false, message: "A mudança de status solicitada não é permitida.", statusCode: 409 };
    }

    if (!client || !professional || !service) {
      return {
        success: false,
        message: "Cliente, profissional ou serviço não encontrado para a organização ativa.",
        statusCode: 400,
      };
    }

    const startsAt = new Date(scheduledAt);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    if (status !== "cancelado") {
      const policy = await this.schedulingPolicy.validate(professionalId, serviceId, startsAt, endsAt);
      if (!policy.valid) return { success: false, message: policy.message, statusCode: 409 };
    }

    try {
      const appointment = await this.appointmentRepository.update(userId, id, {
        clientId,
        professionalId,
        serviceId,
        scheduledAt,
        endsAt: endsAt.toISOString(),
        durationMinutes: service.durationMinutes,
        clientNameSnapshot: client.name,
        professionalNameSnapshot: professional.name,
        serviceNameSnapshot: service.name,
        priceSnapshot: service.price,
        status,
        notes,
        version: input.version,
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
      if (error instanceof AppointmentAccessError) {
        return { success: false, message: error.message, statusCode: 403 };
      }

      if (error instanceof AppointmentConflictError) {
        return { success: false, message: error.message, statusCode: 409 };
      }

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
