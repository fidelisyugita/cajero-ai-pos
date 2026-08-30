import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { Alert, DevSettings } from "react-native";
import { expoDb } from "@/db/drizzle";
import * as StorageModule from "@/lib/Storage";
import * as PostLogoutModule from "@/services/endpoints/postLogout";
import { SyncService } from "@/services/SyncService";
import { useAuthStore } from "@/store/useAuthStore";
import { LogoutService } from "../LogoutService";
import Logger from "../logger";

jest.mock("@/db/drizzle", () => ({
  expoDb: {
    closeSync: jest.fn(),
  },
}));

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///mock/documents/",
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

describe("LogoutService", () => {
  let reloadSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  let routerReplaceSpy: jest.SpyInstance;
  let clearAllStorageSpy: jest.SpyInstance;
  let postLogoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isLoggedIn: true,
      user: {
        id: "user-1",
        name: "Cashier",
        email: "cashier@cajero.app",
        phone: null,
        storeId: "store-1",
        roleCode: "CASHIER",
        imageUrl: null,
        accessToken: "token",
        refreshToken: "refresh",
        createdAt: null,
        updatedAt: null,
      },
    });

    if (!DevSettings.reload) {
      (DevSettings as any).reload = jest.fn();
    }
    reloadSpy = jest.spyOn(DevSettings, "reload").mockImplementation(() => {});
    loggerLogSpy = jest.spyOn(Logger, "log").mockImplementation(() => {});
    loggerWarnSpy = jest.spyOn(Logger, "warn").mockImplementation(() => {});
    loggerErrorSpy = jest.spyOn(Logger, "error").mockImplementation(() => {});
    routerReplaceSpy = jest.spyOn(router, "replace").mockImplementation(() => {});
    clearAllStorageSpy = jest.spyOn(StorageModule, "clearAllStorage").mockImplementation(() => {});
    postLogoutSpy = jest.spyOn(PostLogoutModule, "postLogout").mockResolvedValue(undefined);
  });

  afterEach(() => {
    reloadSpy?.mockRestore?.();
    loggerLogSpy?.mockRestore?.();
    loggerWarnSpy?.mockRestore?.();
    loggerErrorSpy?.mockRestore?.();
    routerReplaceSpy?.mockRestore?.();
    clearAllStorageSpy?.mockRestore?.();
    postLogoutSpy?.mockRestore?.();
  });

  it("should perform remote token revocation and full local logout", async () => {
    await LogoutService.performLogout();

    expect(postLogoutSpy).toHaveBeenCalledWith({ refreshToken: "refresh" }, { timeout: 3500 });
    expect(clearAllStorageSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeUndefined();
    expect(expoDb.closeSync).toHaveBeenCalledTimes(1);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith("file:///mock/documents/SQLite", {
      idempotent: true,
    });
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it("should proceed with local cleanup if remote logout fails or times out", async () => {
    postLogoutSpy.mockRejectedValueOnce(new Error("Network timeout"));

    await LogoutService.performLogout();

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      "Remote logout failed, proceeding with local cleanup:",
      expect.any(Error),
    );
    expect(clearAllStorageSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeUndefined();
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it("should skip remote logout if user has no refreshToken", async () => {
    useAuthStore.setState({
      isLoggedIn: true,
      user: {
        id: "user-1",
        name: "Cashier",
        email: "cashier@cajero.app",
        phone: null,
        storeId: "store-1",
        roleCode: "CASHIER",
        imageUrl: null,
        accessToken: "token",
        refreshToken: "",
        createdAt: null,
        updatedAt: null,
      },
    });

    await LogoutService.performLogout();

    expect(postLogoutSpy).not.toHaveBeenCalled();
    expect(clearAllStorageSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it("should fallback to router.replace if DevSettings.reload throws", async () => {
    reloadSpy.mockImplementation(() => {
      throw new Error("Reload not supported in production");
    });

    await LogoutService.performLogout();

    expect(clearAllStorageSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(routerReplaceSpy).toHaveBeenCalledWith("/(auth)/sign-in");
  });

  it("should handle error when closing database gracefully and continue", async () => {
    (expoDb.closeSync as jest.Mock).mockImplementation(() => {
      throw new Error("DB close failed");
    });

    await LogoutService.performLogout();

    expect(loggerLogSpy).toHaveBeenCalledWith("Error closing DB", expect.any(Error));
    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(1);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it("should catch top-level cleanup errors, log error, reset auth and redirect to sign-in", async () => {
    (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Disk permission denied"),
    );

    await LogoutService.performLogout();

    expect(loggerErrorSpy).toHaveBeenCalledWith("Logout failed", expect.any(Error));
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeUndefined();
    expect(routerReplaceSpy).toHaveBeenCalledWith("/(auth)/sign-in");
  });

  describe("performSafeLogout", () => {
    let alertSpy: jest.SpyInstance;
    let getUnsyncedCountSpy: jest.SpyInstance;
    let pushTransactionsSpy: jest.SpyInstance;
    let performLogoutSpy: jest.SpyInstance;

    beforeEach(() => {
      alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
      getUnsyncedCountSpy = jest.spyOn(SyncService, "getUnsyncedCount").mockResolvedValue(0);
      pushTransactionsSpy = jest.spyOn(SyncService, "pushTransactions").mockResolvedValue(true);
      performLogoutSpy = jest.spyOn(LogoutService, "performLogout").mockResolvedValue(undefined);
    });

    afterEach(() => {
      alertSpy.mockRestore();
      getUnsyncedCountSpy.mockRestore();
      pushTransactionsSpy.mockRestore();
      performLogoutSpy.mockRestore();
    });

    it("should proceed directly to performLogout if there are no unsynced transactions", async () => {
      getUnsyncedCountSpy.mockResolvedValueOnce(0);

      await LogoutService.performSafeLogout();

      expect(getUnsyncedCountSpy).toHaveBeenCalledTimes(1);
      expect(pushTransactionsSpy).not.toHaveBeenCalled();
      expect(performLogoutSpy).toHaveBeenCalledTimes(1);
    });

    it("should push transactions and performLogout if unsynced items exist and push succeeds", async () => {
      getUnsyncedCountSpy
        .mockResolvedValueOnce(3) // initial count
        .mockResolvedValueOnce(0); // count after push
      pushTransactionsSpy.mockResolvedValueOnce(true);

      await LogoutService.performSafeLogout();

      expect(pushTransactionsSpy).toHaveBeenCalledTimes(1);
      expect(performLogoutSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it("should show warning alert if pushTransactions fails", async () => {
      getUnsyncedCountSpy.mockResolvedValue(2);
      pushTransactionsSpy.mockResolvedValueOnce(false);

      await LogoutService.performSafeLogout();

      expect(pushTransactionsSpy).toHaveBeenCalledTimes(1);
      expect(performLogoutSpy).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(
        "Unsynced Transactions",
        "You have unsynced transactions. If you sign out now, this data will be deleted permanently. (2)",
        expect.any(Array),
      );
    });

    it("should show warning alert if pushTransactions throws an error", async () => {
      getUnsyncedCountSpy.mockResolvedValue(1);
      pushTransactionsSpy.mockRejectedValueOnce(new Error("Network offline"));

      await LogoutService.performSafeLogout();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "Push transactions on logout failed",
        expect.any(Error),
      );
      expect(performLogoutSpy).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it("should trigger force logout when Force Sign Out button in alert is pressed", async () => {
      getUnsyncedCountSpy.mockResolvedValue(2);
      pushTransactionsSpy.mockResolvedValue(false);

      alertSpy.mockImplementation((_title, _message, buttons) => {
        const forceBtn = buttons?.find((b: any) => b.text === "Force Sign Out");
        forceBtn?.onPress?.();
      });

      await LogoutService.performSafeLogout();

      expect(performLogoutSpy).toHaveBeenCalledTimes(1);
    });

    it("should trigger retry when Retry button in alert is pressed", async () => {
      getUnsyncedCountSpy
        .mockResolvedValueOnce(1) // 1st safe logout initial
        .mockResolvedValueOnce(1) // 1st safe logout after push attempt
        .mockResolvedValueOnce(1) // 1st safe logout remaining
        .mockResolvedValueOnce(1) // 2nd safe logout initial
        .mockResolvedValueOnce(0); // 2nd safe logout remaining after push
      pushTransactionsSpy
        .mockResolvedValueOnce(false) // 1st attempt fails
        .mockResolvedValueOnce(true); // 2nd attempt succeeds

      let retryCallback: (() => void) | undefined;
      alertSpy.mockImplementation((_title, _message, buttons) => {
        const retryBtn = buttons?.find((b: any) => b.text === "Retry");
        retryCallback = retryBtn?.onPress;
      });

      await LogoutService.performSafeLogout();

      expect(pushTransactionsSpy).toHaveBeenCalledTimes(1);
      expect(retryCallback).toBeDefined();

      await retryCallback?.();

      expect(pushTransactionsSpy).toHaveBeenCalledTimes(2);
      expect(performLogoutSpy).toHaveBeenCalledTimes(1);
    });
  });
});
