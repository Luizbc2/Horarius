import type { AppointmentDto, SwapAppointmentsRequestDto } from "../dtos/appointment.dto";
import { AppointmentConflictError } from "../errors/appointment-conflict.error";
import { AppointmentAccessError } from "../errors/appointment-access.error";
import type { AppointmentRepository } from "../repositories/appointment.repository";
import { SchedulingPolicyService } from "./scheduling-policy.service";

type SwapAppointmentsResult =
  | { success: true; data: { appointments: AppointmentDto[]; message: string } }
  | { success: false; message: string; statusCode: number };

export class SwapAppointmentsService {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly schedulingPolicy = new SchedulingPolicyService(),
  ) {}

  public async execute(userId: number, input: SwapAppointmentsRequestDto): Promise<SwapAppointmentsResult> {
    if (
      !Number.isInteger(input.firstId) || input.firstId <= 0 ||
      !Number.isInteger(input.secondId) || input.secondId <= 0 ||
      input.firstId === input.secondId ||
      !Number.isInteger(input.firstVersion) || input.firstVersion < 0 ||
      !Number.isInteger(input.secondVersion) || input.secondVersion < 0
    ) {
      return { success: false, message: "Informe dois agendamentos válidos para realizar a troca.", statusCode: 400 };
    }

    const [first, second] = await Promise.all([
      this.appointments.findById(userId, input.firstId),
      this.appointments.findById(userId, input.secondId),
    ]);
    if (!first || !second) {
      return { success: false, message: "Agendamento não encontrado.", statusCode: 404 };
    }

    const validations = await Promise.all([
      this.validateDestination(first, second),
      this.validateDestination(second, first),
    ]);
    const invalid = validations.find((validation) => !validation.valid);
    if (invalid && !invalid.valid) {
      return { success: false, message: invalid.message, statusCode: 409 };
    }

    try {
      const appointments = await this.appointments.swap(userId, input);
      if (!appointments) return { success: false, message: "Agendamento não encontrado.", statusCode: 404 };
      return { success: true, data: { appointments, message: "Agendamentos trocados com sucesso." } };
    } catch (error) {
      if (error instanceof AppointmentAccessError) {
        return { success: false, message: error.message, statusCode: 403 };
      }
      if (error instanceof AppointmentConflictError) {
        return { success: false, message: error.message, statusCode: 409 };
      }
      throw error;
    }
  }

  private validateDestination(appointment: AppointmentDto, destination: AppointmentDto) {
    if (appointment.status === "cancelado") return Promise.resolve({ valid: true } as const);
    const startsAt = new Date(destination.scheduledAt);
    const endsAt = new Date(startsAt.getTime() + appointment.durationMinutes * 60_000);
    return this.schedulingPolicy.validate(destination.professionalId, appointment.serviceId, startsAt, endsAt);
  }
}
