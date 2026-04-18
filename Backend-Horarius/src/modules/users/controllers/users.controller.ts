import { Request, Response } from "express";

import { CreateUserService } from "../services/create-user.service";
import { UpdateUserProfileService } from "../services/update-user-profile.service";
import { getAuthenticatedUserId } from "../../auth/utils/auth-request.util";
import { asRequestBody, asString } from "../../../shared/http/request-parser";

export class UsersController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly updateUserProfileService: UpdateUserProfileService,
  ) {}

  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const result = await this.createUserService.execute(this.buildCreatePayload(request));

      if (!result.success) {
        return this.sendFailure(response, result.statusCode, result.message);
      }

      return response.status(201).json(result.data);
    } catch (error) {
      console.error("User registration request failed.", error);

      return response.status(500).json({
        message: "Não foi possível processar o cadastro de usuário agora.",
      });
    }
  }

  public async updateMe(request: Request, response: Response): Promise<Response> {
    try {
      const authenticatedUserId = getAuthenticatedUserId(request);

      if (!authenticatedUserId) {
        return this.sendFailure(response, 401, "Usuario autenticado nao identificado.");
      }

      const result = await this.updateUserProfileService.execute(
        this.buildUpdatePayload(request, authenticatedUserId),
      );

      if (!result.success) {
        return this.sendFailure(response, result.statusCode, result.message);
      }

      return response.status(200).json(result.data);
    } catch (error) {
      console.error("User profile update request failed.", error);

      return response.status(500).json({
        message: "Não foi possível processar a atualização do perfil agora.",
      });
    }
  }

  private buildCreatePayload(request: Request) {
    const body = asRequestBody(request.body);

    return {
      name: asString(body.name),
      email: asString(body.email),
      cpf: asString(body.cpf),
      password: asString(body.password),
    };
  }

  private buildUpdatePayload(request: Request, authenticatedUserId: number) {
    const body = asRequestBody(request.body);

    return {
      authenticatedUserId,
      userId: authenticatedUserId,
      name: asString(body.name),
      email: asString(body.email),
      cpf: asString(body.cpf),
      password: asString(body.password),
    };
  }

  private sendFailure(response: Response, statusCode: number, message: string): Response {
    return response.status(statusCode).json({ message });
  }
}



