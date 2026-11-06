const { checkMigrations } = require("../check-migrations");

describe("check-migrations script", () => {
  it("succeeds when all migration files in journal exist and are registered", () => {
    const result = checkMigrations();
    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.count).toBeGreaterThan(0);
  });

  it("fails when journal file does not exist", () => {
    const result = checkMigrations({ journalPath: "/non-existent/_journal.json" });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain("Migration journal not found");
  });
});
