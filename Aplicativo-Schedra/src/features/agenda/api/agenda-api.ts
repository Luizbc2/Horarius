import { apiRequest } from "../../../shared/api/client";

export type Appointment = { id: number; clientId: number; clientName: string; professionalId: number; professionalName: string; serviceId: number; serviceName: string; scheduledAt: string; status: "confirmado" | "pendente" | "cancelado"; notes: string };
export type PersonalEvent = { id: number; title: string; startsAt: string; endsAt: string; location: string; notes: string; reminderMinutes: number; completed: boolean };
export type EntityOption = { id: number; name: string };
type Page<T> = { data: T[] };
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const agendaApi = {
  listAppointments: (token: string) => apiRequest<Page<Appointment>>("/appointments?limit=50", { headers: auth(token) }),
  saveAppointment: (token: string, input: Omit<Appointment, "id" | "clientName" | "professionalName" | "serviceName">, id?: number) => apiRequest<{ appointment: Appointment }>(id ? `/appointments/${id}` : "/appointments", { method: id ? "PUT" : "POST", headers: auth(token), body: JSON.stringify(input) }),
  deleteAppointment: (token: string, id: number) => apiRequest<{ message: string }>(`/appointments/${id}`, { method: "DELETE", headers: auth(token) }),
  listPersonal: (token: string) => apiRequest<{ items: PersonalEvent[] }>("/personal-events", { headers: auth(token) }),
  savePersonal: (token: string, input: Omit<PersonalEvent, "id">, id?: number) => apiRequest<{ event: PersonalEvent }>(id ? `/personal-events/${id}` : "/personal-events", { method: id ? "PUT" : "POST", headers: auth(token), body: JSON.stringify(input) }),
  deletePersonal: (token: string, id: number) => apiRequest<{ message: string }>(`/personal-events/${id}`, { method: "DELETE", headers: auth(token) }),
  listOptions: async (token: string) => {
    const [clients, professionals, services] = await Promise.all(["/clients?limit=100", "/professionals?limit=100", "/services?limit=100"].map((path) => apiRequest<Page<EntityOption>>(path, { headers: auth(token) })));
    return { clients: clients.data, professionals: professionals.data, services: services.data };
  },
};
