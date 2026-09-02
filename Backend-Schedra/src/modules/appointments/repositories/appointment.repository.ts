import {
  AppointmentDto,
  ListAppointmentsQueryDto,
  PersistAppointmentRequestDto,
  SwapAppointmentsRequestDto,
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
  create(userId: number, input: PersistAppointmentRequestDto): Promise<AppointmentDto>;
  update(userId: number, id: number, input: PersistAppointmentRequestDto): Promise<AppointmentDto | null>;
  swap(userId: number, input: SwapAppointmentsRequestDto): Promise<AppointmentDto[] | null>;
  delete(userId: number, id: number): Promise<boolean>;
}
