import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import { generateAccessToken } from "../../modules/auth/utils/jwt.util";

describe("JWT utils", () => {
  it("gera um token com id e e-mail do usuario", () => {
    const token = generateAccessToken({
      id: 7,
      name: "Maria",
      email: "maria@horarius.com",
      cpf: "52998224725",
      password: "hash",
    });

    const decoded = jwt.verify(token, env.jwt.secret) as { sub: string; email: string };

    expect(decoded.sub).toBe("7");
    expect(decoded.email).toBe("maria@horarius.com");
  });
});
