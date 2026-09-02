export type AppointmentStatus = "confirmado" | "pendente" | "cancelado";

export type AppointmentDto = {
  id: number;
  clientId: number;
  clientName: string;
  professionalId: number;
  professionalName: string;
  serviceId: number;
  serviceName: string;
  scheduledAt: string;
  endsAt: string;
  durationMinutes: number;
  priceSnapshot: number;
  version: number;
  status: AppointmentStatus;
  notes: string;
};

export type CreateAppointmentRequestDto = {
  clientId: number;
  professionalId: number;
  serviceId: number;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string;
};

export type PersistAppointmentRequestDto = CreateAppointmentRequestDto & {
  endsAt: string;
  durationMinutes: number;
  clientNameSnapshot: string;
  professionalNameSnapshot: string;
  serviceNameSnapshot: string;
  priceSnapshot: number;
  version?: number;
};

export type UpdateAppointmentRequestDto = {
  clientId: number;
  professionalId: number;
  serviceId: number;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string;
  version: number;
};

export type SwapAppointmentsRequestDto = {
  firstId: number;
  firstVersion: number;
  secondId: number;
  secondVersion: number;
};

export type ListAppointmentsQueryDto = {
  date?: string;
  limit?: number;
  page?: number;
  professionalId?: number;
  status?: AppointmentStatus;
};
