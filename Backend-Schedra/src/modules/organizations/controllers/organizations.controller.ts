import type { Request, Response } from "express";

import { tenantService } from "../../../platform/tenancy/tenant.service";
import type { OrganizationRole } from "../../../platform/tenancy/tenant.types";
import { asRequestBody, asString } from "../../../shared/http/request-parser";
import { SequelizeUserRepository } from "../../auth/repositories/sequelize-user.repository";
import { sessionService } from "../../auth/services/session.service";
import { getAuthenticatedUserId } from "../../auth/utils/auth-request.util";
import { ApiError } from "../../../shared/http/api-error";
import { recordRequestAudit } from "../../../shared/http/request-audit";

const VALID_ROLES: OrganizationRole[] = ["owner", "manager", "staff", "viewer"];

const runTenantAction = async <T>(action: () => Promise<T>): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const normalized = error.message.toLowerCase();
    if (normalized.includes("permissão") || normalized.includes("autorizad")) {
      throw new ApiError(403, "ORGANIZATION_FORBIDDEN", error.message);
    }
    if (normalized.includes("não encontrad")) {
      throw new ApiError(404, "ORGANIZATION_RESOURCE_NOT_FOUND", error.message);
    }
    if (normalized.includes("proprietário") || normalized.includes("não pode ser removido")) {
      throw new ApiError(409, "ORGANIZATION_CONFLICT", error.message);
    }
    if (normalized.includes("inválid") || normalized.includes("pelo menos")) {
      throw new ApiError(400, "ORGANIZATION_INPUT_INVALID", error.message);
    }
    throw error;
  }
};

export class OrganizationsController {
  private readonly users = new SequelizeUserRepository();

  public async list(request: Request, response: Response): Promise<Response> {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário autenticado não identificado." });
    return response.status(200).json({ data: await runTenantAction(() => tenantService.listForUser(userId)) });
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const userId = getAuthenticatedUserId(request);
    const user = userId ? await this.users.findById(userId) : null;
    if (!user) return response.status(401).json({ message: "Usuário autenticado não identificado." });
    const body = asRequestBody(request.body);
    const organization = await runTenantAction(() => tenantService.createOrganization(user, asString(body.name)));
    await recordRequestAudit(request, "organization.created", "organization", organization.id, undefined, organization.id);
    return response.status(201).json({ message: "Organização criada com sucesso.", organization });
  }

  public async activate(request: Request, response: Response): Promise<Response> {
    const userId = getAuthenticatedUserId(request);
    const organizationId = Number(request.params.id);
    const user = userId ? await this.users.findById(userId) : null;
    const workspace = userId
      ? await runTenantAction(() => tenantService.resolveForUser(userId, organizationId))
      : null;
    if (!user || !workspace || !request.auth?.sid) {
      return response.status(403).json({ message: "Organização não autorizada para esta sessão." });
    }
    const token = await sessionService.switchWorkspace(request.auth.sid, user, workspace);
    await recordRequestAudit(request, "organization.activated", "organization", workspace.id, undefined, workspace.id);
    return response.status(200).json({ message: "Organização ativa alterada.", token, organization: workspace });
  }

  public async listMembers(request: Request, response: Response): Promise<Response> {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário autenticado não identificado." });
    const data = await runTenantAction(() => tenantService.listMembers(userId, Number(request.params.id)));
    return response.status(200).json({ data });
  }

  public async addMember(request: Request, response: Response): Promise<Response> {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário autenticado não identificado." });
    const body = asRequestBody(request.body);
    const role = asString(body.role) as OrganizationRole;
    if (!VALID_ROLES.includes(role) || role === "owner") {
      return response.status(400).json({ message: "Papel de organização inválido." });
    }
    const organizationId = Number(request.params.id);
    const email = asString(body.email);
    await runTenantAction(() => tenantService.addMember(userId, organizationId, email, role));
    await recordRequestAudit(request, "organization.member_added", "organization", organizationId, { email, role }, organizationId);
    return response.status(201).json({ message: "Membro adicionado com sucesso." });
  }

  public async removeMember(request: Request, response: Response): Promise<Response> {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário autenticado não identificado." });
    const organizationId = Number(request.params.id);
    const memberUserId = Number(request.params.userId);
    await runTenantAction(() => tenantService.removeMember(userId, organizationId, memberUserId));
    await recordRequestAudit(request, "organization.member_removed", "user", memberUserId, undefined, organizationId);
    return response.status(200).json({ message: "Membro removido com sucesso." });
  }
}
