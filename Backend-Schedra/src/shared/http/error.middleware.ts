import type { ErrorRequestHandler, RequestHandler, Response } from "express";

import { ApiError } from "./api-error";
import { getRequestContext } from "./request-context";

const STATUS_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

export const errorEnvelopeMiddleware: RequestHandler = (_request, response, next) => {
  const originalJson = response.json.bind(response);
  response.json = ((body: unknown) => {
    if (
      response.statusCode >= 400 &&
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      !("code" in body)
    ) {
      return originalJson({
        code: STATUS_CODES[response.statusCode] ?? "REQUEST_FAILED",
        ...(body as Record<string, unknown>),
        requestId: getRequestContext()?.requestId,
      });
    }
    return originalJson(body);
  }) as Response["json"];
  next();
};

export const notFoundHandler: RequestHandler = (request, response) => {
  const requestId = getRequestContext()?.requestId;
  response.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: `Rota ${request.method} ${request.path} não encontrada.`,
    requestId,
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const requestId = getRequestContext()?.requestId;
  const apiError = error instanceof ApiError
    ? error
    : new ApiError(500, "INTERNAL_ERROR", "Não foi possível concluir a operação agora.");

  if (!(error instanceof ApiError)) {
    console.error(`[${requestId ?? "no-request-id"}] Unhandled backend error.`, error);
  }

  response.status(apiError.statusCode).json({
    code: apiError.code,
    message: apiError.message,
    requestId,
    ...(apiError.details === undefined ? {} : { details: apiError.details }),
  });
};
