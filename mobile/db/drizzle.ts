import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";

import migrations from "./migrations/migrations";

export const expoDb = openDatabaseSync("cajero.db", {
	enableChangeListener: true,
});
export const db = drizzle(expoDb);

export const initialize = (): Promise<ExpoSQLiteDatabase> => {
	return Promise.resolve(db);
};
export const useMigrationHelper = () => {
	return useMigrations(db, migrations);
};
