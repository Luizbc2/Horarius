import type { Model, ModelStatic } from "sequelize";

import { database } from "../../config/database";

type DynamicRecord = Model<Record<string, unknown>, Record<string, unknown>>;

export type AuditEvent = {
  organizationId?: number | null;
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

export class AuditService {
  public async record(event: AuditEvent): Promise<void> {
    const model = database.getConnection().models.AuditLog as ModelStatic<DynamicRecord> | undefined;

    if (!model) {
      return;
    }

    await model.create({
      organizationId: event.organizationId ?? null,
      userId: event.userId ?? null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId === undefined || event.entityId === null ? null : String(event.entityId),
      metadata: event.metadata ?? null,
      ipAddress: event.ipAddress ?? null,
    });
  }
}

export const auditService = new AuditService();
