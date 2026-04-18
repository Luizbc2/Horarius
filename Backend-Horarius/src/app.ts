import cors from "cors";
import express, { Express } from "express";

import { env } from "./config/env";
import { router } from "./routes";

const isProduction = process.env.NODE_ENV === "production";

const buildAllowedOrigins = (): string[] => {
  const configuredOrigin = env.frontendUrl.trim();

  if (!configuredOrigin) {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }

  const alternateOrigin = configuredOrigin.includes("localhost")
    ? configuredOrigin.replace("localhost", "127.0.0.1")
    : configuredOrigin.includes("127.0.0.1")
      ? configuredOrigin.replace("127.0.0.1", "localhost")
      : configuredOrigin;

  return Array.from(new Set([configuredOrigin, alternateOrigin]));
};

const isLocalDevelopmentOrigin = (origin: string): boolean => {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const isPrivateNetworkOrigin = (origin: string): boolean => {
  try {
    const { hostname } = new URL(origin);

    if (/^10\./.test(hostname)) {
      return true;
    }

    if (/^192\.168\./.test(hostname)) {
      return true;
    }

    const match = hostname.match(/^172\.(\d+)\./);

    if (!match) {
      return false;
    }

    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  } catch {
    return false;
  }
};

export class App {
  public readonly server: Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    const allowedOrigins = buildAllowedOrigins();

    this.server.use(
      cors({
        origin(origin, callback) {
          if (!isProduction) {
            callback(null, true);
            return;
          }

          if (
            !origin ||
            allowedOrigins.includes(origin) ||
            isLocalDevelopmentOrigin(origin) ||
            isPrivateNetworkOrigin(origin)
          ) {
            callback(null, true);
            return;
          }

          callback(new Error("CORS origin not allowed"));
        },
      })
    );
    this.server.use(express.json());
  }

  private routes(): void {
    this.server.use("/api", router);
  }
}

const application = new App();

export const app = application.server;
export default app;
