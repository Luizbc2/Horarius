import {
  AppointmentDto,
  ListAppointmentsQueryDto,
} from "../dtos/appointment.dto";
import { AppointmentRepository } from "../repositories/appointment.repository";

type ListAppointmentsResponseDto = {
  data: AppointmentDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

type ListAppointmentsServiceResult = {
  success: true;
  data: ListAppointmentsResponseDto;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

export class ListAppointmentsService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  public async execute(
    userId: number,
    query: ListAppointmentsQueryDto,
  ): Promise<ListAppointmentsServiceResult> {
    const page = this.normalizePositiveNumber(query.page, DEFAULT_PAGE);
    const limit = this.normalizePositiveNumber(query.limit, DEFAULT_LIMIT);
    const professionalId = query.professionalId
      ? this.normalizePositiveNumber(query.professionalId, 0)
      : undefined;
    const date = query.date?.trim() || undefined;
    const status = query.status?.trim().toLowerCase() as
      | "confirmado"
      | "pendente"
      | "cancelado"
      | undefined;

    const { appointments, totalItems } = await this.appointmentRepository.list(userId, {
      page,
      limit,
      date,
      professionalId,
      status,
    });

    return {
      success: true,
      data: {
        data: appointments,
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  private normalizePositiveNumber(value: number | undefined, fallback: number): number {
    if (!value || Number.isNaN(value)) {
      return fallback;
    }

    return Math.max(1, Math.trunc(value));
  }
}
