import { act, renderHook } from "@testing-library/react-native";
import { queryClient } from "@/lib/ReactQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useSyncStore } from "@/store/useSyncStore";
import Logger from "../../logger";
import { SyncService } from "../../SyncService";
import { useSync } from "../useSync";

jest.mock("../../SyncService", () => ({
  SyncService: {
    syncAll: jest.fn(),
  },
}));

jest.mock("@/lib/ReactQuery", () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

jest.mock("../../logger", () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe("useSync hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ isLoggedIn: false });
    useSyncStore.setState({ isSyncing: false, lastSyncTime: null });
  });

  it("does not trigger sync when user is not logged in", async () => {
    useAuthStore.setState({ isLoggedIn: false });

    await renderHook(() => useSync());

    expect(SyncService.syncAll).not.toHaveBeenCalled();
    expect(useSyncStore.getState().isSyncing).toBe(false);
  });

  it("triggers sync immediately and invalidates queries on success when logged in", async () => {
    useAuthStore.setState({ isLoggedIn: true });
    (SyncService.syncAll as jest.Mock).mockResolvedValueOnce(undefined);

    await renderHook(() => useSync());

    await act(async () => {
      await Promise.resolve();
    });

    expect(SyncService.syncAll).toHaveBeenCalledTimes(1);
    expect(useSyncStore.getState().lastSyncTime).toBeInstanceOf(Date);
    expect(useSyncStore.getState().isSyncing).toBe(false);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["products"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["product-categories"],
    });
  });

  it("handles sync errors gracefully without crashing and resets isSyncing", async () => {
    useAuthStore.setState({ isLoggedIn: true });
    (SyncService.syncAll as jest.Mock).mockRejectedValueOnce(new Error("Sync exploded"));

    await renderHook(() => useSync());

    await act(async () => {
      await Promise.resolve();
    });

    expect(Logger.error).toHaveBeenCalledWith("Sync failed", expect.any(Error));
    expect(useSyncStore.getState().isSyncing).toBe(false);
  });

  it("sets up 5-minute interval and clears it on unmount", async () => {
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    useAuthStore.setState({ isLoggedIn: true });
    (SyncService.syncAll as jest.Mock).mockResolvedValue(undefined);

    const { unmount } = await renderHook(() => useSync());

    await act(async () => {
      await Promise.resolve();
    });

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000);

    // Execute interval callback
    const intervalCallback = setIntervalSpy.mock.calls[0][0];
    await act(async () => {
      await intervalCallback();
    });

    expect(SyncService.syncAll).toHaveBeenCalledTimes(2);

    await act(async () => {
      unmount();
    });

    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });
});
