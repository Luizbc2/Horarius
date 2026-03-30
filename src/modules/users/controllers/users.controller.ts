import { Request, Response } from "express";

import { CreateUserService } from "../services/create-user.service";
import { CreateUserRequestDto } from "../dtos/create-user.dto";
import { UpdateUserProfileService } from "../services/update-user-profile.service";
import { getAuthenticatedUserId } from "../../auth/utils/auth-request.util";

export class UsersController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly updateUserProfileService: UpdateUserProfileService,
  ) {}

  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const result = await this.createUserService.execute({
        name: this.asString((request.body as Partial<CreateUserRequestDto>).name),
        email: this.asString((request.body as Partial<CreateUserRequestDto>).email),
        cpf: this.asString((request.body as Partial<CreateUserRequestDto>).cpf),
        password: this.asString((request.body as Partial<CreateUserRequestDto>).password),
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
        message: "Unable to process user registration right now.",
      });
    }
  }

  public async updateMe(request: Request, response: Response): Promise<Response> {
    try {
      const authenticatedUserId = getAuthenticatedUserId(request);

      if (!authenticatedUserId) {
        return response.status(401).json({
          message: "Authenticated user was not identified.",
        });
      }

      const result = await this.updateUserProfileService.execute({
        authenticatedUserId,
        userId: authenticatedUserId,
        name: this.asString((request.body as { name?: unknown }).name),
        email: this.asString((request.body as { email?: unknown }).email),
        cpf: this.asString((request.body as { cpf?: unknown }).cpf),
        password: this.asString((request.body as { password?: unknown }).password),
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
        message: "Unable to process profile update right now.",
      });
    }
  }

  private asString(value: unknown): string {
    return typeof value === "string" ? value : "";
  }
}
