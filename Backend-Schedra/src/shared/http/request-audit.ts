import type { Request } from "express";

import { auditService } from "../../platform/audit/audit.service";
import {
  getAuthenticatedOrganizationId,
  getAuthenticatedUserId,
} from "../../modules/auth/utils/auth-request.util";

export const recordRequestAudit = async (
  request: Request,
  action: string,
  entityType: string,
  entityId?: string | number | null,
  metadata?: Record<string, unknown>,
  organizationId?: number | null,
): Promise<void> => {
  await auditService.record({
    organizationId: organizationId === undefined ? getAuthenticatedOrganizationId(request) : organizationId,
    userId: getAuthenticatedUserId(request),
    action,
    entityType,
    entityId,
    metadata,
    ipAddress: request.ip,
  }).catch((error) => console.error(`${action} audit write failed.`, error));
};
