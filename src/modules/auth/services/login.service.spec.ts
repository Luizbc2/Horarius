import jwt from "jsonwebtoken";

import { env } from "../../../config/env";
import { LoginService } from "./login.service";
import { hashPassword } from "../utils/password.util";
import { InMemoryUserRepository } from "../../../test/mocks/in-memory-user.repository";

test("LoginService returns JWT and public user data for valid credentials", async () => {
  const repository = new InMemoryUserRepository({
    users: [
      {
        id: 7,
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: await hashPassword("Senha123"),
      },
    ],
  });
  const service = new LoginService(repository);

  const result = await service.execute({
    email: "  Luiz@Horarius.com ",
    password: "Senha123",
  });

  expect(result.success).toBe(true);

  if (!result.success) {
    return;
  }

  const tokenPayload = jwt.verify(result.data.token, env.jwt.secret) as { sub: string; email: string };

  expect(result.data.message).toBe("Login realizado com sucesso.");
  expect(result.data.user.id).toBe(7);
  expect(result.data.user.email).toBe("luiz@horarius.com");
  expect(tokenPayload.sub).toBe("7");
  expect(tokenPayload.email).toBe("luiz@horarius.com");
});

test("LoginService rejects invalid email format", async () => {
  const repository = new InMemoryUserRepository();
  const service = new LoginService(repository);

  const result = await service.execute({
    email: "email-invalido",
    password: "Senha123",
  });

  expect(result).toEqual({
    success: false,
    message: "Formato de e-mail invalido.",
    statusCode: 400,
  });
});

test("LoginService rejects unknown user", async () => {
  const repository = new InMemoryUserRepository();
  const service = new LoginService(repository);

  const result = await service.execute({
    email: "teste@horarius.com",
    password: "Senha123",
  });

  expect(result).toEqual({
    success: false,
    message: "E-mail ou senha invalidos.",
    statusCode: 401,
  });
});
