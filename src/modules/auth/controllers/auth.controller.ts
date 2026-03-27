import { Request, Response } from "express";

import { LoginService } from "../services/login.service";

export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  public async login(request: Request, response: Response): Promise<Response> {
    const { email = "", password = "" } = request.body as {
      email?: string;
      password?: string;
    };

    const result = await this.loginService.execute({ email, password });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message
      });
    }

    return response.status(200).json(result.data);
  }
}
