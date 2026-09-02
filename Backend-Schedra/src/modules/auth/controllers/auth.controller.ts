import { Request, Response } from "express";

import { LoginService } from "../services/login.service";
import type { SessionService } from "../services/session.service";
import { env } from "../../../config/env";

const REFRESH_COOKIE_NAME = "schedra_refresh";
const REFRESH_COOKIE_PATH = "/api/auth";

const readCookie = (request: Request, name: string): string => {
  const rawCookie = request.header("cookie") ?? "";
  for (const entry of rawCookie.split(";")) {
    const [key, ...parts] = entry.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(parts.join("="));
      } catch {
        return "";
      }
    }
  }
  return "";
};

const isWebClient = (request: Request): boolean => request.header("x-auth-client") === "web";

const setRefreshCookie = (response: Response, refreshToken: string): void => {
  response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path: REFRESH_COOKIE_PATH,
    maxAge: env.jwt.refreshDays * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (response: Response): void => {
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path: REFRESH_COOKIE_PATH,
  });
};

export class AuthController {
  constructor(
    private readonly loginService: LoginService,
    private readonly sessionService?: SessionService,
  ) {}

  public async login(request: Request, response: Response): Promise<Response> {
    try {
      const { email = "", password = "" } = request.body as {
        email?: string;
        password?: string;
      };

      const result = await this.loginService.execute(
        { email, password },
        { userAgent: request.get("user-agent"), ipAddress: request.ip },
      );

      if (!result.success) {
        return response.status(result.statusCode).json({
          message: result.message
        });
      }

      if (isWebClient(request) && result.data.refreshToken) {
        setRefreshCookie(response, result.data.refreshToken);
        const { refreshToken: _refreshToken, ...webSession } = result.data;
        return response.status(200).json(webSession);
      }

      return response.status(200).json(result.data);
    } catch (error) {
      console.error("Login request failed.", error);

      return response.status(500).json({
        message: "Não foi possível processar o login agora."
      });
    }
  }

  public async refresh(request: Request, response: Response): Promise<Response> {
    const bodyRefreshToken = typeof request.body?.refreshToken === "string" ? request.body.refreshToken.trim() : "";
    const refreshToken = bodyRefreshToken || readCookie(request, REFRESH_COOKIE_NAME);

    if (!refreshToken || !this.sessionService) {
      if (!bodyRefreshToken) clearRefreshCookie(response);
      return response.status(401).json({ message: "Refresh token inválido ou expirado." });
    }

    const result = await this.sessionService.rotate(refreshToken);

    if (!result) {
      if (!bodyRefreshToken) clearRefreshCookie(response);
      return response.status(401).json({ message: "Refresh token inválido ou expirado." });
    }

    const { password: _password, ...user } = result.user;
    const { workspace, refreshToken: nextRefreshToken, ...tokens } = result.session;
    const webClient = isWebClient(request) || (!bodyRefreshToken && Boolean(refreshToken));
    if (webClient) setRefreshCookie(response, nextRefreshToken);
    return response.status(200).json({
      message: "Sessão renovada com sucesso.",
      ...tokens,
      ...(webClient ? {} : { refreshToken: nextRefreshToken }),
      organization: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role: workspace.role,
        permissions: workspace.permissions,
      },
      user,
    });
  }

  public async logout(request: Request, response: Response): Promise<Response> {
    if (request.auth?.sid && this.sessionService) {
      await this.sessionService.revoke(request.auth.sid);
    }

    clearRefreshCookie(response);
    return response.status(204).end();
  }
}
