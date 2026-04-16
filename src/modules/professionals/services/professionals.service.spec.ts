import test from "node:test";
import assert from "node:assert/strict";

import { CreateProfessionalService } from "./create-professional.service";
import { ListProfessionalWorkDaysService } from "./list-professional-work-days.service";
import { ListProfessionalsService } from "./list-professionals.service";
import { UpdateProfessionalService } from "./update-professional.service";
import { UpdateProfessionalWorkDaysService } from "./update-professional-work-days.service";
import { InMemoryProfessionalRepository } from "../../../test/mocks/in-memory-professional.repository";

test("CreateProfessionalService creates a professional with normalized email and status", async () => {
  const repository = new InMemoryProfessionalRepository();
  const service = new CreateProfessionalService(repository);

  const result = await service.execute({
    name: "  Joao Silva  ",
    email: "  JOAO@EMAIL.COM ",
    phone: "11999999999",
    specialty: "  Corte masculino ",
    status: " ATIVO ",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.professional.name, "Joao Silva");
  assert.equal(result.data.professional.email, "joao@email.com");
  assert.equal(result.data.professional.status, "ativo");
});

test("UpdateProfessionalService rejects invalid email", async () => {
  const repository = new InMemoryProfessionalRepository({
    professionals: [
      {
        id: 1,
        name: "Joao",
        email: "joao@email.com",
        phone: "11",
        specialty: "Corte",
        status: "ativo",
      },
    ],
  });
  const service = new UpdateProfessionalService(repository);

  const result = await service.execute(1, {
    name: "Joao",
    email: "email-invalido",
    phone: "11",
    specialty: "Corte",
    status: "ativo",
  });

  assert.deepEqual(result, {
    success: false,
    message: "Formato de email invalido.",
    statusCode: 400,
  });
});

test("ListProfessionalsService paginates and filters professionals", async () => {
  const repository = new InMemoryProfessionalRepository({
    professionals: [
      { id: 1, name: "Ana", email: "ana@email.com", phone: "11", specialty: "Escova", status: "ativo" },
      { id: 2, name: "Bruno", email: "bruno@email.com", phone: "22", specialty: "Barba", status: "ativo" },
      { id: 3, name: "Carla", email: "carla@email.com", phone: "33", specialty: "Coloracao", status: "inativo" },
    ],
  });
  const service = new ListProfessionalsService(repository);

  const result = await service.execute({
    page: 1,
    limit: 2,
    search: "barba",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.totalItems, 1);
  assert.equal(result.data.data[0]?.name, "Bruno");
});

test("ListProfessionalWorkDaysService returns 404 for unknown professional", async () => {
  const repository = new InMemoryProfessionalRepository();
  const service = new ListProfessionalWorkDaysService(repository);

  const result = await service.execute(999);

  assert.deepEqual(result, {
    success: false,
    message: "Profissional nao encontrado.",
    statusCode: 404,
  });
});

test("UpdateProfessionalWorkDaysService updates and normalizes work days", async () => {
  const repository = new InMemoryProfessionalRepository({
    professionals: [
      {
        id: 1,
        name: "Joao",
        email: "joao@email.com",
        phone: "11",
        specialty: "Corte",
        status: "ativo",
      },
    ],
  });
  const service = new UpdateProfessionalWorkDaysService(repository);

  const result = await service.execute(1, {
    workDays: [
      {
        dayOfWeek: " Segunda ",
        enabled: true,
        startTime: "09:00",
        endTime: "18:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      },
    ],
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.workDays[0]?.dayOfWeek, "segunda");
  assert.equal(result.data.workDays[0]?.breakStart, "12:00");
  assert.equal(result.data.message, "Horarios do profissional atualizados com sucesso.");
});

test("UpdateProfessionalWorkDaysService blocks duplicated week days", async () => {
  const repository = new InMemoryProfessionalRepository({
    professionals: [
      {
        id: 1,
        name: "Joao",
        email: "joao@email.com",
        phone: "11",
        specialty: "Corte",
        status: "ativo",
      },
    ],
  });
  const service = new UpdateProfessionalWorkDaysService(repository);

  const result = await service.execute(1, {
    workDays: [
      {
        dayOfWeek: "segunda",
        enabled: true,
        startTime: "09:00",
        endTime: "18:00",
      },
      {
        dayOfWeek: "segunda",
        enabled: true,
        startTime: "10:00",
        endTime: "19:00",
      },
    ],
  });

  assert.deepEqual(result, {
    success: false,
    message: "Nao e permitido repetir o mesmo dia da semana.",
    statusCode: 400,
  });
});
