import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { DevSettings } from "react-native";
import { expoDb } from "@/db/drizzle";
import * as StorageModule from "@/lib/Storage";
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
  let loggerErrorSpy: jest.SpyInstance;
  let routerReplaceSpy: jest.SpyInstance;
  let clearAllStorageSpy: jest.SpyInstance;

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
    loggerErrorSpy = jest.spyOn(Logger, "error").mockImplementation(() => {});
    routerReplaceSpy = jest.spyOn(router, "replace").mockImplementation(() => {});
    clearAllStorageSpy = jest.spyOn(StorageModule, "clearAllStorage").mockImplementation(() => {});
  });

  afterEach(() => {
    reloadSpy?.mockRestore?.();
    loggerLogSpy?.mockRestore?.();
    loggerErrorSpy?.mockRestore?.();
    routerReplaceSpy?.mockRestore?.();
    clearAllStorageSpy?.mockRestore?.();
  });

  it("should perform full logout and trigger DevSettings.reload in development", async () => {
    await LogoutService.performLogout();

    expect(clearAllStorageSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().user).toBeUndefined();
    expect(expoDb.closeSync).toHaveBeenCalledTimes(1);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith("file:///mock/documents/SQLite", {
      idempotent: true,
    });
    expect(reloadSpy).toHaveBeenCalledTimes(1);
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
});
