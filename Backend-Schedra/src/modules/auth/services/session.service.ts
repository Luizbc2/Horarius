import { createHash, randomBytes } from "node:crypto";

import { env } from "../../../config/env";
import { tenantService, type TenantService } from "../../../platform/tenancy/tenant.service";
import type { WorkspaceContext } from "../../../platform/tenancy/tenant.types";
import type { AuthenticatedUser } from "../auth.types";
import { UserModel } from "../models/user.model";
import {
  SequelizeSessionRepository,
  type AuthSessionRecord,
  type SessionRepository,
} from "../repositories/session.repository";
import { generateAccessToken } from "../utils/jwt.util";

export type SessionMetadata = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type IssuedSession = {
  token: string;
  refreshToken: string;
  workspace: WorkspaceContext;
};

const hashRefreshToken = (token: string): string => createHash("sha256").update(token).digest("hex");
const createRefreshToken = (): string => randomBytes(48).toString("base64url");
const createExpiry = (): Date => new Date(Date.now() + env.jwt.refreshDays * 24 * 60 * 60 * 1000);

const toAuthenticatedUser = (user: UserModel): AuthenticatedUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  cpf: user.cpf,
  password: user.password,
  accountType: user.accountType,
  role: user.role,
  active: user.active,
  avatarUrl: user.avatarUrl,
});

export class SessionService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly tenancy: TenantService,
  ) {}

  public async issue(
    user: AuthenticatedUser,
    workspace: WorkspaceContext,
    metadata: SessionMetadata = {},
  ): Promise<IssuedSession> {
    const refreshToken = createRefreshToken();
    const session = await this.repository.create({
      userId: user.id,
      organizationId: workspace.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: createExpiry(),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    return {
      token: generateAccessToken(user, { sessionId: session.id, workspace }),
      refreshToken,
      workspace,
    };
  }

  public async rotate(refreshToken: string): Promise<{ session: IssuedSession; user: AuthenticatedUser } | null> {
    const current = await this.repository.findByRefreshTokenHash(hashRefreshToken(refreshToken));

    if (!this.isActive(current)) {
      return null;
    }

    const userModel = await UserModel.findByPk(current.userId);

    if (!userModel?.active) {
      await this.repository.revoke(current.id);
      return null;
    }

    const workspace = await this.tenancy.resolveForUser(userModel.id, current.organizationId);

    if (!workspace) {
      await this.repository.revoke(current.id);
      return null;
    }

    const nextRefreshToken = createRefreshToken();
    const rotated = await this.repository.rotate(
      current.id,
      current.refreshTokenHash,
      hashRefreshToken(nextRefreshToken),
      createExpiry(),
    );
    if (!rotated) return null;
    const user = toAuthenticatedUser(userModel);

    return {
      session: {
        token: generateAccessToken(user, { sessionId: current.id, workspace }),
        refreshToken: nextRefreshToken,
        workspace,
      },
      user,
    };
  }

  public async validate(sessionId: number, userId: number): Promise<AuthSessionRecord | null> {
    const session = await this.repository.findById(sessionId);
    return this.isActive(session) && session.userId === userId ? session : null;
  }

  public revoke(sessionId: number): Promise<void> {
    return this.repository.revoke(sessionId);
  }

  public async switchWorkspace(
    sessionId: number,
    user: AuthenticatedUser,
    workspace: WorkspaceContext,
  ): Promise<string> {
    await this.repository.setOrganization(sessionId, workspace.id);
    return generateAccessToken(user, { sessionId, workspace });
  }

  public revokeAllForUser(userId: number): Promise<void> {
    return this.repository.revokeAllForUser(userId);
  }

  public revokeAllForUserExcept(userId: number, sessionId: number): Promise<void> {
    return this.repository.revokeAllForUserExcept(userId, sessionId);
  }

  private isActive(session: AuthSessionRecord | null): session is AuthSessionRecord {
    return Boolean(session && !session.revokedAt && session.expiresAt.getTime() > Date.now());
  }
}

export const sessionService = new SessionService(new SequelizeSessionRepository(), tenantService);
