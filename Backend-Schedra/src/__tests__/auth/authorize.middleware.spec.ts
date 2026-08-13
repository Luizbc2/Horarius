import express from "express";
import request from "supertest";

import { authenticate } from "../../modules/auth/middlewares/auth.middleware";
import { buildAuthorize } from "../../modules/auth/middlewares/authorize.middleware";
import { generateAccessToken } from "../../modules/auth/utils/jwt.util";

const user = { id: 1, name: "Usuario", email: "user@schedra.com", cpf: "52998224725", password: "hash", role: "user" as const };
const admin = { ...user, id: 2, email: "admin@schedra.com", role: "admin" as const };

describe("authorize middleware", () => {
  const app = express();
  const authorize = buildAuthorize(async (id) => id === admin.id ? admin : user);
  app.get("/admin", authenticate, authorize("admin"), (_request, response) => response.status(200).json({ ok: true }));

  it("bloqueia usuario comum em rota administrativa", async () => {
    const response = await request(app).get("/admin").set("Authorization", `Bearer ${generateAccessToken(user)}`);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Voce nao tem permissao para acessar este recurso.");
  });

  it("permite administrador em rota administrativa", async () => {
    const response = await request(app).get("/admin").set("Authorization", `Bearer ${generateAccessToken(admin)}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("revoga token antigo depois do rebaixamento no banco", async () => {
    const revokedApp = express();
    const currentRoleAuthorize = buildAuthorize(async () => ({ ...admin, role: "user" }));
    revokedApp.get("/admin", authenticate, currentRoleAuthorize("admin"), (_request, response) => response.status(200).json({ ok: true }));
    const response = await request(revokedApp).get("/admin").set("Authorization", `Bearer ${generateAccessToken(admin)}`);
    expect(response.status).toBe(403);
  });
});
