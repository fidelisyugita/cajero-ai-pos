import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { Alert, DevSettings } from "react-native";
import { expoDb } from "@/db/drizzle";
import { clearAllStorage } from "@/lib/Storage";
import { postLogout } from "@/services/endpoints/postLogout";
import { t } from "@/services/i18n";
import Logger from "@/services/logger";
import { SyncService } from "@/services/SyncService";
import { useAuthStore } from "@/store/useAuthStore";
import { useLoadingStore } from "@/store/useLoadingStore";

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
    expoDb.closeSync();
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

const attemptPush = async (): Promise<boolean> => {
  useLoadingStore.getState().showLoading();
  try {
    const success = await SyncService.pushTransactions();
    const remaining = await SyncService.getUnsyncedCount();
    return success && remaining === 0;
  } catch (error) {
    Logger.error("Push transactions on logout failed", error);
    return false;
  } finally {
    useLoadingStore.getState().hideLoading();
  }
};

const promptUnsyncedWarning = (
  unsyncedCount: number,
  onRetry: () => Promise<void> | void,
  onForceLogout: () => Promise<void> | void,
): void => {
  const message = `${t("unsynced_logout_warning")} (${unsyncedCount})`;
  Alert.alert(t("unsynced_logout_title"), message, [
    { text: t("cancel"), style: "cancel" },
    { text: t("retry"), onPress: onRetry },
    { text: t("force_sign_out"), style: "destructive", onPress: onForceLogout },
  ]);
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

  performSafeLogout: async () => {
    const unsyncedCount = await SyncService.getUnsyncedCount();
    if (unsyncedCount === 0) {
      await LogoutService.performLogout();
      return;
    }

    const synced = await attemptPush();
    if (synced) {
      await LogoutService.performLogout();
      return;
    }

    const remaining = await SyncService.getUnsyncedCount();
    promptUnsyncedWarning(
      remaining,
      () => LogoutService.performSafeLogout(),
      () => LogoutService.performLogout(),
    );
  },
};
