import type { Request, Response } from "express";

import { asNumber, asRequestBody, asString } from "../../../shared/http/request-parser";
import { getAuthenticatedUserId } from "../../auth/utils/auth-request.util";
import type { AdminUsersService } from "../services/admin-users.service";

export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  public async list(request: Request, response: Response) {
    const data = await this.service.list(asNumber(request.query.page), asNumber(request.query.limit), asString(request.query.search));
    return response.status(200).json(data);
  }

  public async changeRole(request: Request, response: Response) {
    const body = asRequestBody(request.body);
    const result = await this.service.changeRole(getAuthenticatedUserId(request) ?? 0, Number(request.params.id), asString(body.role));
    return result.success ? response.status(200).json(result.data) : response.status(result.statusCode).json({ message: result.message });
  }

  public async changeStatus(request: Request, response: Response) {
    const body = asRequestBody(request.body);
    const result = await this.service.changeStatus(getAuthenticatedUserId(request) ?? 0, Number(request.params.id), body.active);
    return result.success ? response.status(200).json(result.data) : response.status(result.statusCode).json({ message: result.message });
  }

  public async remove(request: Request, response: Response) {
    const result = await this.service.remove(getAuthenticatedUserId(request) ?? 0, Number(request.params.id));
    return result.success ? response.status(200).json(result.data) : response.status(result.statusCode).json({ message: result.message });
  }
}
