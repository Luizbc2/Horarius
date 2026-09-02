import { Request } from "express";

import { AccessTokenPayload } from "../auth.types";

export const getAuthenticatedUserPayload = (request: Request): AccessTokenPayload | null => {
  return request.auth ?? null;
};

export const getAuthenticatedUserId = (request: Request): number | null => {
  const payload = getAuthenticatedUserPayload(request);

  if (!payload?.sub) {
    return null;
  }

  const userId = Number(payload.sub);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

export const getAuthenticatedOrganizationId = (request: Request): number | null => {
  const organizationId = request.auth?.organizationId;
  return Number.isInteger(organizationId) && Number(organizationId) > 0 ? Number(organizationId) : null;
};
