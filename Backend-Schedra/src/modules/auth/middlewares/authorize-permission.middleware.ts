import type { NextFunction, Request, Response } from "express";

import type { PlatformPermission } from "../../../platform/tenancy/tenant.types";

export const authorizePermission = (...requiredPermissions: PlatformPermission[]) => {
  return (request: Request, response: Response, next: NextFunction): Response | void => {
    if (!request.auth) {
      return response.status(401).json({ message: "Usuário autenticado não identificado." });
    }

    const permissions = new Set(request.auth.permissions ?? []);

    if (!requiredPermissions.every((permission) => permissions.has(permission))) {
      return response.status(403).json({ message: "Você não tem permissão para realizar esta operação." });
    }

    return next();
  };
};
