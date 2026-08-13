import type { UserRole } from "../../auth/auth.types";
import type { AdminUserRepository } from "../repositories/admin-user.repository";

type Failure = { success: false; statusCode: number; message: string };
type Success<T> = { success: true; data: T };

export class AdminUsersService {
  constructor(private readonly repository: AdminUserRepository) {}

  public async list(pageValue?: number, limitValue?: number, searchValue?: string) {
    const page = Math.max(1, Math.trunc(pageValue || 1));
    const limit = Math.min(100, Math.max(1, Math.trunc(limitValue || 50)));
    return this.repository.list({ page, limit, search: searchValue?.trim().slice(0, 120) ?? "" });
  }

  public async changeRole(actorId: number, targetId: number, role: string): Promise<Success<{ message: string; user: NonNullable<Awaited<ReturnType<AdminUserRepository["findById"]>>> }> | Failure> {
    if (role !== "admin" && role !== "user") return { success: false, statusCode: 400, message: "Papel de usuario invalido." };
    if (actorId === targetId) return { success: false, statusCode: 400, message: "Voce nao pode alterar o papel da propria conta." };
    const user = await this.repository.updateRole(targetId, role as UserRole);
    if (!user) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    return { success: true, data: { message: "Papel atualizado com sucesso.", user } };
  }

  public async changeStatus(actorId: number, targetId: number, active: unknown): Promise<Success<{ message: string; user: NonNullable<Awaited<ReturnType<AdminUserRepository["findById"]>>> }> | Failure> {
    if (typeof active !== "boolean") return { success: false, statusCode: 400, message: "Status de usuario invalido." };
    if (actorId === targetId) return { success: false, statusCode: 400, message: "Voce nao pode desativar ou reativar a propria conta." };
    const user = await this.repository.updateActive(targetId, active);
    if (!user) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    return { success: true, data: { message: active ? "Usuario ativado com sucesso." : "Usuario desativado com sucesso.", user } };
  }

  public async remove(actorId: number, targetId: number): Promise<Success<{ message: string }> | Failure> {
    if (actorId === targetId) return { success: false, statusCode: 400, message: "Voce nao pode excluir a propria conta." };
    if (!(await this.repository.delete(targetId))) return { success: false, statusCode: 404, message: "Usuario nao encontrado." };
    return { success: true, data: { message: "Usuario excluido com sucesso." } };
  }
}
