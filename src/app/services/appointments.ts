import { apiRequest } from "../lib/api";
import type { PaginatedResponse } from "./entity-service";

export type AppointmentStatus = "confirmado" | "pendente" | "cancelado";

export type AppointmentApiItem = {
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

export type ListAppointmentsQuery = {
  date?: string;
  limit?: number;
  page?: number;
  professionalId?: number;
  status?: AppointmentStatus;
};

export type CreateAppointmentRequest = {
  clientId: number;
  professionalId: number;
  serviceId: number;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string;
};

export type UpdateAppointmentRequest = CreateAppointmentRequest;

export type CreateAppointmentResponse = {
  appointment: AppointmentApiItem;
  message: string;
};

export type UpdateAppointmentResponse = {
  appointment: AppointmentApiItem;
  message: string;
};

export type DeleteAppointmentResponse = {
  message: string;
};

export type AppointmentsListResponse = PaginatedResponse<AppointmentApiItem>;

function createAppointmentsQueryParams(query?: ListAppointmentsQuery) {
  if (!query) {
    return undefined;
  }

  const searchParams = new URLSearchParams();

  if (query.date) {
    searchParams.set("date", query.date);
  }

  if (typeof query.limit === "number") {
    searchParams.set("limit", String(query.limit));
  }

  if (typeof query.page === "number") {
    searchParams.set("page", String(query.page));
  }

  if (typeof query.professionalId === "number") {
    searchParams.set("professionalId", String(query.professionalId));
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  return searchParams;
}

export const createAppointmentsService = (token: string) => ({
  list: (query?: ListAppointmentsQuery) =>
    apiRequest<AppointmentsListResponse>("/appointments", {
      method: "GET",
      queryParams: createAppointmentsQueryParams(query),
      token,
    }),

  create: (body: CreateAppointmentRequest) =>
    apiRequest<CreateAppointmentResponse>("/appointments", {
      method: "POST",
      body,
      token,
    }),

  update: (id: number, body: UpdateAppointmentRequest) =>
    apiRequest<UpdateAppointmentResponse>(`/appointments/${id}`, {
      method: "PUT",
      body,
      token,
    }),

  remove: (id: number) =>
    apiRequest<DeleteAppointmentResponse>(`/appointments/${id}`, {
      method: "DELETE",
      token,
    }),
});
