import request from "supertest";

import { createTestApp } from "./create-test-app";
import { hashPassword } from "../../modules/auth/utils/password.util";
import { InMemoryAppointmentRepository } from "../mocks/in-memory-appointment.repository";
import { InMemoryClientRepository } from "../mocks/in-memory-client.repository";
import { InMemoryProfessionalRepository } from "../mocks/in-memory-professional.repository";
import { InMemoryServiceRepository } from "../mocks/in-memory-service.repository";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

async function createAuthenticatedContext() {
  const userRepository = new InMemoryUserRepository({
    users: [
      {
        id: 1,
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: await hashPassword("Senha123"),
      },
    ],
  });
  const app = createTestApp({
    userRepository,
    clientRepository: new InMemoryClientRepository(),
    serviceRepository: new InMemoryServiceRepository(),
    professionalRepository: new InMemoryProfessionalRepository(),
    appointmentRepository: new InMemoryAppointmentRepository(),
  });

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "luiz@horarius.com",
    password: "Senha123",
  });

  expect(loginResponse.status).toBe(200);

  return {
    app,
    token: loginResponse.body.token as string,
  };
}

describe("Protected CRUD integration", () => {
  test("executes the full clients CRUD flow over HTTP", async () => {
    const { app, token } = await createAuthenticatedContext();

    const createResponse = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Maria Clara",
        email: "maria@email.com",
        phone: "11999999999",
        cpf: "12345678900",
        notes: "cliente vip",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.client.name).toBe("Maria Clara");

    const clientId = createResponse.body.client.id as number;

    const listResponse = await request(app)
      .get("/api/clients?page=1&limit=10&search=Maria")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.totalItems).toBe(1);

    const getResponse = await request(app)
      .get(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.client.email).toBe("maria@email.com");

    const updateResponse = await request(app)
      .put(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Maria Clara Souza",
        email: "maria@email.com",
        phone: "11888888888",
        cpf: "12345678900",
        notes: "cliente recorrente",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.client.name).toBe("Maria Clara Souza");

    const deleteResponse = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe("Cliente excluido com sucesso.");
  });

  test("executes service and professional CRUD flows over HTTP", async () => {
    const { app, token } = await createAuthenticatedContext();

    const createServiceResponse = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Corte",
        category: "Cabelo",
        durationMinutes: 45,
        price: 59.9,
        description: "Corte tradicional",
      });

    expect(createServiceResponse.status).toBe(201);
    const serviceId = createServiceResponse.body.service.id as number;

    const getServiceResponse = await request(app)
      .get(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getServiceResponse.status).toBe(200);
    expect(getServiceResponse.body.service.name).toBe("Corte");

    const updateServiceResponse = await request(app)
      .put(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Corte premium",
        category: "Cabelo",
        durationMinutes: 50,
        price: 69.9,
        description: "Corte com finalizacao",
      });

    expect(updateServiceResponse.status).toBe(200);
    expect(updateServiceResponse.body.service.name).toBe("Corte premium");

    const createProfessionalResponse = await request(app)
      .post("/api/professionals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Joao Silva",
        email: "joao@email.com",
        phone: "11977777777",
        specialty: "Corte masculino",
        status: "ativo",
      });

    expect(createProfessionalResponse.status).toBe(201);
    const professionalId = createProfessionalResponse.body.professional.id as number;

    const workDaysResponse = await request(app)
      .put(`/api/professionals/${professionalId}/work-days`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        workDays: [
          {
            dayOfWeek: "segunda",
            enabled: true,
            startTime: "09:00",
            endTime: "18:00",
            breakStart: "12:00",
            breakEnd: "13:00",
          },
        ],
      });

    expect(workDaysResponse.status).toBe(200);
    expect(workDaysResponse.body.workDays).toHaveLength(1);

    const listWorkDaysResponse = await request(app)
      .get(`/api/professionals/${professionalId}/work-days`)
      .set("Authorization", `Bearer ${token}`);

    expect(listWorkDaysResponse.status).toBe(200);
    expect(listWorkDaysResponse.body.data[0].dayOfWeek).toBe("segunda");

    const updateProfessionalResponse = await request(app)
      .put(`/api/professionals/${professionalId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Joao Silva",
        email: "joao@email.com",
        phone: "11977777777",
        specialty: "Visagismo",
        status: "inativo",
      });

    expect(updateProfessionalResponse.status).toBe(200);
    expect(updateProfessionalResponse.body.professional.status).toBe("inativo");

    const deleteProfessionalResponse = await request(app)
      .delete(`/api/professionals/${professionalId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteProfessionalResponse.status).toBe(200);

    const deleteServiceResponse = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteServiceResponse.status).toBe(200);
    expect(deleteServiceResponse.body.message).toBe("Servico excluido com sucesso.");
  });

  test("executes appointment CRUD flow over HTTP", async () => {
    const { app, token } = await createAuthenticatedContext();

    const clientResponse = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ana",
        email: "ana@email.com",
        phone: "11911111111",
        cpf: "",
        notes: "",
      });
    const serviceResponse = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Barba",
        category: "Barbearia",
        durationMinutes: 30,
        price: 35,
        description: "Barba completa",
      });
    const professionalResponse = await request(app)
      .post("/api/professionals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ricardo",
        email: "ricardo@email.com",
        phone: "11922222222",
        specialty: "Barba",
        status: "ativo",
      });

    const appointmentResponse = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId: clientResponse.body.client.id,
        professionalId: professionalResponse.body.professional.id,
        serviceId: serviceResponse.body.service.id,
        scheduledAt: "2026-04-15T09:30:00.000Z",
        status: "pendente",
        notes: "primeiro atendimento",
      });

    expect(appointmentResponse.status).toBe(201);
    const appointmentId = appointmentResponse.body.appointment.id as number;

    const listResponse = await request(app)
      .get(
        `/api/appointments?date=2026-04-15&professionalId=${professionalResponse.body.professional.id}&status=pendente`,
      )
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.totalItems).toBe(1);

    const updateResponse = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientId: clientResponse.body.client.id,
        professionalId: professionalResponse.body.professional.id,
        serviceId: serviceResponse.body.service.id,
        scheduledAt: "2026-04-15T10:00:00.000Z",
        status: "confirmado",
        notes: "confirmado por telefone",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.appointment.status).toBe("confirmado");

    const deleteResponse = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe("Agendamento excluido com sucesso.");
  });
});
