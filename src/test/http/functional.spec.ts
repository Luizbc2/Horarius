import request from "supertest";

import { createTestApp } from "./create-test-app";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("Functional tests", () => {
  test("GET /api/health returns backend status", async () => {
    const app = createTestApp(new InMemoryUserRepository());

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Backend do Horarius em execucao.",
      status: "ok",
    });
  });

  test("POST /api/users creates a new user with valid data", async () => {
    const app = createTestApp(new InMemoryUserRepository());

    const response = await request(app).post("/api/users").send({
      name: "Luiz",
      email: "luiz@horarius.com",
      cpf: "52998224725",
      password: "Senha123",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Usuario cadastrado com sucesso.");
    expect(response.body.user.email).toBe("luiz@horarius.com");
  });
});
