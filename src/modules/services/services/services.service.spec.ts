import { CreateServiceService } from "./create-service.service";
import { ListServicesService } from "./list-services.service";
import { UpdateServiceService } from "./update-service.service";
import { InMemoryServiceRepository } from "../../../test/mocks/in-memory-service.repository";

test("CreateServiceService creates a service with trimmed fields", async () => {
  const repository = new InMemoryServiceRepository();
  const service = new CreateServiceService(repository);

  const result = await service.execute({
    name: "  Corte  ",
    category: "  Cabelo ",
    durationMinutes: 45,
    price: 59.9,
    description: "  Corte tradicional  ",
  });

  expect(result.success).toBe(true);

  if (!result.success) {
    return;
  }

  expect(result.data.service.name).toBe("Corte");
  expect(result.data.service.category).toBe("Cabelo");
  expect(result.data.service.description).toBe("Corte tradicional");
  expect(result.data.message).toBe("Servico cadastrado com sucesso.");
});

test("CreateServiceService rejects duration less than or equal to zero", async () => {
  const repository = new InMemoryServiceRepository();
  const service = new CreateServiceService(repository);

  const result = await service.execute({
    name: "Corte",
    category: "Cabelo",
    durationMinutes: 0,
    price: 59.9,
    description: "Corte tradicional",
  });

  expect(result).toEqual({
    success: false,
    message: "Nome, categoria, duracao, preco e descricao sao obrigatorios.",
    statusCode: 400,
  });
});

test("UpdateServiceService returns 404 when service does not exist", async () => {
  const repository = new InMemoryServiceRepository();
  const service = new UpdateServiceService(repository);

  const result = await service.execute(77, {
    name: "Barba",
    category: "Barbearia",
    durationMinutes: 30,
    price: 35,
    description: "Barba completa",
  });

  expect(result).toEqual({
    success: false,
    message: "Servico nao encontrado.",
    statusCode: 404,
  });
});

test("ListServicesService paginates and filters services", async () => {
  const repository = new InMemoryServiceRepository({
    services: [
      { id: 1, name: "Corte", category: "Cabelo", durationMinutes: 45, price: 50, description: "Classico" },
      { id: 2, name: "Barba", category: "Barbearia", durationMinutes: 30, price: 35, description: "Completa" },
      { id: 3, name: "Escova", category: "Estilo", durationMinutes: 40, price: 45, description: "Modeladora" },
    ],
  });
  const service = new ListServicesService(repository);

  const result = await service.execute({
    page: 1,
    limit: 2,
    search: "barba",
  });

  expect(result.success).toBe(true);
  expect(result.data.totalItems).toBe(1);
  expect(result.data.totalPages).toBe(1);
  expect(result.data.data[0]?.name).toBe("Barba");
});
