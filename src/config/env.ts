import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

export const env = {
  port: toNumber(process.env.PORT, 3333),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  database: {
    host: process.env.DB_HOST || "",
    port: toNumber(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || ""
  },
  authDemoUser: {
    name: process.env.AUTH_USER_NAME || "Usuario Horarius",
    email: process.env.AUTH_USER_EMAIL || "admin@horarius.com",
    cpf: process.env.AUTH_USER_CPF || "52998224725",
    password: process.env.AUTH_USER_PASSWORD || "123456"
  },
  jwt: {
    secret: process.env.JWT_SECRET || "horarius_jwt_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  }
};
