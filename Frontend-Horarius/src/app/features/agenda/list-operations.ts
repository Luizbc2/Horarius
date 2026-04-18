import type { UpdateAppointmentRequest, AppointmentStatus } from "../../services/appointments";
import {
  buildScheduledAt,
  createEditAppointmentDraft,
  formatAppointmentForList,
  type AgendaListItem,
  type EditAppointmentDraft,
} from "./list-helpers";

export function createAgendaEditState(appointment: AgendaListItem) {
  return {
    appointment,
    draft: createEditAppointmentDraft(appointment),
  };
}

export function validateAgendaEditDraft(draft: EditAppointmentDraft) {
  const clientId = Number(draft.clientId);
  const professionalId = Number(draft.professionalId);
  const serviceId = Number(draft.serviceId);

  if (!clientId || !professionalId || !serviceId) {
    return "Selecione cliente, profissional e serviço.";
  }

  return null;
}

export function buildAgendaEditPayload(
  appointment: AgendaListItem,
  draft: EditAppointmentDraft,
): UpdateAppointmentRequest {
  return {
    clientId: Number(draft.clientId),
    professionalId: Number(draft.professionalId),
    serviceId: Number(draft.serviceId),
    scheduledAt: buildScheduledAt(appointment.scheduledAt, draft.time),
    status: draft.status,
    notes: appointment.notes,
  };
}

export function buildAgendaStatusPayload(
  appointment: AgendaListItem,
  status: AppointmentStatus,
): UpdateAppointmentRequest {
  return {
    clientId: appointment.clientId,
    professionalId: appointment.professionalId,
    serviceId: appointment.serviceId,
    scheduledAt: appointment.scheduledAt,
    status,
    notes: appointment.notes,
  };
}

export function replaceAgendaAppointment(
  appointments: AgendaListItem[],
  appointmentId: number,
  updatedAppointment: AgendaListItem,
) {
  return appointments.map((currentAppointment) =>
    currentAppointment.id === appointmentId ? updatedAppointment : currentAppointment,
  );
}

export function replaceAgendaAppointmentStatus(
  appointments: AgendaListItem[],
  appointmentId: number,
  status: AppointmentStatus,
) {
  return appointments.map((currentAppointment) =>
    currentAppointment.id === appointmentId
      ? {
          ...currentAppointment,
          status,
        }
      : currentAppointment,
  );
}

export function removeAgendaAppointment(appointments: AgendaListItem[], appointmentId: number) {
  return appointments.filter((currentAppointment) => currentAppointment.id !== appointmentId);
}

export function mapAgendaAppointmentResponse(appointment: Parameters<typeof formatAppointmentForList>[0]) {
  return formatAppointmentForList(appointment);
}
