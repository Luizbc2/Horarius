import { expect, test, type APIRequestContext } from "@playwright/test";

type AuthSession = {
  token: string;
};

const unique = () => Date.now().toString(36);

const generateValidCpf = () => {
  const base = Date.now().toString().slice(-8).padStart(8, "0");
  const digits = `1${base}`.split("").map(Number);
  const firstCheck =
    digits.reduce((total, digit, index) => total + digit * (10 - index), 0) % 11;
  digits.push(firstCheck < 2 ? 0 : 11 - firstCheck);

  const secondCheck =
    digits.reduce((total, digit, index) => total + digit * (11 - index), 0) % 11;
  digits.push(secondCheck < 2 ? 0 : 11 - secondCheck);

  return digits.join("");
};

const signupPayload = (suffix = unique()) => ({
  name: `Usuario E2E ${suffix}`,
  email: `usuario.e2e.${suffix}@schedra.test`,
  cpf: generateValidCpf(),
  password: "Senha@123",
});

const login = async (request: APIRequestContext, email = "admin@schedra.com", password = "123456") => {
  const response = await request.post("api/auth/login", {
    data: {
      email,
      password,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.token).toBeTruthy();

  return {
    token: body.token as string,
  };
};

const authHeaders = (session: AuthSession) => ({
  Authorization: `Bearer ${session.token}`,
});

test.describe("autenticacao", () => {
  test("login com sucesso e falha", async ({ request }) => {
    const success = await request.post("api/auth/login", {
      data: {
        email: "admin@schedra.com",
        password: "123456",
      },
    });

    expect(success.status()).toBe(200);
    await expect(success).toBeOK();
    expect((await success.json()).token).toBeTruthy();

    const failure = await request.post("api/auth/login", {
      data: {
        email: "admin@schedra.com",
        password: "senha-incorreta",
      },
    });

    expect(failure.status()).toBe(401);
    expect((await failure.json()).message).toBeTruthy();
  });

  test("criacao de usuario com sucesso e falha", async ({ request }) => {
    const payload = signupPayload();
    const created = await request.post("api/users", {
      data: payload,
    });

    expect(created.status()).toBe(201);
    const createdBody = await created.json();
    expect(createdBody.user.email).toBe(payload.email);

    const duplicated = await request.post("api/users", {
      data: payload,
    });

    expect(duplicated.status()).toBe(409);
    expect((await duplicated.json()).message).toBeTruthy();

    const invalid = await request.post("api/users", {
      data: {
        name: "A",
        email: "email-invalido",
        cpf: "000",
        password: "123",
      },
    });

    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).message).toBeTruthy();
  });
});

test.describe("crud de clientes", () => {
  test("cadastrar, editar, listar e excluir com sucesso e falha", async ({ request }) => {
    const session = await login(request);
    const headers = authHeaders(session);
    const suffix = unique();

    const invalidCreate = await request.post("api/clients", {
      headers,
      data: {
        name: "",
        email: "cliente-invalido",
        phone: "abc",
        notes: "xx",
      },
    });

    expect(invalidCreate.status()).toBe(400);

    const created = await request.post("api/clients", {
      headers,
      data: {
        name: `Cliente E2E ${suffix}`,
        email: `cliente.${suffix}@schedra.test`,
        phone: "11999998888",
        notes: "Cliente criado durante teste e2e.",
      },
    });

    expect(created.status()).toBe(201);
    const createdBody = await created.json();
    const clientId = createdBody.client.id;

    const updated = await request.put(`api/clients/${clientId}`, {
      headers,
      data: {
        name: `Cliente E2E Atualizado ${suffix}`,
        email: `cliente.atualizado.${suffix}@schedra.test`,
        phone: "11888887777",
        notes: "Cliente atualizado durante teste e2e.",
      },
    });

    expect(updated.status()).toBe(200);
    expect((await updated.json()).client.name).toContain("Atualizado");

    const listed = await request.get(`api/clients?search=${suffix}`, {
      headers,
    });

    expect(listed.status()).toBe(200);
    const listedBody = await listed.json();
    expect(listedBody.data.some((client: { id: number }) => client.id === clientId)).toBeTruthy();

    const deleted = await request.delete(`api/clients/${clientId}`, {
      headers,
    });

    expect(deleted.status()).toBe(200);

    const deleteAgain = await request.delete(`api/clients/${clientId}`, {
      headers,
    });

    expect(deleteAgain.status()).toBe(404);
  });
});

test.describe("crud de servicos", () => {
  test("cadastrar, editar, listar e excluir com sucesso e falha", async ({ request }) => {
    const session = await login(request);
    const headers = authHeaders(session);
    const suffix = unique();

    const invalidCreate = await request.post("api/services", {
      headers,
      data: {
        name: "",
        category: "",
        durationMinutes: 0,
        price: -1,
        description: "bad",
      },
    });

    expect(invalidCreate.status()).toBe(400);

    const created = await request.post("api/services", {
      headers,
      data: {
        name: `Servico E2E ${suffix}`,
        category: "Consulta",
        durationMinutes: 45,
        price: 120,
        description: "Servico criado durante teste e2e.",
      },
    });

    expect(created.status()).toBe(201);
    const createdBody = await created.json();
    const serviceId = createdBody.service.id;

    const updated = await request.put(`api/services/${serviceId}`, {
      headers,
      data: {
        name: `Servico E2E Atualizado ${suffix}`,
        category: "Retorno",
        durationMinutes: 60,
        price: 150,
        description: "Servico atualizado durante teste e2e.",
      },
    });

    expect(updated.status()).toBe(200);
    expect((await updated.json()).service.name).toContain("Atualizado");

    const listed = await request.get(`api/services?search=${suffix}`, {
      headers,
    });

    expect(listed.status()).toBe(200);
    const listedBody = await listed.json();
    expect(listedBody.data.some((service: { id: number }) => service.id === serviceId)).toBeTruthy();

    const deleted = await request.delete(`api/services/${serviceId}`, {
      headers,
    });

    expect(deleted.status()).toBe(200);

    const deleteAgain = await request.delete(`api/services/${serviceId}`, {
      headers,
    });

    expect(deleteAgain.status()).toBe(404);
  });
});
