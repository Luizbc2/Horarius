import { Op, type Model, type ModelStatic } from "sequelize";

import { database } from "../../../config/database";

type DynamicRecord = Model<Record<string, unknown>, Record<string, unknown>>;

export type AuthSessionRecord = {
  id: number;
  userId: number;
  organizationId: number | null;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date;
};

export type CreateAuthSessionInput = {
  userId: number;
  organizationId?: number | null;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export interface SessionRepository {
  create(input: CreateAuthSessionInput): Promise<AuthSessionRecord>;
  findById(id: number): Promise<AuthSessionRecord | null>;
  findByRefreshTokenHash(hash: string): Promise<AuthSessionRecord | null>;
  rotate(id: number, currentRefreshTokenHash: string, nextRefreshTokenHash: string, expiresAt: Date): Promise<boolean>;
  setOrganization(id: number, organizationId: number): Promise<void>;
  revoke(id: number): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
  revokeAllForUserExcept(userId: number, sessionId: number): Promise<void>;
}

const toRecord = (record: DynamicRecord): AuthSessionRecord => ({
  id: Number(record.get("id")),
  userId: Number(record.get("userId")),
  organizationId: record.get("organizationId") === null ? null : Number(record.get("organizationId")),
  refreshTokenHash: String(record.get("refreshTokenHash")),
  expiresAt: new Date(String(record.get("expiresAt"))),
  revokedAt: record.get("revokedAt") ? new Date(String(record.get("revokedAt"))) : null,
  lastUsedAt: new Date(String(record.get("lastUsedAt"))),
});

export class SequelizeSessionRepository implements SessionRepository {
  private get model(): ModelStatic<DynamicRecord> {
    const model = database.getConnection().models.AuthSession as ModelStatic<DynamicRecord> | undefined;

    if (!model) {
      throw new Error("AuthSession model is not initialized.");
    }

    return model;
  }

  public async create(input: CreateAuthSessionInput): Promise<AuthSessionRecord> {
    const record = await this.model.create({
      ...input,
      organizationId: input.organizationId ?? null,
      userAgent: input.userAgent?.slice(0, 512) ?? null,
      ipAddress: input.ipAddress?.slice(0, 64) ?? null,
      lastUsedAt: new Date(),
      revokedAt: null,
    });
    return toRecord(record);
  }

  public async findById(id: number): Promise<AuthSessionRecord | null> {
    const record = await this.model.findByPk(id);
    return record ? toRecord(record) : null;
  }

  public async findByRefreshTokenHash(hash: string): Promise<AuthSessionRecord | null> {
    const record = await this.model.findOne({ where: { refreshTokenHash: hash } });
    return record ? toRecord(record) : null;
  }

  public async rotate(
    id: number,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const [updated] = await this.model.update(
      { refreshTokenHash: nextRefreshTokenHash, expiresAt, lastUsedAt: new Date() },
      { where: { id, refreshTokenHash: currentRefreshTokenHash, revokedAt: null } },
    );
    return updated === 1;
  }

  public async setOrganization(id: number, organizationId: number): Promise<void> {
    await this.model.update({ organizationId, lastUsedAt: new Date() }, { where: { id, revokedAt: null } });
  }

  public async revoke(id: number): Promise<void> {
    await this.model.update({ revokedAt: new Date() }, { where: { id, revokedAt: null } });
  }

  public async revokeAllForUser(userId: number): Promise<void> {
    await this.model.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
  }

  public async revokeAllForUserExcept(userId: number, sessionId: number): Promise<void> {
    await this.model.update(
      { revokedAt: new Date() },
      { where: { userId, id: { [Op.ne]: sessionId }, revokedAt: null } },
    );
  }
}
