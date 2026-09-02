import { Op } from "sequelize";

import { database } from "../../../config/database";
import { UserModel } from "../../auth/models/user.model";
import type { UserRole } from "../../auth/auth.types";
import type { AdminUserDto, AdminUserPageDto } from "../dtos/admin-user.dto";

export type AdminUserListInput = { page: number; limit: number; search: string };

export interface AdminUserRepository {
  list(input: AdminUserListInput): Promise<AdminUserPageDto>;
  findById(id: number): Promise<AdminUserDto | null>;
  updateRole(id: number, role: UserRole): Promise<AdminUserDto | null>;
  updateActive(id: number, active: boolean): Promise<AdminUserDto | null>;
  delete(id: number): Promise<boolean>;
  countActiveAdmins?(): Promise<number>;
}

export class SequelizeAdminUserRepository implements AdminUserRepository {
  public async list(input: AdminUserListInput): Promise<AdminUserPageDto> {
    await this.ensureModel();
    const where = input.search ? { [Op.or]: [
      { name: { [Op.like]: `%${input.search}%` } },
      { email: { [Op.like]: `%${input.search}%` } },
      { cpf: { [Op.like]: `%${input.search}%` } },
    ] } : undefined;
    const { rows, count } = await UserModel.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: input.limit,
      offset: (input.page - 1) * input.limit,
    });
    return {
      data: rows.map((user) => this.toDto(user)),
      page: input.page,
      limit: input.limit,
      totalItems: count,
      totalPages: Math.max(1, Math.ceil(count / input.limit)),
    };
  }

  public async findById(id: number): Promise<AdminUserDto | null> {
    await this.ensureModel();
    const user = await UserModel.findByPk(id);
    return user ? this.toDto(user) : null;
  }

  public async updateRole(id: number, role: UserRole): Promise<AdminUserDto | null> {
    await this.ensureModel();
    const user = await UserModel.findByPk(id);
    if (!user) return null;
    user.role = role;
    await user.save();
    return this.toDto(user);
  }

  public async updateActive(id: number, active: boolean): Promise<AdminUserDto | null> {
    await this.ensureModel();
    const user = await UserModel.findByPk(id);
    if (!user) return null;
    user.active = active;
    await user.save();
    return this.toDto(user);
  }

  public async delete(id: number): Promise<boolean> {
    await this.ensureModel();
    return (await UserModel.destroy({ where: { id } })) > 0;
  }

  public async countActiveAdmins(): Promise<number> {
    await this.ensureModel();
    return UserModel.count({ where: { role: "admin", active: true } });
  }

  private toDto(user: UserModel): AdminUserDto {
    return { id: user.id, name: user.name, email: user.email, cpf: user.cpf, accountType: user.accountType, role: user.role, active: user.active, avatarUrl: user.avatarUrl ?? null, createdAt: user.createdAt };
  }

  private async ensureModel() {
    if (!UserModel.sequelize) await database.connect();
    if (!UserModel.sequelize) throw new Error("User model is not initialized.");
  }
}
