import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db, initialize, useMigrationHelper } from "../drizzle";
import migrations from "../migrations/migrations";

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
  })),
}));

jest.mock("drizzle-orm/expo-sqlite", () => ({
  drizzle: jest.fn((client) => ({
    _client: client,
    select: jest.fn(),
    insert: jest.fn(),
  })),
}));

jest.mock("drizzle-orm/expo-sqlite/migrator", () => ({
  useMigrations: jest.fn(() => ({ success: true, error: null })),
}));

describe("Drizzle Helper (drizzle.ts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves the database instance via initialize()", async () => {
    const initializedDb = await initialize();
    expect(initializedDb).toBe(db);
  });

  it("calls useMigrations with the database and migrations bundle in useMigrationHelper()", () => {
    const result = useMigrationHelper();

    expect(useMigrations).toHaveBeenCalledWith(db, migrations);
    expect(result).toEqual({ success: true, error: null });
  });
});
