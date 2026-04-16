import request from "supertest";

import { createTestApp } from "./create-test-app";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("Security tests", () => {
  test("blocks access to protected route without token", async () => {
    const app = createTestApp(new InMemoryUserRepository());

    const response = await request(app).put("/api/users/me").send({
      name: "Luiz",
      email: "luiz@horarius.com",
      cpf: "52998224725",
      password: "Senha123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("O token de autenticacao e obrigatorio.");
  });

  test("blocks access to protected route with invalid token", async () => {
    const app = createTestApp(new InMemoryUserRepository());

    const response = await request(app)
      .put("/api/users/me")
      .set("Authorization", "Bearer token-invalido")
      .send({
        name: "Luiz",
        email: "luiz@horarius.com",
        cpf: "52998224725",
        password: "Senha123",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token invalido ou expirado.");
  });
});
