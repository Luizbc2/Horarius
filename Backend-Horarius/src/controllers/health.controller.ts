import { Request, Response } from "express";

export class HealthController {
  public check(_request: Request, response: Response): Response {
    return response.status(200).json({
      message: "Backend do Horarius em execucao.",
      status: "ok"
    });
  }
}

