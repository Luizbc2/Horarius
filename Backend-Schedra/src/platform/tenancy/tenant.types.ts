export type OrganizationRole = "owner" | "manager" | "staff" | "viewer";

export type OrganizationSummary = {
  id: number;
  name: string;
  slug: string;
  role: OrganizationRole;
  permissions: string[];
};

export type WorkspaceContext = OrganizationSummary & {
  membershipId: number;
};

export type WorkspaceUser = {
  id: number;
  name: string;
  email: string;
};

export const PLATFORM_PERMISSIONS = [
  "appointments:read",
  "appointments:write",
  "clients:read",
  "clients:write",
  "professionals:read",
  "professionals:write",
  "services:read",
  "services:write",
  "members:manage",
  "organization:manage",
  "audit:read",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];
