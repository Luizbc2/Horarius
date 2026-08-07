import { PLATFORM_TABLES } from "../../platform/models/platform-models";

describe("Schedra platform schema", () => {
  it("declares enough domain tables for the complete platform", () => {
    expect(PLATFORM_TABLES).toHaveLength(24);
  });

  it("does not declare duplicated table names", () => {
    const tableNames = PLATFORM_TABLES.map((table) => table.tableName);

    expect(new Set(tableNames).size).toBe(tableNames.length);
  });

  it("documents the responsibility of every table", () => {
    expect(PLATFORM_TABLES.every((table) => table.purpose.trim().length > 0)).toBe(true);
  });
});
