import { Op, type Model, type ModelStatic, type Sequelize, type Transaction } from "sequelize";

import { database } from "../../config/database";
import { env } from "../../config/env";
import { UserModel } from "../../modules/auth/models/user.model";
import {
  PLATFORM_PERMISSIONS,
  type OrganizationRole,
  type OrganizationSummary,
  type WorkspaceContext,
  type WorkspaceUser,
} from "./tenant.types";

type DynamicRecord = Model<Record<string, unknown>, Record<string, unknown>>;
type DynamicModel = ModelStatic<DynamicRecord>;

const ROLE_PERMISSIONS: Record<OrganizationRole, readonly string[]> = {
  owner: PLATFORM_PERMISSIONS,
  manager: PLATFORM_PERMISSIONS.filter((permission) => permission !== "organization:manage"),
  staff: PLATFORM_PERMISSIONS.filter((permission) =>
    ["appointments:read", "appointments:write", "clients:read", "clients:write", "professionals:read", "services:read"].includes(permission),
  ),
  viewer: PLATFORM_PERMISSIONS.filter((permission) => permission.endsWith(":read")),
};

const getModel = (sequelize: Sequelize, name: string): DynamicModel => {
  const model = sequelize.models[name] as DynamicModel | undefined;

  if (!model) {
    throw new Error(`Platform model ${name} is not initialized.`);
  }

  return model;
};

const getNumber = (record: DynamicRecord, key: string): number => Number(record.get(key));
const getString = (record: DynamicRecord, key: string): string => String(record.get(key));

const slugify = (value: string): string => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 48) || "workspace";

export class TenantService {
  private get sequelize(): Sequelize {
    return database.getConnection();
  }

  public async ensureDefaultWorkspace(user: WorkspaceUser): Promise<WorkspaceContext> {
    const existing = await this.resolveForUser(user.id);

    if (existing) {
      await this.backfillLegacyResources(user.id, existing.id);
      return existing;
    }

    return this.createOrganization(user, `${user.name} - Agenda`);
  }

  public async createOrganization(user: WorkspaceUser, requestedName: string): Promise<WorkspaceContext> {
    const name = requestedName.trim().slice(0, 120);

    if (name.length < 2) {
      throw new Error("O nome da organização deve ter pelo menos 2 caracteres.");
    }

    const workspace = await this.sequelize.transaction(async (transaction) => {
      const Organization = getModel(this.sequelize, "Organization");
      const Membership = getModel(this.sequelize, "Membership");
      const slug = `${slugify(name)}-${user.id}-${Date.now().toString(36)}`;
      const organization = await Organization.create({
        ownerUserId: user.id,
        name,
        slug,
        status: "active",
        timezone: env.timeZone,
      }, { transaction });
      const roles = await this.ensureRolesAndPermissions(getNumber(organization, "id"), transaction);
      const membership = await Membership.create({
        organizationId: getNumber(organization, "id"),
        userId: user.id,
        roleId: roles.owner,
        locationId: null,
        status: "active",
      }, { transaction });

      return {
        id: getNumber(organization, "id"),
        name: getString(organization, "name"),
        slug: getString(organization, "slug"),
        membershipId: getNumber(membership, "id"),
        role: "owner" as const,
        permissions: [...ROLE_PERMISSIONS.owner],
      };
    });

    await this.backfillLegacyResources(user.id, workspace.id);
    return workspace;
  }

  public async resolveForUser(userId: number, organizationId?: number | null): Promise<WorkspaceContext | null> {
    const Membership = getModel(this.sequelize, "Membership");
    const where: Record<string, unknown> = { userId, status: "active" };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const membership = await Membership.findOne({ where, order: [["id", "ASC"]] });

    if (!membership) {
      return null;
    }

    return this.hydrateMembership(membership);
  }

  public async listForUser(userId: number): Promise<OrganizationSummary[]> {
    const Membership = getModel(this.sequelize, "Membership");
    const memberships = await Membership.findAll({ where: { userId, status: "active" }, order: [["id", "ASC"]] });
    const contexts = await Promise.all(memberships.map((membership) => this.hydrateMembership(membership)));

    return contexts.map(({ membershipId: _membershipId, ...organization }) => organization);
  }

  public async addMember(
    actorUserId: number,
    organizationId: number,
    memberEmail: string,
    role: OrganizationRole,
  ): Promise<void> {
    const actor = await this.resolveForUser(actorUserId, organizationId);

    if (!actor?.permissions.includes("members:manage")) {
      throw new Error("Você não tem permissão para gerenciar membros desta organização.");
    }

    const user = await UserModel.findOne({ where: { email: memberEmail.trim().toLowerCase(), active: true } });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const Role = getModel(this.sequelize, "Role");
    const Membership = getModel(this.sequelize, "Membership");
    const roleRecord = await Role.findOne({ where: { organizationId, name: role } });

    if (!roleRecord) {
      throw new Error("Papel da organização não encontrado.");
    }

    await Membership.upsert({
      organizationId,
      userId: user.id,
      roleId: getNumber(roleRecord, "id"),
      locationId: null,
      status: "active",
    });
  }

  public async listMembers(actorUserId: number, organizationId: number): Promise<Array<{
    id: number;
    name: string;
    email: string;
    role: OrganizationRole;
    status: string;
  }>> {
    const actor = await this.resolveForUser(actorUserId, organizationId);
    if (!actor?.permissions.includes("members:manage")) {
      throw new Error("Você não tem permissão para visualizar os membros desta organização.");
    }
    const Membership = getModel(this.sequelize, "Membership");
    const Role = getModel(this.sequelize, "Role");
    const memberships = await Membership.findAll({ where: { organizationId }, order: [["id", "ASC"]] });

    return Promise.all(memberships.map(async (membership) => {
      const [user, role] = await Promise.all([
        UserModel.findByPk(getNumber(membership, "userId")),
        Role.findByPk(getNumber(membership, "roleId")),
      ]);
      return {
        id: user?.id ?? getNumber(membership, "userId"),
        name: user?.name ?? "Usuário removido",
        email: user?.email ?? "",
        role: (role ? getString(role, "name") : "viewer") as OrganizationRole,
        status: getString(membership, "status"),
      };
    }));
  }

  public async removeMember(actorUserId: number, organizationId: number, memberUserId: number): Promise<void> {
    const actor = await this.resolveForUser(actorUserId, organizationId);

    if (!actor?.permissions.includes("members:manage")) {
      throw new Error("Você não tem permissão para gerenciar membros desta organização.");
    }

    const Organization = getModel(this.sequelize, "Organization");
    const organization = await Organization.findByPk(organizationId);

    if (organization && getNumber(organization, "ownerUserId") === memberUserId) {
      throw new Error("O proprietário da organização não pode ser removido.");
    }

    const Membership = getModel(this.sequelize, "Membership");
    await Membership.update({ status: "removed" }, { where: { organizationId, userId: memberUserId } });
  }

  public async provisionAllExistingUsers(): Promise<void> {
    const users = await UserModel.findAll({ where: { active: true } });

    for (const user of users) {
      await this.ensureDefaultWorkspace({ id: user.id, name: user.name, email: user.email });
    }
  }

  private async hydrateMembership(membership: DynamicRecord): Promise<WorkspaceContext> {
    const Organization = getModel(this.sequelize, "Organization");
    const Role = getModel(this.sequelize, "Role");
    const RolePermission = getModel(this.sequelize, "RolePermission");
    const Permission = getModel(this.sequelize, "Permission");
    const organization = await Organization.findByPk(getNumber(membership, "organizationId"));
    const role = await Role.findByPk(getNumber(membership, "roleId"));

    if (!organization || !role || getString(organization, "status") !== "active") {
      throw new Error("Organização ou vínculo de acesso inválido.");
    }

    const links = await RolePermission.findAll({ where: { roleId: getNumber(role, "id") } });
    const permissionIds = links.map((link) => getNumber(link, "permissionId"));
    const permissions = permissionIds.length
      ? await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } })
      : [];

    return {
      id: getNumber(organization, "id"),
      name: getString(organization, "name"),
      slug: getString(organization, "slug"),
      membershipId: getNumber(membership, "id"),
      role: getString(role, "name") as OrganizationRole,
      permissions: permissions.map((permission) => getString(permission, "code")).sort(),
    };
  }

  private async ensureRolesAndPermissions(
    organizationId: number,
    transaction: Transaction,
  ): Promise<Record<OrganizationRole, number>> {
    const Permission = getModel(this.sequelize, "Permission");
    const Role = getModel(this.sequelize, "Role");
    const RolePermission = getModel(this.sequelize, "RolePermission");
    const permissionIds = new Map<string, number>();

    for (const code of PLATFORM_PERMISSIONS) {
      const [permission] = await Permission.findOrCreate({
        where: { code },
        defaults: { code, description: code.replace(":", " ") },
        transaction,
      });
      permissionIds.set(code, getNumber(permission, "id"));
    }

    const roleIds = {} as Record<OrganizationRole, number>;

    for (const roleName of Object.keys(ROLE_PERMISSIONS) as OrganizationRole[]) {
      const [role] = await Role.findOrCreate({
        where: { organizationId, name: roleName },
        defaults: {
          organizationId,
          name: roleName,
          description: `Papel ${roleName} da organização`,
          isSystem: true,
        },
        transaction,
      });
      const roleId = getNumber(role, "id");
      roleIds[roleName] = roleId;

      for (const permissionCode of ROLE_PERMISSIONS[roleName]) {
        await RolePermission.findOrCreate({
          where: { roleId, permissionId: permissionIds.get(permissionCode) },
          defaults: { roleId, permissionId: permissionIds.get(permissionCode) },
          transaction,
        });
      }
    }

    return roleIds;
  }

  private async backfillLegacyResources(userId: number, organizationId: number): Promise<void> {
    for (const modelName of ["Client", "Service", "Professional", "Appointment"]) {
      const model = this.sequelize.models[modelName] as DynamicModel | undefined;

      if (model?.rawAttributes.organizationId) {
        await model.update(
          { organizationId },
          { where: { userId, organizationId: null } },
        );
      }
    }

    const Professional = this.sequelize.models.Professional as DynamicModel | undefined;
    const Membership = getModel(this.sequelize, "Membership");
    const professionals = Professional?.rawAttributes.membershipId
      ? await Professional.findAll({ where: { organizationId, membershipId: null } })
      : [];

    for (const professional of professionals) {
      const email = String(professional.get("email") ?? "").trim().toLowerCase();
      if (!email) continue;
      const linkedUser = await UserModel.findOne({ where: { email, active: true } });
      if (!linkedUser) continue;
      const membership = await Membership.findOne({ where: { organizationId, userId: linkedUser.id, status: "active" } });
      if (membership) await professional.update({ membershipId: getNumber(membership, "id") });
    }
  }
}

export const tenantService = new TenantService();
