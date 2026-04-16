import { CreateAppointmentService } from "./create-appointment.service";
import { DeleteAppointmentService } from "./delete-appointment.service";
import { ListAppointmentsService } from "./list-appointments.service";
import { UpdateAppointmentService } from "./update-appointment.service";
import { InMemoryAppointmentRepository } from "../../../test/mocks/in-memory-appointment.repository";

test("CreateAppointmentService creates an appointment with normalized status and notes", async () => {
  const repository = new InMemoryAppointmentRepository();
  const service = new CreateAppointmentService(repository);
  const status = "confirmado" as const;

  const result = await service.execute({
    clientId: 1,
    professionalId: 2,
    serviceId: 3,
    scheduledAt: "2026-04-15T09:30:00.000Z",
    status,
    notes: "  encaixe da manha  ",
  });

  expect(result.success).toBe(true);

  if (!result.success) {
    return;
  }

  expect(result.data.appointment.status).toBe("confirmado");
  expect(result.data.appointment.notes).toBe("encaixe da manha");
  expect(result.data.message).toBe("Agendamento cadastrado com sucesso.");
});

test("CreateAppointmentService rejects invalid scheduledAt", async () => {
  const repository = new InMemoryAppointmentRepository();
  const service = new CreateAppointmentService(repository);

  const result = await service.execute({
    clientId: 1,
    professionalId: 2,
    serviceId: 3,
    scheduledAt: "horario-invalido",
    status: "confirmado",
    notes: "",
  });

  expect(result).toEqual({
    success: false,
    message: "Horario do agendamento invalido.",
    statusCode: 400,
  });
});

test("ListAppointmentsService filters by date, professional and status", async () => {
  const repository = new InMemoryAppointmentRepository({
    appointments: [
      {
        id: 1,
        clientId: 1,
        clientName: "Ana",
        professionalId: 5,
        professionalName: "Ricardo",
        serviceId: 10,
        serviceName: "Corte",
        scheduledAt: "2026-04-15T09:00:00.000Z",
        status: "confirmado",
        notes: "",
      },
      {
        id: 2,
        clientId: 2,
        clientName: "Bruno",
        professionalId: 5,
        professionalName: "Ricardo",
        serviceId: 11,
        serviceName: "Barba",
        scheduledAt: "2026-04-15T10:00:00.000Z",
        status: "pendente",
        notes: "",
      },
      {
        id: 3,
        clientId: 3,
        clientName: "Carla",
        professionalId: 6,
        professionalName: "Joao",
        serviceId: 12,
        serviceName: "Escova",
        scheduledAt: "2026-04-16T11:00:00.000Z",
        status: "confirmado",
        notes: "",
      },
    ],
  });
  const service = new ListAppointmentsService(repository);

  const result = await service.execute({
    page: 1,
    limit: 10,
    date: "2026-04-15",
    professionalId: 5,
    status: "confirmado",
  });

  expect(result.success).toBe(true);
  expect(result.data.totalItems).toBe(1);
  expect(result.data.data[0]?.clientName).toBe("Ana");
});

test("UpdateAppointmentService returns 404 when appointment does not exist", async () => {
  const repository = new InMemoryAppointmentRepository();
  const service = new UpdateAppointmentService(repository);

  const result = await service.execute(99, {
    clientId: 1,
    professionalId: 2,
    serviceId: 3,
    scheduledAt: "2026-04-15T09:30:00.000Z",
    status: "confirmado",
    notes: "",
  });

  expect(result).toEqual({
    success: false,
    message: "Agendamento nao encontrado.",
    statusCode: 404,
  });
});

test("DeleteAppointmentService removes an existing appointment", async () => {
  const repository = new InMemoryAppointmentRepository({
    appointments: [
      {
        id: 1,
        clientId: 1,
        clientName: "Ana",
        professionalId: 5,
        professionalName: "Ricardo",
        serviceId: 10,
        serviceName: "Corte",
        scheduledAt: "2026-04-15T09:00:00.000Z",
        status: "confirmado",
        notes: "",
      },
    ],
  });
  const service = new DeleteAppointmentService(repository);

  const result = await service.execute(1);
  const appointment = await repository.findById(1);

  expect(result.success).toBe(true);
  expect(appointment).toBeNull();

  if (!result.success) {
    return;
  }

  expect(result.data.message).toBe("Agendamento excluido com sucesso.");
});

test("DeleteAppointmentService returns 404 for missing appointment", async () => {
  const repository = new InMemoryAppointmentRepository();
  const service = new DeleteAppointmentService(repository);

  const result = await service.execute(123);

  expect(result).toEqual({
    success: false,
    message: "Agendamento nao encontrado.",
    statusCode: 404,
  });
});
