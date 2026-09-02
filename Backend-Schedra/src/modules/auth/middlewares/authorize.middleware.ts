import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedUser, UserRole } from "../auth.types";
import { SequelizeUserRepository } from "../repositories/sequelize-user.repository";

type ResolveUser = (id: number) => Promise<AuthenticatedUser | null>;

export const buildAuthorize = (resolveUser: ResolveUser) => (...allowedRoles: UserRole[]) => {
  return async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
    if (!request.auth) return response.status(401).json({ message: "Usuario autenticado nao identificado." });

    try {
      const user = await resolveUser(Number(request.auth.sub));
      if (!user || user.active === false) return response.status(401).json({ message: "Sessao de usuario invalida ou desativada." });
      const currentRole = user.role ?? "user";
      if (!allowedRoles.includes(currentRole)) return response.status(403).json({ message: "Voce nao tem permissao para acessar este recurso." });
      request.auth.role = currentRole;
      return next();
    } catch {
      return response.status(503).json({ message: "Nao foi possivel validar as permissoes agora." });
    }
  };
};

const repository = new SequelizeUserRepository();
export const authorize = buildAuthorize((id) => repository.findById(id));
