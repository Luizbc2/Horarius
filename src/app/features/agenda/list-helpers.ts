import type { AppointmentApiItem, AppointmentStatus } from "../../services/appointments";

export type AgendaListItem = {
  id: number;
  clientId: number;
  date: string;
  notes: string;
  professionalId: number;
  time: string;
  client: string;
  scheduledAt: string;
  serviceId: number;
  professional: string;
  service: string;
  status: AppointmentStatus;
};

export type EditAppointmentDraft = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  time: string;
  status: AppointmentStatus;
};

export const ITEMS_PER_PAGE = 10;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function getTodayDateValue() {
  const currentDate = new Date();

  return `${currentDate.getFullYear()}-${padDatePart(currentDate.getMonth() + 1)}-${padDatePart(currentDate.getDate())}`;
}

export function createEditAppointmentDraft(
  appointment?: Pick<AgendaListItem, "clientId" | "professionalId" | "serviceId" | "time" | "status">,
): EditAppointmentDraft {
  if (!appointment) {
    return {
      clientId: "",
      professionalId: "",
      serviceId: "",
      time: "09:00",
      status: "confirmado",
    };
  }

  return {
    clientId: String(appointment.clientId),
    professionalId: String(appointment.professionalId),
    serviceId: String(appointment.serviceId),
    time: appointment.time,
    status: appointment.status,
  };
}

export function formatAppointmentForList(appointment: AppointmentApiItem): AgendaListItem {
  const scheduledDate = new Date(appointment.scheduledAt);

  return {
    id: appointment.id,
    clientId: appointment.clientId,
    date: scheduledDate.toLocaleDateString("pt-BR"),
    notes: appointment.notes,
    professionalId: appointment.professionalId,
    time: scheduledDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    client: appointment.clientName,
    scheduledAt: appointment.scheduledAt,
    serviceId: appointment.serviceId,
    professional: appointment.professionalName,
    service: appointment.serviceName,
    status: appointment.status,
  };
}

export function buildScheduledAt(baseDate: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const nextDate = new Date(baseDate);

  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate.toISOString();
}

export function getStatusColor(status: AppointmentStatus) {
  switch (status) {
    case "confirmado":
      return "bg-green-100 text-green-800";
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "cancelado":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "confirmado":
      return "Confirmado";
    case "pendente":
      return "Pendente";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
}

export function filterAppointments(appointments: AgendaListItem[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return appointments;
  }

  return appointments.filter((appointment) =>
    `${appointment.client} ${appointment.service} ${appointment.professional}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
}
