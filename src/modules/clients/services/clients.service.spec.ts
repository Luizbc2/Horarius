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

  expect(result.success).toBe(true);

  if (!result.success) {
    return;
  }

  expect(result.data.client.name).toBe("Maria Clara");
  expect(result.data.client.email).toBe("maria@email.com");
  expect(result.data.message).toBe("Cliente cadastrado com sucesso.");
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

  expect(result).toEqual({
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

  expect(result).toEqual({
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

  expect(result.success).toBe(true);
  expect(result.data.totalItems).toBe(1);
  expect(result.data.totalPages).toBe(1);
  expect(result.data.data[0]?.name).toBe("Carla");
});
