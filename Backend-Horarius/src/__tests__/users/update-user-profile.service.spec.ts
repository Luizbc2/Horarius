import { UpdateUserProfileService } from "../../modules/users/services/update-user-profile.service";
import { comparePassword } from "../../modules/auth/utils/password.util";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("UpdateUserProfileService", () => {
  it("exige os campos obrigatórios para editar o perfil", async () => {
    const service = new UpdateUserProfileService(new InMemoryUserRepository());

    const result = await service.execute({
      authenticatedUserId: 0,
      userId: 0,
      name: "",
      email: "",
      cpf: "",
      password: "",
    });

    expect(result).toEqual({
      success: false,
      message: "Id do usuário autenticado, id do usuário, nome, CPF e senha são obrigatórios.",
      statusCode: 400,
    });
  });

  it("permite editar apenas o proprio usuario", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Maria",
          email: "maria@horarius.com",
          cpf: "52998224725",
          password: "hash",
        },
      ],
    });
    const service = new UpdateUserProfileService(repository);

    const result = await service.execute({
      authenticatedUserId: 2,
      userId: 1,
      name: "Maria Atualizada",
      email: "maria@horarius.com",
      cpf: "52998224725",
      password: "Senha123",
    });

    expect(result).toEqual({
      success: false,
      message: "Você só pode editar o próprio perfil.",
      statusCode: 403,
    });
  });

  it("não permite alterar o e-mail", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Maria",
          email: "maria@horarius.com",
          cpf: "52998224725",
          password: "hash",
        },
      ],
    });
    const service = new UpdateUserProfileService(repository);

    const result = await service.execute({
      authenticatedUserId: 1,
      userId: 1,
      name: "Maria Atualizada",
      email: "outro@horarius.com",
      cpf: "52998224725",
      password: "Senha123",
    });

    expect(result).toEqual({
      success: false,
      message: "O e-mail não pode ser alterado.",
      statusCode: 400,
    });
  });

  it("valida CPF ao editar o perfil", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Maria",
          email: "maria@horarius.com",
          cpf: "52998224725",
          password: "hash",
        },
      ],
    });
    const service = new UpdateUserProfileService(repository);

    const result = await service.execute({
      authenticatedUserId: 1,
      userId: 1,
      name: "Maria Atualizada",
      email: "maria@horarius.com",
      cpf: "12345678900",
      password: "Senha123",
    });

    expect(result).toEqual({
      success: false,
      message: "CPF inválido.",
      statusCode: 400,
    });
  });

  it("atualiza o proprio perfil sem trocar o e-mail e com senha criptografada", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Maria",
          email: "maria@horarius.com",
          cpf: "52998224725",
          password: "hash",
        },
      ],
    });
    const service = new UpdateUserProfileService(repository);

    const result = await service.execute({
      authenticatedUserId: 1,
      userId: 1,
      name: "  Maria Atualizada  ",
      email: "maria@horarius.com",
      cpf: "111.444.777-35",
      password: "Senha123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.user).toEqual({
      id: 1,
      name: "Maria Atualizada",
      email: "maria@horarius.com",
      cpf: "11144477735",
    });
    await expect(comparePassword("Senha123", repository.lastUpdatedInput?.password ?? "")).resolves.toBe(true);
  });
});

