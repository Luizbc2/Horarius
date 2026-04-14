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
      const body = asRequestBody(request.body as object | null | undefined);
      const result = await this.createUserService.execute({
        name: asString(body.name),
        email: asString(body.email),
        cpf: asString(body.cpf),
        password: asString(body.password),
      });

      if (!result.success) {
        return response.status(result.statusCode).json({
          message: result.message,
        });
      }

      return response.status(201).json(result.data);
    } catch (error) {
      console.error("User registration request failed.", error);

      return response.status(500).json({
        message: "Nao foi possivel processar o cadastro de usuario agora.",
      });
    }
  }

  public async updateMe(request: Request, response: Response): Promise<Response> {
    try {
      const body = asRequestBody(request.body as object | null | undefined);
      const authenticatedUserId = getAuthenticatedUserId(request);

      if (!authenticatedUserId) {
        return response.status(401).json({
          message: "Usuario autenticado nao identificado.",
        });
      }

      const result = await this.updateUserProfileService.execute({
        authenticatedUserId,
        userId: authenticatedUserId,
        name: asString(body.name),
        email: asString(body.email),
        cpf: asString(body.cpf),
        password: asString(body.password),
      });

      if (!result.success) {
        return response.status(result.statusCode).json({
          message: result.message,
        });
      }

      return response.status(200).json(result.data);
    } catch (error) {
      console.error("User profile update request failed.", error);

      return response.status(500).json({
        message: "Nao foi possivel processar a atualizacao do perfil agora.",
      });
    }
  }
}


