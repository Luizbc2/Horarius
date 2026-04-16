import request from "supertest";

import { hashPassword } from "../../modules/auth/utils/password.util";
import { createTestApp } from "./create-test-app";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("HTTP integration for auth and users", () => {
  test("POST /api/auth/login returns 200 with token for valid credentials", async () => {
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
    const app = createTestApp(repository);

    const response = await request(app).post("/api/auth/login").send({
      email: "luiz@horarius.com",
      password: "Senha123",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login realizado com sucesso.");
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user.email).toBe("luiz@horarius.com");
  });

  test("PUT /api/users/me returns 401 without token", async () => {
    const repository = new InMemoryUserRepository();
    const app = createTestApp(repository);

    const response = await request(app).put("/api/users/me").send({
      name: "Luiz",
      email: "luiz@horarius.com",
      cpf: "52998224725",
      password: "Senha123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("O token de autenticacao e obrigatorio.");
  });

  test("POST /api/users returns 400 for invalid payload", async () => {
    const repository = new InMemoryUserRepository();
    const app = createTestApp(repository);

    const response = await request(app).post("/api/users").send({
      name: "",
      email: "email-invalido",
      cpf: "123",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(typeof response.body.message).toBe("string");
  });
});
