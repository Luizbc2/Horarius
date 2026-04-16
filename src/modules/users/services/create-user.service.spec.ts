import { CreateUserService } from "./create-user.service";
import { comparePassword } from "../../auth/utils/password.util";
import { InMemoryUserRepository } from "../../../test/mocks/in-memory-user.repository";

test("CreateUserService creates a user with hashed password", async () => {
  const repository = new InMemoryUserRepository();
  const service = new CreateUserService(repository);

  const result = await service.execute({
    name: "  Luiz Otavio  ",
    email: "  LUIZ@HORARIUS.COM ",
    cpf: "529.982.247-25",
    password: "Senha123",
  });

  expect(result.success).toBe(true);
  expect(repository.lastCreatedInput?.password).not.toBe("Senha123");
  await expect(comparePassword("Senha123", repository.lastCreatedInput?.password ?? "")).resolves.toBe(true);

  if (!result.success) {
    return;
  }

  expect(result.data.user.name).toBe("Luiz Otavio");
  expect(result.data.user.email).toBe("luiz@horarius.com");
  expect(result.data.user.cpf).toBe("52998224725");
});

test("CreateUserService rejects duplicated email", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 1,
        name: "Maria",
        email: "maria@horarius.com",
        cpf: "52998224725",
        password: "scrypt$hash",
      },
    ],
  });
  const service = new CreateUserService(repository);

  const result = await service.execute({
    name: "Joao",
    email: "maria@horarius.com",
    cpf: "11144477735",
    password: "Senha123",
  });

  expect(result).toEqual({
    success: false,
    message: "E-mail ja esta em uso.",
    statusCode: 409,
  });
});

test("CreateUserService rejects weak password", async () => {
  const repository = new InMemoryUserRepository();
  const service = new CreateUserService(repository);

  const result = await service.execute({
    name: "Joao",
    email: "joao@horarius.com",
    cpf: "11144477735",
    password: "fraca",
  });

  expect(result).toEqual({
    success: false,
    message: "A senha deve ter pelo menos 8 caracteres.",
    statusCode: 400,
  });
});
