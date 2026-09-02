import express from "express";
import request from "supertest";

import { authorizePermission } from "../../modules/auth/middlewares/authorize-permission.middleware";

const buildApp = (permissions?: string[]) => {
  const app = express();
  app.use((incomingRequest, _response, next) => {
    if (permissions) {
      incomingRequest.auth = {
        sub: "1",
        email: "admin@schedra.app",
        role: "admin",
        organizationId: 1,
        membershipId: 1,
        organizationRole: "viewer",
        permissions,
      };
    }
    next();
  });
  app.get("/clients", authorizePermission("clients:write"), (_request, response) =>
    response.status(200).json({ ok: true }),
  );
  return app;
};

describe("authorizePermission", () => {
  it("exige autenticação", async () => {
    expect((await request(buildApp()).get("/clients")).status).toBe(401);
  });

  it("não deixa o papel global de admin ignorar as permissões da organização", async () => {
    expect((await request(buildApp(["clients:read"])).get("/clients")).status).toBe(403);
  });

  it("autoriza quando a membership possui a permissão exigida", async () => {
    expect((await request(buildApp(["clients:read", "clients:write"])).get("/clients")).status).toBe(200);
  });
});
