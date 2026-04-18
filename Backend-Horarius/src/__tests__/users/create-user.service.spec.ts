import { CreateUserService } from "../../modules/users/services/create-user.service";
import { isPasswordHashed } from "../../modules/auth/utils/password.util";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("CreateUserService", () => {
  it("exige nome, e-mail, CPF e senha", async () => {
    const service = new CreateUserService(new InMemoryUserRepository());

    const result = await service.execute({
      name: "",
      email: "",
      cpf: "",
      password: "",
    });

    expect(result).toEqual({
      success: false,
      message: "Nome, e-mail, CPF e senha são obrigatórios.",
      statusCode: 400,
    });
  });

  it("valida CPF antes de cadastrar", async () => {
    const service = new CreateUserService(new InMemoryUserRepository());

    const result = await service.execute({
      name: "Maria",
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

  it("valida o nivel minimo da senha", async () => {
    const service = new CreateUserService(new InMemoryUserRepository());

    const result = await service.execute({
      name: "Maria",
      email: "maria@horarius.com",
      cpf: "52998224725",
      password: "senhafraca",
    });

    expect(result).toEqual({
      success: false,
      message: "A senha deve incluir pelo menos uma letra maiuscula.",
      statusCode: 400,
    });
  });

  it("não deixa cadastrar dois usuários com o mesmo e-mail", async () => {
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
    const service = new CreateUserService(repository);

    const result = await service.execute({
      name: "Maria 2",
      email: "MARIA@horarius.com",
      cpf: "11144477735",
      password: "Senha123",
    });

    expect(result).toEqual({
      success: false,
      message: "E-mail já está em uso.",
      statusCode: 409,
    });
  });

  it("cadastra usuario com e-mail e CPF normalizados e senha criptografada", async () => {
    const repository = new InMemoryUserRepository();
    const service = new CreateUserService(repository);

    const result = await service.execute({
      name: "  Maria da Silva  ",
      email: "  MARIA@horarius.com  ",
      cpf: "529.982.247-25",
      password: "Senha123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.user).toEqual({
      id: 1,
      name: "Maria da Silva",
      email: "maria@horarius.com",
      cpf: "52998224725",
    });
    expect(repository.lastCreatedInput).not.toBeNull();
    expect(repository.lastCreatedInput?.password).not.toBe("Senha123");
    expect(isPasswordHashed(repository.lastCreatedInput?.password ?? "")).toBe(true);
  });
});

