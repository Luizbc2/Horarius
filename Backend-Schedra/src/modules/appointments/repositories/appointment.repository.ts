import {
  AppointmentDto,
  CreateAppointmentRequestDto,
  ListAppointmentsQueryDto,
  UpdateAppointmentRequestDto,
} from "../dtos/appointment.dto";

export type ListAppointmentsRepositoryResult = {
  appointments: AppointmentDto[];
  totalItems: number;
};

export interface AppointmentRepository {
  findById(userId: number, id: number): Promise<AppointmentDto | null>;
  list(
    userId: number,
    query: Required<Pick<ListAppointmentsQueryDto, "page" | "limit">> &
      Omit<ListAppointmentsQueryDto, "page" | "limit">,
  ): Promise<ListAppointmentsRepositoryResult>;
  create(userId: number, input: CreateAppointmentRequestDto): Promise<AppointmentDto>;
  update(userId: number, id: number, input: UpdateAppointmentRequestDto): Promise<AppointmentDto | null>;
  delete(userId: number, id: number): Promise<boolean>;
}
