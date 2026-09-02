import { LoginInput, LoginResponse } from "../auth.types";
import { UserRepository } from "../repositories/user.repository";
import { comparePassword } from "../utils/password.util";
import { generateAccessToken } from "../utils/jwt.util";
import { isValidEmail } from "../../../shared/utils/email.util";
import { INPUT_LIMITS } from "../../../shared/utils/input-validation.util";
import type { TenantService } from "../../../platform/tenancy/tenant.service";
import type { SessionMetadata, SessionService } from "./session.service";
import { env } from "../../../config/env";

type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenancy?: TenantService,
    private readonly sessions?: SessionService,
  ) {}

  public async execute(input: LoginInput, metadata: SessionMetadata = {}): Promise<ServiceResult<LoginResponse>> {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();

    if (!email || !password) {
      return {
        success: false,
        message: "E-mail e senha são obrigatórios.",
        statusCode: 400,
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400,
      };
    }

    if (email.length > INPUT_LIMITS.email) {
      return {
        success: false,
        message: "Formato de e-mail inválido.",
        statusCode: 400,
      };
    }

    if (password.length > INPUT_LIMITS.password) {
      return {
        success: false,
        message: `A senha deve ter no maximo ${INPUT_LIMITS.password} caracteres.`,
        statusCode: 400,
      };
    }

    let user;

    try {
      user = await this.userRepository.findByEmail(email);
    } catch {
      return {
        success: false,
        message: "O serviço de autenticação está indisponível no momento.",
        statusCode: 503,
      };
    }

    if (!user) {
      return {
        success: false,
        message: "E-mail ou senha inválidos.",
        statusCode: 401,
      };
    }

    if (user.active === false) {
      return {
        success: false,
        message: "Esta conta esta desativada. Procure um administrador.",
        statusCode: 403,
      };
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return {
        success: false,
        message: "E-mail ou senha inválidos.",
        statusCode: 401,
      };
    }

    const userAccountType = user.accountType ?? "business";

    const workspace = this.tenancy
      ? await this.tenancy.ensureDefaultWorkspace({ id: user.id, name: user.name, email: user.email })
      : null;
    const issuedSession = workspace && this.sessions
      ? await this.sessions.issue(user, workspace, metadata)
      : null;

    if (env.nodeEnv !== "test" && (!workspace || !issuedSession)) {
      return {
        success: false,
        message: "Não foi possível criar uma sessão segura agora.",
        statusCode: 503,
      };
    }

    return {
      success: true,
      data: {
        message: "Login realizado com sucesso.",
        token: issuedSession?.token ?? generateAccessToken(user, { workspace }),
        ...(issuedSession ? { refreshToken: issuedSession.refreshToken } : {}),
        ...(workspace ? {
          organization: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            role: workspace.role,
            permissions: workspace.permissions,
          },
        } : {}),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          accountType: userAccountType,
          role: user.role ?? "user",
          active: user.active ?? true,
          avatarUrl: user.avatarUrl ?? null,
        },
      },
    };
  }
}
