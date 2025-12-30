import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import React, {
	type PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { View, Text } from "react-native";
import { expoDb, initialize, useMigrationHelper } from "./drizzle";

type ContextType = { db: SQLJsDatabase | ExpoSQLiteDatabase | null };

export const DatabaseContext = React.createContext<ContextType>({ db: null });

export const useDatabase = () => useContext(DatabaseContext);

export function DatabaseProvider({ children }: PropsWithChildren) {
	const [db, setDb] = useState<SQLJsDatabase | ExpoSQLiteDatabase | null>(null);
	const { success, error } = useMigrationHelper();

	useDrizzleStudio(expoDb);

	useEffect(() => {
		if (db) return;
		initialize().then((newDb) => {
			setDb(newDb);
		});
	}, [db]);

	if (error) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Migration Error: {error.message}</Text>
			</View>
		);
	}

	if (!success) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Migrating Database...</Text>
			</View>
		);
	}

	return (
		<DatabaseContext.Provider value={{ db }}>
			{children}
		</DatabaseContext.Provider>
	);
}
