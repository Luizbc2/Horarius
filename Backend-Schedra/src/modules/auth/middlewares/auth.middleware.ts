import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../../config/env";
import { AccessTokenPayload } from "../auth.types";
import { SequelizeUserRepository } from "../repositories/sequelize-user.repository";
import { sessionService } from "../services/session.service";
import { tenantService } from "../../../platform/tenancy/tenant.service";
import { setRequestActor } from "../../../shared/http/request-context";

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

const userRepository = new SequelizeUserRepository();

export const authenticate = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    return response.status(401).json({
      message: "O token de autenticação é obrigatório.",
    });
  }

  try {
    const decodedToken = jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
    const userId = Number(decodedToken.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid token subject");
    }

    if (!decodedToken.sid && env.nodeEnv !== "test") {
      return response.status(401).json({ message: "Sessão ausente ou expirada." });
    }

    if (decodedToken.sid) {
      const validSession = await sessionService.validate(decodedToken.sid, userId);
      const user = validSession ? await userRepository.findById(userId) : null;

      if (!validSession || !user || user.active === false) {
        return response.status(401).json({ message: "Sessão revogada ou expirada." });
      }

      const workspace = validSession.organizationId
        ? await tenantService.resolveForUser(userId, validSession.organizationId)
        : await tenantService.ensureDefaultWorkspace({ id: user.id, name: user.name, email: user.email });

      if (!workspace) {
        return response.status(403).json({ message: "Acesso à organização não autorizado." });
      }

      decodedToken.role = user.role ?? "user";
      decodedToken.organizationId = workspace.id;
      decodedToken.membershipId = workspace.membershipId;
      decodedToken.organizationRole = workspace.role;
      decodedToken.permissions = workspace.permissions;
    }

    request.auth = decodedToken;
    setRequestActor({
      userId,
      organizationId: decodedToken.organizationId,
      sessionId: decodedToken.sid,
      membershipId: decodedToken.membershipId,
      organizationRole: decodedToken.organizationRole,
    });

    return next();
  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError) && !(error instanceof jwt.TokenExpiredError)) {
      console.error("Authentication validation failed.", error);
    }
    return response.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
};


