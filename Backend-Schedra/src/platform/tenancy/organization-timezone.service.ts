import type { Model, ModelStatic } from "sequelize";

import { database } from "../../config/database";
import { env } from "../../config/env";
import { getActiveOrganizationId } from "../../shared/data/tenant-scope";
import { normalizeTimeZone } from "../../shared/utils/time-zone.util";

type DynamicRecord = Model<Record<string, unknown>, Record<string, unknown>>;

export const resolveActiveOrganizationTimeZone = async (): Promise<string> => {
  const organizationId = getActiveOrganizationId();
  const Organization = database.getConnection().models.Organization as ModelStatic<DynamicRecord> | undefined;
  if (!organizationId || !Organization) return normalizeTimeZone(env.timeZone);
  const organization = await Organization.findByPk(organizationId);
  return normalizeTimeZone(String(organization?.get("timezone") ?? env.timeZone));
};
