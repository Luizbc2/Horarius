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
      email: "naoexiste@horarius.com",
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
          email: "admin@horarius.com",
          cpf: "52998224725",
          password: await hashPassword("Senha123"),
        },
      ],
    });
    const service = new LoginService(repository);

    const result = await service.execute({
      email: "admin@horarius.com",
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
          email: "ADMIN@horarius.com",
          cpf: "52998224725",
          password: await hashPassword("Senha123"),
        },
      ],
    });
    const service = new LoginService(repository);

    const result = await service.execute({
      email: "  admin@horarius.com  ",
      password: "Senha123",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.user).toEqual({
      id: 1,
      name: "Admin",
      email: "ADMIN@horarius.com",
      cpf: "52998224725",
    });

    const decoded = jwt.verify(result.data.token, env.jwt.secret) as { sub: string; email: string };

    expect(decoded.sub).toBe("1");
    expect(decoded.email).toBe("ADMIN@horarius.com");
  });
});

