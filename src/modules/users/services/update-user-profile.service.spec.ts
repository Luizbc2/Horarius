import { UpdateUserProfileService } from "./update-user-profile.service";
import { comparePassword, hashPassword } from "../../auth/utils/password.util";
import { InMemoryUserRepository } from "../../../test/mocks/in-memory-user.repository";

test("UpdateUserProfileService only allows editing the authenticated user", async () => {
  const repository = new InMemoryUserRepository({
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
  const service = new UpdateUserProfileService(repository);

  const result = await service.execute({
    authenticatedUserId: 2,
    userId: 1,
    name: "Luiz",
    email: "luiz@horarius.com",
    cpf: "52998224725",
    password: "Senha123",
  });

  expect(result).toEqual({
    success: false,
    message: "Voce so pode editar o proprio perfil.",
    statusCode: 403,
  });
});

test("UpdateUserProfileService blocks email changes", async () => {
  const repository = new InMemoryUserRepository({
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
  const service = new UpdateUserProfileService(repository);

  const result = await service.execute({
    authenticatedUserId: 1,
    userId: 1,
    name: "Luiz",
    email: "outro@horarius.com",
    cpf: "52998224725",
    password: "Senha123",
  });

  expect(result).toEqual({
    success: false,
    message: "O e-mail nao pode ser alterado.",
    statusCode: 400,
  });
});

test("UpdateUserProfileService updates the profile with hashed password", async () => {
  const repository = new InMemoryUserRepository({
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
  const service = new UpdateUserProfileService(repository);

  const result = await service.execute({
    authenticatedUserId: 1,
    userId: 1,
    name: "Luiz Otavio",
    email: "luiz@horarius.com",
    cpf: "11144477735",
    password: "NovaSenha123",
  });

  expect(result.success).toBe(true);
  expect(repository.lastUpdatedInput?.password).not.toBe("NovaSenha123");
  await expect(comparePassword("NovaSenha123", repository.lastUpdatedInput?.password ?? "")).resolves.toBe(true);

  if (!result.success) {
    return;
  }

  expect(result.data.message).toBe("Perfil atualizado com sucesso.");
  expect(result.data.user.name).toBe("Luiz Otavio");
  expect(result.data.user.cpf).toBe("11144477735");
});
