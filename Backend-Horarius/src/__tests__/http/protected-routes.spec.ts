import request from "supertest";

import { App } from "../../app";

type ProtectedRouteCase = {
  method: "get" | "put";
  path: string;
};

const protectedRoutes: ProtectedRouteCase[] = [
  { method: "get", path: "/api/clients" },
  { method: "get", path: "/api/services" },
  { method: "get", path: "/api/professionals" },
  { method: "get", path: "/api/appointments" },
  { method: "put", path: "/api/users/me" },
];

const sendRequest = ({ method, path }: ProtectedRouteCase) => {
  const app = new App().server;

  if (method === "put") {
    return request(app).put(path).send({});
  }

  return request(app).get(path);
};

describe("Protected routes", () => {
  it.each(protectedRoutes)("bloqueia $path quando o token nao foi enviado", async (routeCase) => {
    const response = await sendRequest(routeCase);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "O token de autenticação é obrigatório.",
    });
  });

  it("bloqueia token inválido", async () => {
    const response = await request(new App().server)
      .get("/api/clients")
      .set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Token inválido ou expirado.",
    });
  });
});

