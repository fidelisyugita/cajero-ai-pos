import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { DevSettings } from "react-native";
import { expoDb } from "@/db/drizzle";
import { clearAllStorage } from "@/lib/Storage";
import Logger from "@/services/logger";
import { useAuthStore } from "@/store/useAuthStore";

export const LogoutService = {
  performLogout: async () => {
    try {
      // 1. Clear Zustand storage (MMKV)
      clearAllStorage();

      // 2. Clear Auth Store state in memory
      useAuthStore.setState({ isLoggedIn: false, user: undefined });

      // 3. Close SQLite Database
      try {
        await expoDb.closeSync();
      } catch (e) {
        Logger.log("Error closing DB", e);
      }

      // 4. Delete SQLite Database File
      const dbDir = `${FileSystem.documentDirectory}SQLite`;
      await FileSystem.deleteAsync(dbDir, { idempotent: true });

      // 5. Reload App to ensure fresh state
      // DevSettings.reload() works in development builds.
      // In production, we might just redirect, but reloading is safer for full clear.
      try {
        DevSettings.reload();
      } catch (_e) {
        // Fallback for production if reload fails or isn't available
        router.replace("/(auth)/sign-in");
      }
    } catch (error) {
      Logger.error("Logout failed", error);
      // Force redirect even if cleanup fails
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      router.replace("/(auth)/sign-in");
    }
  },
};
