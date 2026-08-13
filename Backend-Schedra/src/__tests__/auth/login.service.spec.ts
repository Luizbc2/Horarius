import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import { LoginService } from "../../modules/auth/services/login.service";
import { hashPassword } from "../../modules/auth/utils/password.util";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("LoginService", () => {
  it("exige e-mail e senha", async () => {
    const service = new LoginService(new InMemoryUserRepository());

    const result = await service.execute({
      email: "",
      password: "",
    });

    expect(result).toEqual({
      success: false,
      message: "E-mail e senha são obrigatórios.",
      statusCode: 400,
    });
  });

  it("valida o formato do e-mail antes do login", async () => {
    const service = new LoginService(new InMemoryUserRepository());

    const result = await service.execute({
      email: "email-invalido",
      password: "Senha123",
    });

    expect(result).toEqual({
      success: false,
      message: "Formato de e-mail inválido.",
      statusCode: 400,
    });
  });

  it("não autentica usuário inexistente", async () => {
    const service = new LoginService(new InMemoryUserRepository());

    const result = await service.execute({
      email: "naoexiste@schedra.com",
      password: "Senha123",
    });

    expect(result).toEqual({
      success: false,
      message: "E-mail ou senha inválidos.",
      statusCode: 401,
    });
  });

  it("não autentica quando a senha estiver errada", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Admin",
          email: "admin@schedra.com",
          cpf: "52998224725",
          password: await hashPassword("Senha123"),
        },
      ],
    });
    const service = new LoginService(repository);

    const result = await service.execute({
      email: "admin@schedra.com",
      password: "Senha999",
    });

    expect(result).toEqual({
      success: false,
      message: "E-mail ou senha inválidos.",
      statusCode: 401,
    });
  });

  it("retorna JWT ao autenticar um usuario existente", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Admin",
          email: "ADMIN@schedra.com",
          cpf: "52998224725",
          password: await hashPassword("Senha123"),
        },
      ],
    });
    const service = new LoginService(repository);

    const result = await service.execute({
      email: "  admin@schedra.com  ",
      password: "Senha123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.user).toEqual({
      id: 1,
      name: "Admin",
      email: "ADMIN@schedra.com",
      cpf: "52998224725",
      accountType: "business",
      avatarUrl: null,
    });

    const decoded = jwt.verify(result.data.token, env.jwt.secret) as { sub: string; email: string };

    expect(decoded.sub).toBe("1");
    expect(decoded.email).toBe("ADMIN@schedra.com");
  });

  it("impede login quando o perfil selecionado nao corresponde a conta", async () => {
    const repository = new InMemoryUserRepository({
      users: [
        {
          id: 1,
          name: "Agenda pessoal",
          email: "pessoal@schedra.com",
          cpf: "52998224725",
          password: await hashPassword("Senha123"),
          accountType: "personal",
        },
      ],
    });
    const service = new LoginService(repository);

    const result = await service.execute({
      email: "pessoal@schedra.com",
      password: "Senha123",
      accountType: "business",
    });

    expect(result).toEqual({
      success: false,
      message: "Esta é uma conta pessoal. Selecione Pessoal para entrar.",
      statusCode: 403,
    });
  });
});

