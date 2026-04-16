import test from "node:test";
import assert from "node:assert/strict";

import { CreateClientService } from "./create-client.service";
import { ListClientsService } from "./list-clients.service";
import { UpdateClientService } from "./update-client.service";
import { InMemoryClientRepository } from "../../../test/mocks/in-memory-client.repository";

test("CreateClientService creates a client with normalized email", async () => {
  const repository = new InMemoryClientRepository();
  const service = new CreateClientService(repository);

  const result = await service.execute({
    name: "  Maria Clara  ",
    email: "  MARIA@EMAIL.COM ",
    phone: "11999999999",
    cpf: "12345678900",
    notes: "cliente vip",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.client.name, "Maria Clara");
  assert.equal(result.data.client.email, "maria@email.com");
  assert.equal(result.data.message, "Cliente cadastrado com sucesso.");
});

test("CreateClientService rejects invalid email", async () => {
  const repository = new InMemoryClientRepository();
  const service = new CreateClientService(repository);

  const result = await service.execute({
    name: "Maria Clara",
    email: "email-invalido",
    phone: "11999999999",
    cpf: "",
    notes: "",
  });

  assert.deepEqual(result, {
    success: false,
    message: "Formato de e-mail inválido.",
    statusCode: 400,
  });
});

test("UpdateClientService returns 404 when client does not exist", async () => {
  const repository = new InMemoryClientRepository();
  const service = new UpdateClientService(repository);

  const result = await service.execute(99, {
    name: "Maria Clara",
    email: "maria@email.com",
    phone: "11999999999",
    cpf: "",
    notes: "",
  });

  assert.deepEqual(result, {
    success: false,
    message: "Cliente nao encontrado.",
    statusCode: 404,
  });
});

test("ListClientsService paginates and filters clients", async () => {
  const repository = new InMemoryClientRepository({
    clients: [
      { id: 1, name: "Ana", email: "ana@email.com", phone: "11", cpf: "", notes: "" },
      { id: 2, name: "Bruno", email: "bruno@email.com", phone: "22", cpf: "", notes: "" },
      { id: 3, name: "Carla", email: "carla@email.com", phone: "33", cpf: "", notes: "premium" },
    ],
  });
  const service = new ListClientsService(repository);

  const result = await service.execute({
    page: 1,
    limit: 2,
    search: "carla",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.totalItems, 1);
  assert.equal(result.data.totalPages, 1);
  assert.equal(result.data.data[0]?.name, "Carla");
});
