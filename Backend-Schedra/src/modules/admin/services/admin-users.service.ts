import type { UserRole } from "../../auth/auth.types";
import type { AdminUserRepository } from "../repositories/admin-user.repository";
import type { AuditService } from "../../../platform/audit/audit.service";
import type { SessionService } from "../../auth/services/session.service";

type Failure = { success: false; statusCode: number; message: string };
type Success<T> = { success: true; data: T };

export class AdminUsersService {
  constructor(
    private readonly repository: AdminUserRepository,
    private readonly sessions?: SessionService,
    private readonly audit?: AuditService,
  ) {}

  public async list(pageValue?: number, limitValue?: number, searchValue?: string) {
    const page = Math.max(1, Math.trunc(pageValue || 1));
    const limit = Math.min(100, Math.max(1, Math.trunc(limitValue || 50)));
    return this.repository.list({ page, limit, search: searchValue?.trim().slice(0, 120) ?? "" });
  }

  public async changeRole(actorId: number, targetId: number, role: string): Promise<Success<{ message: string; user: NonNullable<Awaited<ReturnType<AdminUserRepository["findById"]>>> }> | Failure> {
    if (role !== "admin" && role !== "user") return { success: false, statusCode: 400, message: "Papel de usuario invalido." };
    if (actorId === targetId) return { success: false, statusCode: 400, message: "Voce nao pode alterar o papel da propria conta." };
    const target = await this.repository.findById(targetId);
    if (!target) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    if (target.role === "admin" && role !== "admin" && await this.isLastActiveAdmin()) {
      return { success: false, statusCode: 409, message: "O ultimo administrador ativo nao pode ser rebaixado." };
    }
    const user = await this.repository.updateRole(targetId, role as UserRole);
    if (!user) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    await this.sessions?.revokeAllForUser(targetId);
    await this.audit?.record({ userId: actorId, action: "admin.user.role_changed", entityType: "user", entityId: targetId, metadata: { from: target.role, to: role } });
    return { success: true, data: { message: "Papel atualizado com sucesso.", user } };
  }

  public async changeStatus(actorId: number, targetId: number, active: unknown): Promise<Success<{ message: string; user: NonNullable<Awaited<ReturnType<AdminUserRepository["findById"]>>> }> | Failure> {
    if (typeof active !== "boolean") return { success: false, statusCode: 400, message: "Status de usuario invalido." };
    if (actorId === targetId) return { success: false, statusCode: 400, message: "Voce nao pode desativar ou reativar a propria conta." };
    const target = await this.repository.findById(targetId);
    if (!target) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    if (!active && target.role === "admin" && await this.isLastActiveAdmin()) {
      return { success: false, statusCode: 409, message: "O ultimo administrador ativo nao pode ser desativado." };
    }
    const user = await this.repository.updateActive(targetId, active);
    if (!user) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    if (!active) await this.sessions?.revokeAllForUser(targetId);
    await this.audit?.record({ userId: actorId, action: active ? "admin.user.activated" : "admin.user.deactivated", entityType: "user", entityId: targetId });
    return { success: true, data: { message: active ? "Usuario ativado com sucesso." : "Usuario desativado com sucesso.", user } };
  }

  public async remove(actorId: number, targetId: number): Promise<Success<{ message: string }> | Failure> {
    if (actorId === targetId) return { success: false, statusCode: 400, message: "Voce nao pode excluir a propria conta." };
    const target = await this.repository.findById(targetId);
    if (!target) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    if (target.role === "admin" && await this.isLastActiveAdmin()) {
      return { success: false, statusCode: 409, message: "O ultimo administrador ativo nao pode ser excluido." };
    }
    if (!(await this.repository.delete(targetId))) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    await this.sessions?.revokeAllForUser(targetId);
    await this.audit?.record({ userId: actorId, action: "admin.user.archived", entityType: "user", entityId: targetId });
    return { success: true, data: { message: "Usuario excluido com sucesso." } };
  }

  private async isLastActiveAdmin(): Promise<boolean> {
    if (this.repository.countActiveAdmins) return (await this.repository.countActiveAdmins()) <= 1;
    const page = await this.repository.list({ page: 1, limit: 100, search: "" });
    return page.data.filter((user) => user.role === "admin" && user.active).length <= 1;
  }
}
