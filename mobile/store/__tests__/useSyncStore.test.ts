import { toDate } from "@/utils/Date";
import { useSyncStore } from "../useSyncStore";

describe("useSyncStore", () => {
  beforeEach(() => {
    useSyncStore.setState({
      isSyncing: false,
      lastSyncTime: null,
    });
  });

  it("should initialize with default state", () => {
    const state = useSyncStore.getState();
    expect(state.isSyncing).toBe(false);
    expect(state.lastSyncTime).toBeNull();
  });

  it("should update isSyncing state", () => {
    useSyncStore.getState().setIsSyncing(true);
    expect(useSyncStore.getState().isSyncing).toBe(true);

    useSyncStore.getState().setIsSyncing(false);
    expect(useSyncStore.getState().isSyncing).toBe(false);
  });

  it("should update lastSyncTime with Date instance", () => {
    const syncDate = toDate("2026-08-24T12:00:00Z") ?? new Date("2026-08-24T12:00:00Z");
    useSyncStore.getState().setLastSyncTime(syncDate);
    expect(useSyncStore.getState().lastSyncTime).toEqual(syncDate);
  });
});
