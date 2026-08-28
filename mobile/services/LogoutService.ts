import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { DevSettings } from "react-native";
import { expoDb } from "@/db/drizzle";
import { clearAllStorage } from "@/lib/Storage";
import { postLogout } from "@/services/endpoints/postLogout";
import Logger from "@/services/logger";
import { useAuthStore } from "@/store/useAuthStore";

const revokeServerSession = async (refreshToken?: string): Promise<void> => {
  if (!refreshToken) return;
  try {
    await postLogout({ refreshToken }, { timeout: 3500 });
  } catch (error) {
    Logger.warn("Remote logout failed, proceeding with local cleanup:", error);
  }
};

const cleanLocalDatabase = async (): Promise<void> => {
  try {
    await expoDb.closeSync();
  } catch (error) {
    Logger.log("Error closing DB", error);
  }

  const dbDir = `${FileSystem.documentDirectory}SQLite`;
  await FileSystem.deleteAsync(dbDir, { idempotent: true });
};

const reloadOrRedirect = (): void => {
  try {
    DevSettings.reload();
  } catch (_e) {
    router.replace("/(auth)/sign-in");
  }
};

export const LogoutService = {
  performLogout: async () => {
    const refreshToken = useAuthStore.getState().user?.refreshToken;

    try {
      await revokeServerSession(refreshToken);
      clearAllStorage();
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      await cleanLocalDatabase();
      reloadOrRedirect();
    } catch (error) {
      Logger.error("Logout failed", error);
      useAuthStore.setState({ isLoggedIn: false, user: undefined });
      router.replace("/(auth)/sign-in");
    }
  },
};
