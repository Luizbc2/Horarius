import type { AdminUserDto } from "../../modules/admin/dtos/admin-user.dto";
import type { AdminUserListInput, AdminUserRepository } from "../../modules/admin/repositories/admin-user.repository";
import { AdminUsersService } from "../../modules/admin/services/admin-users.service";
import type { UserRole } from "../../modules/auth/auth.types";

const makeUser = (id: number, role: UserRole = "user"): AdminUserDto => ({ id, name: `Usuario ${id}`, email: `user${id}@schedra.com`, cpf: id === 1 ? "52998224725" : "11144477735", accountType: "business", role, active: true, avatarUrl: null, createdAt: new Date() });

class MemoryAdminRepository implements AdminUserRepository {
  public users = [makeUser(1, "admin"), makeUser(2)];
  async list(_input: AdminUserListInput) { return { data: this.users, page: 1, limit: 50, totalItems: this.users.length, totalPages: 1 }; }
  async findById(id: number) { return this.users.find((user) => user.id === id) ?? null; }
  async updateRole(id: number, role: UserRole) { const user = await this.findById(id); if (!user) return null; user.role = role; return user; }
  async updateActive(id: number, active: boolean) { const user = await this.findById(id); if (!user) return null; user.active = active; return user; }
  async delete(id: number) { const index = this.users.findIndex((user) => user.id === id); if (index < 0) return false; this.users.splice(index, 1); return true; }
}

describe("AdminUsersService", () => {
  it("permite promover e bloquear outro usuario", async () => {
    const repository = new MemoryAdminRepository();
    const service = new AdminUsersService(repository);
    const roleResult = await service.changeRole(1, 2, "admin");
    const statusResult = await service.changeStatus(1, 2, false);
    expect(roleResult.success && roleResult.data.user.role).toBe("admin");
    expect(statusResult.success && statusResult.data.user.active).toBe(false);
  });

  it("impede auto-rebaixamento e auto-bloqueio", async () => {
    const service = new AdminUsersService(new MemoryAdminRepository());
    expect(await service.changeRole(1, 1, "user")).toEqual({ success: false, statusCode: 400, message: "Voce nao pode alterar o papel da propria conta." });
    expect(await service.changeStatus(1, 1, false)).toEqual({ success: false, statusCode: 400, message: "Voce nao pode desativar ou reativar a propria conta." });
    expect(await service.remove(1, 1)).toEqual({ success: false, statusCode: 400, message: "Voce nao pode excluir a propria conta." });
  });

  it("permite excluir outro usuario", async () => {
    const repository = new MemoryAdminRepository();
    const result = await new AdminUsersService(repository).remove(1, 2);
    expect(result).toEqual({ success: true, data: { message: "Usuario excluido com sucesso." } });
    expect(repository.users).toHaveLength(1);
  });

  it("protege o ultimo administrador ativo", async () => {
    const repository = new MemoryAdminRepository();
    repository.users = [makeUser(1), makeUser(2, "admin")];
    const service = new AdminUsersService(repository);
    expect(await service.changeRole(1, 2, "user")).toMatchObject({ success: false, statusCode: 409 });
    expect(await service.changeStatus(1, 2, false)).toMatchObject({ success: false, statusCode: 409 });
    expect(await service.remove(1, 2)).toMatchObject({ success: false, statusCode: 409 });
  });
});
