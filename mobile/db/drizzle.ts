import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";

import migrations from "./migrations/migrations";

export const expoDb = openDatabaseSync("cajero.db", {
  enableChangeListener: true,
});

try {
  expoDb.execSync("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
} catch {
  // Graceful fallback if PRAGMA execution fails in specific test environments
}

export const db = drizzle(expoDb);

export type DrizzleTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

let transactionQueue: Promise<unknown> = Promise.resolve();

/**
 * Runs a database transaction sequentially through an async mutex queue
 * to prevent concurrent SQLite 'BEGIN' collisions.
 */
export const runInTransaction = async <T>(callback: (tx: DrizzleTx) => Promise<T>): Promise<T> => {
  const previousQueue = transactionQueue;
  let resolveCurrent!: () => void;
  transactionQueue = new Promise<void>((resolve) => {
    resolveCurrent = resolve;
  });

  try {
    await previousQueue;
    return await db.transaction(callback);
  } finally {
    resolveCurrent();
  }
};

export const initialize = (): Promise<ExpoSQLiteDatabase> => {
  return Promise.resolve(db);
};

export const useMigrationHelper = () => {
  return useMigrations(db, migrations);
};
