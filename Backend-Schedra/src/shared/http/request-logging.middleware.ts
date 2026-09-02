import type { RequestHandler } from "express";

import { env } from "../../config/env";
import { getRequestContext } from "./request-context";

export const requestLoggingMiddleware: RequestHandler = (request, response, next) => {
  if (env.nodeEnv === "test") {
    next();
    return;
  }

  const startedAt = process.hrtime.bigint();
  response.once("finish", () => {
    const context = getRequestContext();
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.log(JSON.stringify({
      type: "http_request",
      requestId: context?.requestId,
      method: request.method,
      path: request.originalUrl.split("?")[0],
      statusCode: response.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userId: context?.userId,
      organizationId: context?.organizationId,
    }));
  });
  next();
};
