import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db, initialize, runInTransaction, useMigrationHelper } from "../drizzle";
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
    transaction: jest.fn(async (cb) => cb({ select: jest.fn() })),
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

  it("executes transactions sequentially via runInTransaction", async () => {
    const order: number[] = [];
    (db.transaction as jest.Mock).mockImplementation(async (cb) => {
      return cb({});
    });

    const p1 = runInTransaction(async () => {
      await new Promise((r) => setTimeout(r, 20));
      order.push(1);
      return "res1";
    });

    const p2 = runInTransaction(async () => {
      order.push(2);
      return "res2";
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toBe("res1");
    expect(res2).toBe("res2");
    expect(order).toEqual([1, 2]);
  });
});
