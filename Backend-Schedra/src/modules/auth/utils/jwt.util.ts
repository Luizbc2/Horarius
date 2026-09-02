import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../../../config/env";
import { AuthenticatedUser } from "../auth.types";
import type { WorkspaceContext } from "../../../platform/tenancy/tenant.types";

type JwtPayload = {
  sub: string;
  email: string;
  role: "admin" | "user";
  sid?: number;
  organizationId?: number;
  membershipId?: number;
  organizationRole?: string;
  permissions?: string[];
};

type AccessTokenContext = {
  sessionId?: number;
  workspace?: WorkspaceContext | null;
};

export const generateAccessToken = (user: AuthenticatedUser, context: AccessTokenContext = {}): string => {
  const payload: JwtPayload = {
    sub: String(user.id),
    email: user.email,
    role: user.role ?? "user",
    ...(context.sessionId ? { sid: context.sessionId } : {}),
    ...(context.workspace ? {
      organizationId: context.workspace.id,
      membershipId: context.workspace.membershipId,
      organizationRole: context.workspace.role,
      permissions: context.workspace.permissions,
    } : {}),
  };

  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwt.secret, signOptions);
};
