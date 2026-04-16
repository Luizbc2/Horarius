import request from "supertest";

import { createTestApp } from "./create-test-app";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("System flow for auth and profile", () => {
  test("registers a user, logs in and updates the own profile", async () => {
    const repository = new InMemoryUserRepository();
    const app = createTestApp(repository);

    const registerResponse = await request(app).post("/api/users").send({
      name: "Luiz",
      email: "luiz@horarius.com",
      cpf: "52998224725",
      password: "Senha123",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.message).toBe("Usuario cadastrado com sucesso.");

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "luiz@horarius.com",
      password: "Senha123",
    });

    expect(loginResponse.status).toBe(200);
    expect(typeof loginResponse.body.token).toBe("string");

    const updateResponse = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        name: "Luiz Otavio",
        email: "luiz@horarius.com",
        cpf: "11144477735",
        password: "NovaSenha123",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe("Perfil atualizado com sucesso.");
    expect(updateResponse.body.user.name).toBe("Luiz Otavio");
    expect(updateResponse.body.user.cpf).toBe("11144477735");
  });
});
