import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../../config/env";
import { AccessTokenPayload } from "../auth.types";

const extractBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token?.trim()) {
    return null;
  }

  return token;
};

export const authenticate = (request: Request, response: Response, next: NextFunction): Response | void => {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    return response.status(401).json({
      message: "O token de autenticação é obrigatório.",
    });
  }

  try {
    const decodedToken = jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
    request.auth = decodedToken;

    return next();
  } catch {
    return response.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
};


