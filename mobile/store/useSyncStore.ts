import { create } from "zustand";

interface SyncState {
  isSyncing: boolean;
  setIsSyncing: (isSyncing: boolean) => void;
  lastSyncTime: Date | null;
  setLastSyncTime: (date: Date) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  lastSyncTime: null,
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
}));
