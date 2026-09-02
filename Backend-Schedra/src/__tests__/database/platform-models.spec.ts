import { PLATFORM_TABLES } from "../../platform/models/platform-models";

describe("Schedra platform schema", () => {
  it("declares enough domain tables for the complete platform", () => {
    expect(PLATFORM_TABLES.length).toBeGreaterThanOrEqual(24);
    expect(PLATFORM_TABLES.map((table) => table.tableName)).toEqual(expect.arrayContaining([
      "organizations",
      "memberships",
      "auth_sessions",
      "appointment_slots",
      "audit_logs",
    ]));
  });

  it("does not declare duplicated table names", () => {
    const tableNames = PLATFORM_TABLES.map((table) => table.tableName);

    expect(new Set(tableNames).size).toBe(tableNames.length);
  });

  it("documents the responsibility of every table", () => {
    expect(PLATFORM_TABLES.every((table) => table.purpose.trim().length > 0)).toBe(true);
  });
});
