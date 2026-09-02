import { getRequestContext } from "../http/request-context";

export const getActiveOrganizationId = (): number | null => getRequestContext()?.organizationId ?? null;
export const getActiveMembershipId = (): number | null => getRequestContext()?.membershipId ?? null;
export const getActiveOrganizationRole = (): string | null => getRequestContext()?.organizationRole ?? null;

export const buildTenantWhere = (userId: number): { organizationId: number } | { userId: number } => {
  const organizationId = getActiveOrganizationId();
  return organizationId ? { organizationId } : { userId };
};

export const buildTenantOwnership = (userId: number): { userId: number; organizationId: number | null } => ({
  userId,
  organizationId: getActiveOrganizationId(),
});
