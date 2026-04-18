import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

const normalizeString = (value: string | undefined, fallback: string): string => {
  if (value === undefined) {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return fallback;
  }

  return trimmedValue.replace(/^['"]|['"]$/g, "");
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 3333),
  frontendUrl: normalizeString(process.env.FRONTEND_URL, "http://localhost:5173"),
  database: {
    url: normalizeString(process.env.DATABASE_URL, ""),
    host: normalizeString(process.env.DB_HOST, ""),
    port: toNumber(process.env.DB_PORT, 5432),
    name: normalizeString(process.env.DB_NAME, ""),
    user: normalizeString(process.env.DB_USER, ""),
    password: normalizeString(process.env.DB_PASSWORD, ""),
    ssl: toBoolean(process.env.DB_SSL, false),
    autoSync: toBoolean(process.env.DB_AUTO_SYNC, process.env.NODE_ENV !== "production"),
  },
  authSeedUser: {
    name: normalizeString(process.env.AUTH_USER_NAME, "Usuario Horarius"),
    email: normalizeString(process.env.AUTH_USER_EMAIL, "admin@horarius.com"),
    cpf: normalizeString(process.env.AUTH_USER_CPF, "52998224725"),
    password: normalizeString(process.env.AUTH_USER_PASSWORD, "123456"),
  },
  jwt: {
    secret: normalizeString(process.env.JWT_SECRET, "horarius_jwt_secret"),
    expiresIn: normalizeString(process.env.JWT_EXPIRES_IN, "1d"),
  },
};
