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

export type UpdateAppointmentRequestDto = {
  clientId: number;
  professionalId: number;
  serviceId: number;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string;
};

export type ListAppointmentsQueryDto = {
  date?: string;
  limit?: number;
  page?: number;
  professionalId?: number;
  status?: AppointmentStatus;
};
