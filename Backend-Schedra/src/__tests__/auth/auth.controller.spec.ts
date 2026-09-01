import express from "express";
import request from "supertest";

import { AuthController } from "../../modules/auth/controllers/auth.controller";
import type { LoginService } from "../../modules/auth/services/login.service";
import type { SessionService } from "../../modules/auth/services/session.service";

const user = {
  id: 7,
  name: "Luiz",
  email: "luiz@schedra.test",
  cpf: "52998224725",
  role: "user" as const,
  active: true,
  accountType: "business" as const,
  avatarUrl: null,
};

const workspace = {
  id: 3,
  name: "Empresa",
  slug: "empresa",
  membershipId: 11,
  role: "owner" as const,
  permissions: ["appointments:read"],
};

const buildApp = () => {
  const loginService = {
    execute: jest.fn().mockResolvedValue({
      success: true,
      data: {
        message: "Login realizado com sucesso.",
        token: "access-token",
        refreshToken: "refresh-token",
        organization: workspace,
        user,
      },
    }),
  } as unknown as LoginService;
  const sessionService = {
    rotate: jest.fn().mockResolvedValue({
      session: { token: "access-token-2", refreshToken: "refresh-token-2", workspace },
      user: { ...user, password: "hash" },
    }),
    revoke: jest.fn(),
  } as unknown as SessionService;
  const controller = new AuthController(loginService, sessionService);
  const app = express();
  app.use(express.json());
  app.post("/api/auth/login", (req, res) => controller.login(req, res));
  app.post("/api/auth/refresh", (req, res) => controller.refresh(req, res));
  return { app, sessionService };
};

describe("AuthController refresh token transport", () => {
  it("entrega o refresh token web apenas em cookie HttpOnly", async () => {
    const { app } = buildApp();
    const response = await request(app)
      .post("/api/auth/login")
      .set("x-auth-client", "web")
      .send({ email: user.email, password: "Senha123!" });

    expect(response.status).toBe(200);
    expect(response.body.refreshToken).toBeUndefined();
    expect(response.headers["set-cookie"]?.[0]).toContain("schedra_refresh=refresh-token");
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(response.headers["set-cookie"]?.[0]).toContain("SameSite=Strict");
  });

  it("mantém o refresh token no corpo para o aplicativo nativo", async () => {
    const { app } = buildApp();
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Senha123!" });

    expect(response.body.refreshToken).toBe("refresh-token");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rotaciona o cookie web sem expor o próximo refresh token", async () => {
    const { app, sessionService } = buildApp();
    const response = await request(app)
      .post("/api/auth/refresh")
      .set("x-auth-client", "web")
      .set("Cookie", "schedra_refresh=refresh-token")
      .send({});

    expect(sessionService.rotate).toHaveBeenCalledWith("refresh-token");
    expect(response.body.token).toBe("access-token-2");
    expect(response.body.refreshToken).toBeUndefined();
    expect(response.headers["set-cookie"]?.[0]).toContain("schedra_refresh=refresh-token-2");
  });
});
